import {
  computeAvatarInitials,
  evaluatePasswordPolicy,
  isValidEmailFormat,
  normalizeEmail,
  SEEDED_MOCK_USERS,
  toPublicAuthUser,
  type StoredMockUserRecord,
} from './mockUsers';
import { hashMockPassword, verifyMockPassword } from './passwordHash';
import type {
  AuthError,
  AuthSession,
  AuthStateChangeCallback,
  IAuthService,
  SignInCredentials,
  SignInResult,
  SignUpCredentials,
  SignUpResult,
} from './types';

export const AUTH_SESSION_STORAGE_KEY = 'sim_session';
export const AUTH_USERS_STORAGE_KEY = 'sim_users';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function safeGetStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function createAuthError(code: AuthError['code'], messageKey: string, message: string): AuthError {
  return { code, messageKey, message };
}

function generateMockSessionToken(userId: string): string {
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  return `mock_session_${userId}_${Date.now()}_${randomSuffix}`;
}

export class MockAuthService implements IAuthService {
  readonly isMockMode = true;
  readonly provider = 'mock' as const;

  private readonly subscribers = new Set<AuthStateChangeCallback>();
  private storageListenerAttached = false;

  private readRegisteredUsers(): StoredMockUserRecord[] {
    const storage = safeGetStorage();
    if (!storage) return [];
    const raw = storage.getItem(AUTH_USERS_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item): item is StoredMockUserRecord =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as StoredMockUserRecord).id === 'string' &&
          typeof (item as StoredMockUserRecord).email === 'string' &&
          typeof (item as StoredMockUserRecord).passwordHash === 'string'
      );
    } catch {
      return [];
    }
  }

  private writeRegisteredUsers(users: StoredMockUserRecord[]): void {
    const storage = safeGetStorage();
    if (!storage) return;
    storage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private getAllUsers(): StoredMockUserRecord[] {
    const customUsers = this.readRegisteredUsers();
    const seededByEmail = new Map<string, StoredMockUserRecord>();
    for (const user of SEEDED_MOCK_USERS) {
      seededByEmail.set(normalizeEmail(user.email), user);
    }
    for (const user of customUsers) {
      seededByEmail.set(normalizeEmail(user.email), user);
    }
    return Array.from(seededByEmail.values());
  }

  private readStoredSession(): AuthSession | null {
    const storage = safeGetStorage();
    if (!storage) return null;
    const raw = storage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        storage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return null;
      }
      const candidate = parsed as Partial<AuthSession>;
      if (
        !candidate.user ||
        typeof candidate.user.id !== 'string' ||
        typeof candidate.user.email !== 'string' ||
        typeof candidate.accessToken !== 'string' ||
        typeof candidate.expiresAt !== 'number'
      ) {
        storage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return null;
      }
      if (candidate.expiresAt <= Date.now()) {
        storage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return null;
      }
      return {
        user: candidate.user,
        accessToken: candidate.accessToken,
        expiresAt: candidate.expiresAt,
        provider: candidate.provider ?? 'mock',
      };
    } catch {
      storage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
  }

  private writeStoredSession(session: AuthSession | null): void {
    const storage = safeGetStorage();
    if (!storage) return;
    if (session) {
      storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      storage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  private notifySubscribers(session: AuthSession | null): void {
    for (const cb of this.subscribers) {
      cb(session);
    }
  }

  private ensureCrossTabSync(): void {
    if (this.storageListenerAttached || typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
      if (event.key === AUTH_SESSION_STORAGE_KEY) {
        this.notifySubscribers(this.readStoredSession());
      }
    });
    this.storageListenerAttached = true;
  }

  async getSession(): Promise<AuthSession | null> {
    return this.readStoredSession();
  }

  async signIn(credentials: SignInCredentials): Promise<SignInResult> {
    const email = normalizeEmail(credentials.email);
    const password = credentials.password;

    if (!email) {
      return {
        session: null,
        error: createAuthError('VALIDATION_ERROR', 'auth.errors.emailRequired', 'Email is required.'),
      };
    }
    if (!isValidEmailFormat(email)) {
      return {
        session: null,
        error: createAuthError('VALIDATION_ERROR', 'auth.errors.invalidEmail', 'Invalid email address.'),
      };
    }
    if (!password) {
      return {
        session: null,
        error: createAuthError('VALIDATION_ERROR', 'auth.errors.passwordRequired', 'Password is required.'),
      };
    }

    const userRecord = this.getAllUsers().find((u) => normalizeEmail(u.email) === email);
    if (!userRecord || !verifyMockPassword(password, userRecord.passwordHash)) {
      return {
        session: null,
        error: createAuthError(
          'INVALID_CREDENTIALS',
          'auth.errors.invalidCredentials',
          'Invalid email or password. Please try again.'
        ),
      };
    }

    const session: AuthSession = {
      user: toPublicAuthUser(userRecord),
      accessToken: generateMockSessionToken(userRecord.id),
      expiresAt: Date.now() + SESSION_DURATION_MS,
      provider: 'mock',
    };

    this.writeStoredSession(session);
    this.notifySubscribers(session);
    return { session, error: null };
  }

  async signUp(credentials: SignUpCredentials): Promise<SignUpResult> {
    const fullName = credentials.fullName.trim();
    const email = normalizeEmail(credentials.email);
    const password = credentials.password;

    if (!fullName) {
      return {
        user: null,
        session: null,
        error: createAuthError('VALIDATION_ERROR', 'auth.errors.fullNameRequired', 'Full name is required.'),
      };
    }
    if (fullName.length < 2) {
      return {
        user: null,
        session: null,
        error: createAuthError(
          'VALIDATION_ERROR',
          'auth.errors.fullNameMin',
          'Full name must be at least 2 characters.'
        ),
      };
    }
    if (!email) {
      return {
        user: null,
        session: null,
        error: createAuthError('VALIDATION_ERROR', 'auth.errors.emailRequired', 'Email is required.'),
      };
    }
    if (!isValidEmailFormat(email)) {
      return {
        user: null,
        session: null,
        error: createAuthError('VALIDATION_ERROR', 'auth.errors.invalidEmail', 'Invalid email address.'),
      };
    }

    const policy = evaluatePasswordPolicy(password);
    if (!policy.isValid) {
      return {
        user: null,
        session: null,
        error: createAuthError(
          'WEAK_PASSWORD',
          'auth.errors.weakPassword',
          'Password must be at least 8 characters with 1 uppercase letter and 1 number.'
        ),
      };
    }

    if (credentials.confirmPassword !== undefined && credentials.confirmPassword !== password) {
      return {
        user: null,
        session: null,
        error: createAuthError('PASSWORD_MISMATCH', 'auth.errors.passwordMismatch', 'Passwords do not match.'),
      };
    }

    const exists = this.getAllUsers().some((u) => normalizeEmail(u.email) === email);
    if (exists) {
      return {
        user: null,
        session: null,
        error: createAuthError('EMAIL_TAKEN', 'auth.errors.emailTaken', 'This email is already registered.'),
      };
    }

    const existingCustomUsers = this.readRegisteredUsers();
    const newRecord: StoredMockUserRecord = {
      id: `USR-REG-${Date.now().toString(36).toUpperCase()}`,
      email,
      fullName,
      role: 'WAREHOUSE_STAFF',
      avatarInitials: computeAvatarInitials(fullName),
      assignedWarehouses: ['WH-01'],
      passwordHash: hashMockPassword(password),
      createdAt: new Date().toISOString(),
    };

    this.writeRegisteredUsers([...existingCustomUsers, newRecord]);

    return {
      user: toPublicAuthUser(newRecord),
      session: null,
      error: null,
    };
  }

  async signOut(): Promise<void> {
    this.writeStoredSession(null);
    this.notifySubscribers(null);
  }

  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    this.ensureCrossTabSync();
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
}
