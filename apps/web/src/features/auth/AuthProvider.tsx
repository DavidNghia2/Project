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
  const [recoveryStatus, setRecoveryStatus] = useState<'checking' | 'slow' | 'unavailable'>();
  const retryRef = useRef<() => void>(() => {});
  const invalidateRef = useRef<() => void>(() => {});
  const verifiedToken = useRef<string | undefined>(undefined);
  const authAction = useRef(0);
  const lastSyncedIdentityRef = useRef<string | null>(null);

  useEffect(() => {
    let generation = 0;
    let running = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let eventTimer: ReturnType<typeof setTimeout> | undefined;
    let eventToken: string | undefined;
    const retryDelays = [1000, 2000, 4000];

    const invalidate = () => {
      generation += 1;
      running = false;
      eventToken = undefined;
      clearTimeout(retryTimer);
      clearTimeout(eventTimer);
    };

    const restore = async (attempt = 0) => {
      if (running) return;
      clearTimeout(retryTimer);
      const request = ++generation;
      running = true;
      setIsLoading(true);
      setRecoveryStatus('checking');
      if (!navigator.onLine && !service.isMockMode) {
        running = false;
        setRecoveryStatus('unavailable');
        return;
      }
      const slowTimer = setTimeout(() => {
        if (request === generation) setRecoveryStatus('slow');
      }, 3000);
      let deadline: ReturnType<typeof setTimeout> | undefined;
      try {
        const next = await Promise.race([
          service.getSession(),
          new Promise<never>((_, reject) => {
            deadline = setTimeout(() => reject(new Error('Session verification timed out')), 10_000);
          }),
        ]);
        if (request !== generation) return;
        verifiedToken.current = next?.accessToken;
        setSession(next);
        setRecoveryStatus(undefined);
        setIsLoading(false);
      } catch {
        if (request !== generation) return;
        setSession(null);
        setRecoveryStatus('unavailable');
        if (navigator.onLine && attempt < retryDelays.length) {
          retryTimer = setTimeout(() => void restore(attempt + 1), retryDelays[attempt]);
        }
      } finally {
        clearTimeout(slowTimer);
        clearTimeout(deadline);
        if (request === generation) running = false;
      }
    };
    const retry = () => void restore();
    const offline = () => {
      if (service.isMockMode) return;
      invalidate();
      verifiedToken.current = undefined;
      setSession(null);
      setIsLoading(true);
      setRecoveryStatus('unavailable');
    };
    const unsubscribe = service.onAuthStateChange((nextSession, token) => {
      if (token) {
        if (token === verifiedToken.current || token === eventToken) return;
        // Leave the Supabase Auth callback before calling any SDK methods.
        invalidate();
        setSession(null);
        setIsLoading(true);
        eventToken = token;
        eventTimer = setTimeout(retry, 0);
      } else {
        invalidate();
        verifiedToken.current = nextSession?.accessToken;
        setSession(nextSession);
        setRecoveryStatus(undefined);
        setIsLoading(false);
      }
    });
    retryRef.current = retry;
    invalidateRef.current = invalidate;
    if (!service.isMockMode) {
      window.addEventListener('online', retry);
      window.addEventListener('offline', offline);
    }
    retry();

    return () => {
      invalidate();
      unsubscribe();
      window.removeEventListener('online', retry);
      window.removeEventListener('offline', offline);
    };
  }, [service]);

  useEffect(() => {
    if (isLoading) return;
    const identityKey = session ? `${session.user.id}:${session.user.role ?? 'NO_ROLE'}` : null;
    if (identityKey === lastSyncedIdentityRef.current) return;

    lastSyncedIdentityRef.current = identityKey;
    if (session?.user.role) {
      setActiveRole(session.user.role);
    } else {
      resetRole();
    }
  }, [isLoading, session, setActiveRole, resetRole]);

  const signIn = useCallback(
    async (credentials: SignInCredentials): Promise<AuthError | null> => {
      const action = ++authAction.current;
      try {
        const result = await service.signIn(credentials);
        if (action !== authAction.current) return null;
        if (result.error) return result.error;
        invalidateRef.current();
        verifiedToken.current = result.session.accessToken;
        setSession(result.session);
        setRecoveryStatus(undefined);
        setIsLoading(false);
        return null;
      } catch {
        return { code: 'NETWORK_ERROR', messageKey: 'auth.errors.networkError', message: 'Unable to load your account. Please retry.' };
      }
    },
    [service]
  );

  const signUp = useCallback(
    async (
      credentials: SignUpCredentials
    ): Promise<{ user: AuthUser | null; session: AuthSession | null; error: AuthError | null }> => {
      const action = ++authAction.current;
      try {
        const result = await service.signUp(credentials);
        if (action !== authAction.current) return { user: null, session: null, error: null };
        if (result.error) return { user: null, session: null, error: result.error };
        if (result.session) {
          invalidateRef.current();
          verifiedToken.current = result.session.accessToken;
          setSession(result.session);
          setRecoveryStatus(undefined);
          setIsLoading(false);
        }
        return { user: result.user, session: result.session, error: null };
      } catch {
        return { user: null, session: null, error: { code: 'NETWORK_ERROR', messageKey: 'auth.errors.networkError', message: 'Unable to load your account. Please retry.' } };
      }
    },
    [service]
  );

  const signOut = useCallback(async (): Promise<void> => {
    const action = ++authAction.current;
    invalidateRef.current();
    verifiedToken.current = undefined;
    setSession(null);
    await service.signOut();
    if (action !== authAction.current) return;
    invalidateRef.current();
    setSession(null);
    setRecoveryStatus(undefined);
    setIsLoading(false);
    resetRole();
  }, [service, resetRole]);

  const refreshSession = useCallback(async (): Promise<void> => {
    const action = authAction.current;
    const token = verifiedToken.current;
    const nextSession = await service.getSession();
    if (action !== authAction.current || verifiedToken.current !== token) return;
    verifiedToken.current = nextSession?.accessToken;
    setSession(nextSession);
  }, [service]);

  const hasRole = useCallback(
    (roles: RoleCode | readonly RoleCode[]): boolean => {
      if (!session?.user?.role) return false;
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
      recoveryStatus,
      retrySession: () => retryRef.current(),
      isAuthenticated: Boolean(session?.user),
      isMockMode: service.isMockMode,
      signIn,
      signUp,
      signOut,
      refreshSession,
      hasRole,
    }),
    [session, isLoading, recoveryStatus, service.isMockMode, signIn, signUp, signOut, refreshSession, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
