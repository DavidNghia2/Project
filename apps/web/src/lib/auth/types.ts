import type { RoleCode } from '../../features/users-rbac/types';

export type AuthProviderKind = 'mock' | 'supabase';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  avatarInitials: string;
  assignedWarehouses: string[];
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
  provider: AuthProviderKind;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'WEAK_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR';

export interface AuthError {
  code: AuthErrorCode;
  /** Translation key mapped in i18n locales (auth.errors.*) */
  messageKey: string;
  message: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export type SignInResult =
  | { session: AuthSession; error: null }
  | { session: null; error: AuthError };

export type SignUpResult =
  | { user: AuthUser; session: AuthSession | null; error: null }
  | { user: null; session: null; error: AuthError };

export type AuthStateChangeCallback = (session: AuthSession | null) => void;

/**
 * Provider-agnostic authentication contract designed so MockAuthService can
 * later be replaced with SupabaseAuthService without changing UI components.
 */
export interface IAuthService {
  readonly isMockMode: boolean;
  readonly provider: AuthProviderKind;
  getSession(): Promise<AuthSession | null>;
  signIn(credentials: SignInCredentials): Promise<SignInResult>;
  signUp(credentials: SignUpCredentials): Promise<SignUpResult>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: AuthStateChangeCallback): () => void;
}
