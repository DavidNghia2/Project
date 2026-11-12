import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AUTH_SESSION_STORAGE_KEY,
  AUTH_USERS_STORAGE_KEY,
  MockAuthService,
} from '../mockAuthService';
import { hashMockPassword, verifyMockPassword } from '../passwordHash';

describe('passwordHash & MockAuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('produces irreversible salted digests and never embeds plaintext password', () => {
    const secret = 'SuperSecret#2026';
    const hashA = hashMockPassword(secret);
    const hashB = hashMockPassword(secret);

    expect(hashA).not.toBe(secret);
    expect(hashA).not.toContain(secret);
    expect(hashA).not.toBe(hashB); // unique salts
    expect(verifyMockPassword(secret, hashA)).toBe(true);
    expect(verifyMockPassword(secret, hashB)).toBe(true);
    expect(verifyMockPassword('WrongPassword1', hashA)).toBe(false);
  });

  it('signs in seeded demo accounts and stores session without plaintext passwords', async () => {
    const service = new MockAuthService();
    const res = await service.signIn({
      email: '  ADMIN@DEMO.COM ',
      password: 'Demo@1234',
    });

    expect(res.error).toBeNull();
    expect(res.session).not.toBeNull();
    expect(res.session?.user.email).toBe('admin@demo.com');
    expect(res.session?.user.role).toBe('ADMIN');

    const storedSessionRaw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY) ?? '';
    expect(storedSessionRaw).not.toContain('Demo@1234');
    expect(storedSessionRaw).not.toContain('passwordHash');
  });

  it('returns INVALID_CREDENTIALS on wrong password or unknown email', async () => {
    const service = new MockAuthService();
    const wrongPass = await service.signIn({
      email: 'admin@demo.com',
      password: 'WrongPassword1',
    });
    expect(wrongPass.session).toBeNull();
    expect(wrongPass.error?.code).toBe('INVALID_CREDENTIALS');

    const unknownUser = await service.signIn({
      email: 'missing@demo.com',
      password: 'Demo@1234',
    });
    expect(unknownUser.session).toBeNull();
    expect(unknownUser.error?.code).toBe('INVALID_CREDENTIALS');
    expect(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });

  it('registers a new account, hashes credentials in storage, and allows subsequent sign-in', async () => {
    const service = new MockAuthService();
    const signUpRes = await service.signUp({
      fullName: 'Nguyen Van Hung',
      email: 'hung.nguyen@warehouse.io',
      password: 'Warehouse99',
      confirmPassword: 'Warehouse99',
    });

    expect(signUpRes.error).toBeNull();
    expect(signUpRes.session).toBeNull();
    expect(signUpRes.user?.role).toBe('WAREHOUSE_STAFF');
    expect(signUpRes.user?.avatarInitials).toBe('NH');

    const usersRaw = localStorage.getItem(AUTH_USERS_STORAGE_KEY) ?? '';
    expect(usersRaw).toContain('hung.nguyen@warehouse.io');
    expect(usersRaw).not.toContain('Warehouse99'); // no plaintext stored

    // Signing in with new credentials succeeds
    const signInRes = await service.signIn({
      email: 'hung.nguyen@warehouse.io',
      password: 'Warehouse99',
    });
    expect(signInRes.error).toBeNull();
    expect(signInRes.session?.user.fullName).toBe('Nguyen Van Hung');
  });

  it('rejects duplicate email, weak password, and mismatched confirmation on signUp', async () => {
    const service = new MockAuthService();

    const dup = await service.signUp({
      fullName: 'Admin Clone',
      email: 'admin@demo.com',
      password: 'StrongPassword1',
      confirmPassword: 'StrongPassword1',
    });
    expect(dup.error?.code).toBe('EMAIL_TAKEN');

    const weak = await service.signUp({
      fullName: 'Weak User',
      email: 'weak@demo.com',
      password: 'abc',
      confirmPassword: 'abc',
    });
    expect(weak.error?.code).toBe('WEAK_PASSWORD');

    const mismatch = await service.signUp({
      fullName: 'Mismatch User',
      email: 'mismatch@demo.com',
      password: 'StrongPassword1',
      confirmPassword: 'StrongPassword2',
    });
    expect(mismatch.error?.code).toBe('PASSWORD_MISMATCH');
  });

  it('restores valid session across instances, purges expired/corrupt sessions, and clears on signOut', async () => {
    const serviceA = new MockAuthService();
    const stateChanges: Array<string | null> = [];
    const unsubscribe = serviceA.onAuthStateChange((s) => stateChanges.push(s?.user.email ?? null));

    await serviceA.signIn({ email: 'manager@demo.com', password: 'Demo@1234' });
    expect(stateChanges).toEqual(['manager@demo.com']);

    // Fresh instance mimics page reload
    const serviceB = new MockAuthService();
    const restored = await serviceB.getSession();
    expect(restored?.user.email).toBe('manager@demo.com');
    expect(restored?.user.role).toBe('WAREHOUSE_MANAGER');

    // Sign out clears storage and fires listener
    await serviceA.signOut();
    expect(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(stateChanges).toEqual(['manager@demo.com', null]);
    unsubscribe();

    // Corrupt JSON fails closed
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, '{corrupt-json');
    expect(await serviceB.getSession()).toBeNull();
    expect(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();

    // Expired session fails closed
    const warnSpy = vi.fn();
    localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        user: { id: '1', email: 'x@y.com', fullName: 'X', role: 'VIEWER', avatarInitials: 'X', assignedWarehouses: [] },
        accessToken: 'tok',
        expiresAt: Date.now() - 1000,
        provider: 'mock',
      })
    );
    expect(await serviceB.getSession()).toBeNull();
    expect(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
