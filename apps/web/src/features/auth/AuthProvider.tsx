import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from './authContext';
import {
  authService as defaultAuthService,
  type AuthError,
  type AuthSession,
  type AuthUser,
  type IAuthService,
  type SignInCredentials,
  type SignUpCredentials,
} from '../../lib/auth';
import { useRolePreview, type RoleCode } from '../users-rbac';

export interface AuthProviderProps {
  children: React.ReactNode;
  service?: IAuthService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  service = defaultAuthService,
}) => {
  const { setActiveRole, resetRole } = useRolePreview();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncedIdentityRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    service
      .getSession()
      .then((initialSession) => {
        if (!mounted) return;
        setSession(initialSession);
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setIsLoading(false);
      });

    const unsubscribe = service.onAuthStateChange((nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [service]);

  useEffect(() => {
    if (isLoading) return;
    const identityKey = session ? `${session.user.id}:${session.user.role}` : null;
    if (identityKey === lastSyncedIdentityRef.current) return;

    lastSyncedIdentityRef.current = identityKey;
    if (session) {
      setActiveRole(session.user.role);
    } else {
      resetRole();
    }
  }, [isLoading, session, setActiveRole, resetRole]);

  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<AuthError | null> => {
      const result = await service.signIn(credentials);
      if (result.error) {
        return result.error;
      }
      setSession(result.session);
      return null;
    },
    [service]
  );

  const signUp = useCallback(
    async (
      credentials: SignUpCredentials
    ): Promise<{ user: AuthUser | null; error: AuthError | null }> => {
      const result = await service.signUp(credentials);
      if (result.error) {
        return { user: null, error: result.error };
      }
      return { user: result.user, error: null };
    },
    [service]
  );

  const signOut = useCallback(async (): Promise<void> => {
    await service.signOut();
    setSession(null);
    resetRole();
  }, [service, resetRole]);

  const hasRole = useCallback(
    (roles: RoleCode | readonly RoleCode[]): boolean => {
      if (!session?.user) return false;
      if (Array.isArray(roles)) {
        return roles.includes(session.user.role);
      }
      return session.user.role === roles;
    },
    [session]
  );

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      isMockMode: service.isMockMode,
      signIn,
      signUp,
      signOut,
      hasRole,
    }),
    [session, isLoading, service.isMockMode, signIn, signUp, signOut, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
