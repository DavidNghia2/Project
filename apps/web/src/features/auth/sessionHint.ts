import { AUTH_SESSION_STORAGE_KEY } from '../../lib/auth';

/**
 * Synchronous, non-authoritative UI hint indicating whether browser storage
 * appears to contain a persisted auth session.
 *
 * Used strictly to choose between neutral vs. dashboard loading skeletons
 * while AuthProvider performs authoritative async session verification.
 */
export function hasStoredSessionHint(isMockMode: boolean): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    if (isMockMode) {
      return Boolean(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY));
    }

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !/^sb-.*-auth-token$/.test(key)) continue;
      const raw = window.localStorage.getItem(key);
      if (raw && raw !== 'null' && raw !== '{}') {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}
