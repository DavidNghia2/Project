import { createContext } from 'react';
import type { RoleCode } from '../users-rbac/types';
import type {
  AuthError,
  AuthSession,
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
} from '../../lib/auth';

export interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMockMode: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthError | null>;
  signUp: (credentials: SignUpCredentials) => Promise<{ user: AuthUser | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  hasRole: (roles: RoleCode | readonly RoleCode[]) => boolean;
}

export const DEFAULT_AUTH_CONTEXT_VALUE: AuthContextValue = {
  session: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isMockMode: true,
  signIn: async () => ({
    code: 'NETWORK_ERROR',
    messageKey: 'auth.errors.networkError',
    message: 'AuthProvider is not mounted.',
  }),
  signUp: async () => ({
    user: null,
    error: {
      code: 'NETWORK_ERROR',
      messageKey: 'auth.errors.networkError',
      message: 'AuthProvider is not mounted.',
    },
  }),
  signOut: async () => {},
  hasRole: () => false,
};

export const AuthContext = createContext<AuthContextValue>(DEFAULT_AUTH_CONTEXT_VALUE);
