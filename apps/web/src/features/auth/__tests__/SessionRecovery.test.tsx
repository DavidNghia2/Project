import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { I18nProvider } from '../../../i18n';
import type { AuthSession, AuthStateChangeCallback, IAuthService } from '../../../lib/auth';
import { RolePreviewProvider } from '../../users-rbac';
import { AuthProvider } from '../AuthProvider';
import { GuestRoute } from '../GuestRoute';
import { ProtectedRoute } from '../ProtectedRoute';

beforeEach(() => {
  localStorage.clear();
});

const session: AuthSession = {
  provider: 'supabase',
  accessToken: 'verified',
  expiresAt: Date.now() + 60_000,
  user: {
    id: 'user', email: 'test@example.test', fullName: 'Test', avatarInitials: 'T',
    role: 'ADMIN', company: { id: 'company', name: 'Test company', slug: 'test' },
    assignedWarehouses: [], isOwner: false, profileStatus: 'active', accessStatus: 'ready',
  },
};

function setup(getSession: IAuthService['getSession']) {
  let listener: AuthStateChangeCallback | undefined;
  const service: IAuthService = {
    provider: 'supabase', isMockMode: false, getSession,
    onAuthStateChange(callback) { listener = callback; return () => {}; },
    signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
  };
  render(
    <I18nProvider><RolePreviewProvider><AuthProvider service={service}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<p>Signed out</p>} />
          <Route path="/dashboard" element={<ProtectedRoute><p>Private inventory</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider></RolePreviewProvider></I18nProvider>
  );
  return (next: AuthSession | null) => listener?.(next);
}

it('keeps inventory hidden on a network error and resumes on reconnect', async () => {
  const restore = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(session);
  setup(restore);
  expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
  expect(screen.queryByText('Private inventory')).not.toBeInTheDocument();
  act(() => window.dispatchEvent(new Event('online')));
  expect(await screen.findByText('Private inventory')).toBeInTheDocument();
  expect(restore).toHaveBeenCalledTimes(2);
});

it('discards a session response that arrives after sign-out', async () => {
  let resolve!: (value: AuthSession) => void;
  const notify = setup(() => new Promise((done) => { resolve = done; }));
  await act(async () => {
    notify(null);
    resolve(session);
  });
  expect(screen.queryByText('Private inventory')).not.toBeInTheDocument();
  expect(screen.getByText('Signed out')).toBeInTheDocument();
});

it('never flashes dashboard skeleton on GuestRoute when unauthenticated user reloads (F5)', async () => {
  let resolve!: (value: AuthSession | null) => void;
  const service: IAuthService = {
    provider: 'supabase',
    isMockMode: false,
    getSession: () => new Promise((done) => { resolve = done; }),
    onAuthStateChange: () => () => {},
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };

  render(
    <I18nProvider>
      <RolePreviewProvider>
        <AuthProvider service={service}>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<p>Login Screen</p>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </RolePreviewProvider>
    </I18nProvider>
  );

  // Immediately shows the Guest screen with zero dashboard skeleton flash
  expect(screen.getByText('Login Screen')).toBeInTheDocument();
  expect(screen.queryByTestId('auth-loading')).not.toBeInTheDocument();

  await act(async () => {
    resolve(null);
  });
  expect(screen.getByText('Login Screen')).toBeInTheDocument();
});

it('shows neutral loader (not dashboard skeleton) on ProtectedRoute when no stored session exists', () => {
  const service: IAuthService = {
    provider: 'supabase',
    isMockMode: false,
    getSession: () => new Promise(() => {}),
    onAuthStateChange: () => () => {},
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };

  render(
    <I18nProvider>
      <RolePreviewProvider>
        <AuthProvider service={service}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><p>Private inventory</p></ProtectedRoute>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </RolePreviewProvider>
    </I18nProvider>
  );

  const loadingEl = screen.getByTestId('auth-loading');
  expect(loadingEl).toHaveAttribute('data-variant', 'neutral');
  expect(screen.queryByText('Private inventory')).not.toBeInTheDocument();
});

it('shows dashboard skeleton on ProtectedRoute when a stored session hint is present', () => {
  localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'tok' }));
  const service: IAuthService = {
    provider: 'supabase',
    isMockMode: false,
    getSession: () => new Promise(() => {}),
    onAuthStateChange: () => () => {},
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };

  render(
    <I18nProvider>
      <RolePreviewProvider>
        <AuthProvider service={service}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><p>Private inventory</p></ProtectedRoute>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </RolePreviewProvider>
    </I18nProvider>
  );

  const loadingEl = screen.getByTestId('auth-loading');
  expect(loadingEl).toHaveAttribute('data-variant', 'dashboard');
});

it('shows dashboard skeleton on GuestRoute when a stored session hint exists (e.g. logged-in reload at "/")', () => {
  localStorage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'tok' }));
  const service: IAuthService = {
    provider: 'supabase',
    isMockMode: false,
    getSession: () => new Promise(() => {}),
    onAuthStateChange: () => () => {},
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };

  render(
    <I18nProvider>
      <RolePreviewProvider>
        <AuthProvider service={service}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/" element={<p>Landing Screen</p>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </RolePreviewProvider>
    </I18nProvider>
  );

  const loadingEl = screen.getByTestId('auth-loading');
  expect(loadingEl).toHaveAttribute('data-variant', 'dashboard');
  expect(screen.queryByText('Landing Screen')).not.toBeInTheDocument();
});
