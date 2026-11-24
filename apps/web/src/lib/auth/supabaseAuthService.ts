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

type ProfileRow = { id: string; email: string; full_name: string; status: 'active' | 'inactive' };
type MembershipRow = {
  company_id: string;
  role_code: RoleCode;
  status: 'active' | 'inactive';
  is_owner: boolean;
};
type CompanyRow = { id: string; name: string; slug: string; status: 'active' | 'suspended' };
type WarehouseRow = { id: string; code: string; name: string };

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

async function toAuthSession(session: Session): Promise<AuthSession> {
  const user = session.user;
  const profileResult = await supabase
    .from('profiles')
    .select('id, email, full_name, status')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileResult.data as ProfileRow | null;
  if (profileResult.error || !profile) throw new Error('Unable to load your profile. Please retry.');
  const baseUser: AuthUser = {
    id: user.id,
    email: profile?.email ?? user.email ?? '',
    fullName: profile?.full_name || String(user.user_metadata.full_name ?? ''),
    role: null,
    avatarInitials: computeAvatarInitials(profile?.full_name || user.email || 'User'),
    assignedWarehouses: [],
    company: null,
    isOwner: false,
    profileStatus: profile.status,
    accessStatus: profile.status === 'active' ? 'no-company' : 'inactive',
  };

  if (profile.status !== 'active') {
    return {
      user: baseUser,
      accessToken: session.access_token,
      expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000,
      provider: 'supabase',
    };
  }

  const membershipResult = await supabase
    .from('memberships')
    .select('company_id, role_code, status, is_owner')
    .eq('user_id', user.id)
    .maybeSingle();
  const membership = membershipResult.data as MembershipRow | null;
  if (membershipResult.error) throw new Error('Unable to load your membership. Please retry.');

  if (!membership) {
    return {
      user: baseUser,
      accessToken: session.access_token,
      expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000,
      provider: 'supabase',
    };
  }

  if (membership.status !== 'active') {
    return { user: { ...baseUser, accessStatus: 'inactive' }, accessToken: session.access_token, expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000, provider: 'supabase' };
  }

  const companyResult = await supabase
    .from('companies')
    .select('id, name, slug, status')
    .eq('id', membership.company_id)
    .maybeSingle();
  const company = companyResult.data as CompanyRow | null;
  if (companyResult.error) throw new Error('Unable to load your company. Please retry.');

  if (!company || company.status !== 'active') {
    return {
      user: { ...baseUser, accessStatus: 'suspended' },
      accessToken: session.access_token,
      expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000,
      provider: 'supabase',
    };
  }

  const warehousesResult = await supabase
    .from('warehouses')
    .select('id, code, name')
    .eq('company_id', company.id)
    .eq('status', 'active');
  const warehouses = (warehousesResult.data ?? []) as WarehouseRow[];
  if (warehousesResult.error) throw new Error('Unable to load your warehouses. Please retry.');

  return {
    user: {
      ...baseUser,
      role: membership.role_code,
      isOwner: membership.is_owner,
      company: { id: company.id, name: company.name, slug: company.slug },
      accessStatus: 'ready',
      assignedWarehouses: warehouses.map((warehouse) => warehouse.code),
    },
    accessToken: session.access_token,
    expiresAt: (session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000,
    provider: 'supabase',
  };
}

export class SupabaseAuthService implements IAuthService {
  readonly isMockMode = false;
  readonly provider = 'supabase' as const;

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) return null;
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
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession) {
        callback(null);
        return;
      }
      void toAuthSession(nextSession).then(callback).catch(() => callback(null));
    });
    return () => data.subscription.unsubscribe();
  }
}
