import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { computeAvatarInitials } from './mockUsers';
import type {
  AuthError,
  AuthSession,
  AuthStateChangeCallback,
  AuthUser,
  IAuthService,
  SignInCredentials,
  SignInResult,
  SignUpCredentials,
  SignUpResult,
} from './types';
import type { RoleCode } from '../../features/users-rbac';

type ProfileRow = { email: string; full_name: string; status: 'active' | 'inactive' };

function authError(code: AuthError['code'], messageKey: string, message: string): AuthError {
  return { code, messageKey, message };
}

function mapSupabaseError(message: string): AuthError {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) {
    return authError('INVALID_CREDENTIALS', 'auth.errors.invalidCredentials', message);
  }
  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return authError('EMAIL_TAKEN', 'auth.errors.emailTaken', message);
  }
  if (normalized.includes('password')) {
    return authError('WEAK_PASSWORD', 'auth.errors.weakPassword', message);
  }
  return authError('NETWORK_ERROR', 'auth.errors.networkError', message);
}

type AccessContext = {
  profile: ProfileRow;
  access: NonNullable<AuthUser['accessStatus']>;
  company: AuthUser['company'];
  role: RoleCode | null;
  owner: boolean;
  warehouses: string[];
};

const pending = new Map<string, Promise<AuthSession>>();

function toAuthSession(session: Session): Promise<AuthSession> {
  const token = session.access_token;
  const existing = pending.get(token);
  if (existing) return existing;

  const request = verifyAccess(session).finally(() => pending.delete(token));
  pending.set(token, request);
  return request;
}

async function verifyAccess(session: Session): Promise<AuthSession> {
  const { data, error } = await supabase.rpc('get_my_access_context')
    .abortSignal(AbortSignal.timeout(10_000));
  if (error) throw error;
  if (!data) throw new Error('Missing access context.');

  const access = data as unknown as AccessContext;
  const email = access.profile.email || session.user.email || '';
  const fullName = access.profile.full_name || String(session.user.user_metadata.full_name ?? '');
  return {
    provider: 'supabase',
    accessToken: session.access_token,
    expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000,
    user: {
      id: session.user.id,
      email,
      fullName,
      avatarInitials: computeAvatarInitials(fullName || email || 'User'),
      profileStatus: access.profile.status,
      accessStatus: access.access,
      company: access.company,
      role: access.role,
      isOwner: access.owner,
      assignedWarehouses: access.warehouses,
    },
  };
}

export class SupabaseAuthService implements IAuthService {
  readonly isMockMode = false;
  readonly provider = 'supabase' as const;

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error && !['refresh_token_not_found', 'refresh_token_already_used', 'session_not_found', 'session_expired'].includes(error.code ?? '')) throw error;
    if (error || !data.session) return null;
    return toAuthSession(data.session);
  }

  async signIn(credentials: SignInCredentials): Promise<SignInResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    if (error || !data.session) {
      return { session: null, error: mapSupabaseError(error?.message ?? 'Unable to sign in.') };
    }
    return { session: await toAuthSession(data.session), error: null };
  }

  async signUp(credentials: SignUpCredentials): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password,
      options: { data: { full_name: credentials.fullName.trim() } },
    });
    if (error || !data.user) {
      return { user: null, session: null, error: mapSupabaseError(error?.message ?? 'Unable to register.') };
    }

    const session = data.session ? await toAuthSession(data.session) : null;
    const user: AuthUser = session?.user ?? {
      id: data.user.id,
      email: data.user.email ?? credentials.email.trim(),
      fullName: credentials.fullName.trim(),
      role: null,
      avatarInitials: computeAvatarInitials(credentials.fullName),
      assignedWarehouses: [],
      company: null,
      isOwner: false,
      profileStatus: 'active',
    };
    return { user, session, error: null };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION') return;
      callback(null, nextSession?.access_token);
    });
    return () => data.subscription.unsubscribe();
  }
}
