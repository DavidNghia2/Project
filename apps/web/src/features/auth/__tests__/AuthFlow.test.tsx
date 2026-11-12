import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '../../../i18n';
import { RolePreviewProvider } from '../../users-rbac';
import { AppLayout } from '../../../layouts/AppLayout';
import {
  AuthProvider,
  GuestRoute,
  ProtectedRoute,
  LoginPage,
  RegisterPage,
} from '../index';
import { LandingPage, DashboardPage, ProductsPage } from '../../../pages';
import { splitLeadingMetric } from '../../../pages/landingMotionPrimitives';
import { AUTH_SESSION_STORAGE_KEY, MockAuthService } from '../../../lib/auth';

function renderAuthApp(initialEntry = '/', service = new MockAuthService()) {
  return render(
    <I18nProvider>
      <RolePreviewProvider>
        <AuthProvider service={service}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route element={<GuestRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                </Route>
              </Route>
              <Route
                path="/admin-only"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <div>Admin Secret Zone</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </RolePreviewProvider>
    </I18nProvider>
  );
}

describe('Authentication UI & Route Guards', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows Landing Page at "/" when unauthenticated and redirects protected routes to "/"', async () => {
    renderAuthApp('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /warehouse inventory software|phần mềm quản lý kho/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('validates login inputs, shows error for invalid credentials, and allows successful demo login', async () => {
    const user = userEvent.setup();
    renderAuthApp('/login');

    await waitFor(() => {
      expect(document.getElementById('login-form')).toBeInTheDocument();
    });

    // Submit empty form -> validation errors
    await user.click(document.getElementById('btn-login-submit')!);
    expect(await screen.findByText(/email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    // Submit wrong password -> server error alert
    await user.type(document.getElementById('login-input-email')!, 'admin@demo.com');
    await user.type(document.getElementById('login-input-password')!, 'WrongPass123');
    await user.click(document.getElementById('btn-login-submit')!);
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();

    // Fill via Demo Account card and sign in -> redirects to Dashboard
    await user.click(screen.getByTestId('demo-account-WAREHOUSE_MANAGER'));
    await user.click(document.getElementById('btn-login-submit')!);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /warehouse dashboard/i })).toBeInTheDocument();
    });
    expect(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toContain('manager@demo.com');
  });

  it('registers a new account on /register with validation and signs in via /login', async () => {
    const user = userEvent.setup();
    renderAuthApp('/register');

    await waitFor(() => {
      expect(document.getElementById('register-form')).toBeInTheDocument();
    });

    // Weak password & mismatch validation
    await user.type(document.getElementById('register-input-fullname')!, 'Le Minh Tuan');
    await user.type(document.getElementById('register-input-email')!, 'tuan.le@factory.example');
    await user.type(document.getElementById('register-input-password')!, 'weak');
    await user.type(document.getElementById('register-input-confirm-password')!, 'different');
    await user.click(document.getElementById('btn-register-submit')!);

    expect(
      await screen.findByText(/at least 8 characters with 1 uppercase letter and 1 number/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/confirm password does not match/i)).toBeInTheDocument();

    // Fix inputs and register
    await user.clear(document.getElementById('register-input-password')!);
    await user.type(document.getElementById('register-input-password')!, 'Factory2026');
    await user.clear(document.getElementById('register-input-confirm-password')!);
    await user.type(document.getElementById('register-input-confirm-password')!, 'Factory2026');
    await user.click(document.getElementById('btn-register-submit')!);

    // Navigates to /login with success banner and prefilled email
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /sign in to smart inventory/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
    expect(document.getElementById('login-input-email')).toHaveValue('tuan.le@factory.example');

    // Sign in with newly created account -> enters Dashboard
    await user.type(document.getElementById('login-input-password')!, 'Factory2026');
    await user.click(document.getElementById('btn-login-submit')!);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /warehouse dashboard/i })).toBeInTheDocument();
    });
  });

  it('persists session across reload, blocks GuestRoute for signed-in user, enforces allowedRoles, and logs out to Landing Page', async () => {
    const user = userEvent.setup();
    const service = new MockAuthService();
    await service.signIn({ email: 'viewer@demo.com', password: 'Demo@1234' });

    // GuestRoute at /login bounces authenticated user to /dashboard
    const guestAttempt = renderAuthApp('/login', service);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /warehouse dashboard/i })).toBeInTheDocument();
    });

    // Logout from Topbar clears session and returns to Landing Page
    await user.click(screen.getByLabelText(/user account menu/i));
    expect(screen.getByText('viewer@demo.com')).toBeInTheDocument();
    await user.click(document.getElementById('btn-topbar-logout')!);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /warehouse inventory software/i })
      ).toBeInTheDocument();
    });
    expect(localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    guestAttempt.unmount();

    // Role restriction check on allowedRoles
    await service.signIn({ email: 'viewer@demo.com', password: 'Demo@1234' });
    renderAuthApp('/admin-only', service);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /access restricted/i })).toBeInTheDocument();
    });
  });

  it('parses localized metric values cleanly and switches interactive Landing role tabs', async () => {
    expect(splitLeadingMetric('14 Modules')).toEqual({ target: 14, suffix: ' Modules' });
    expect(splitLeadingMetric('4 Vai trò')).toEqual({ target: 4, suffix: ' Vai trò' });
    expect(splitLeadingMetric('No number')).toBeNull();

    const user = userEvent.setup();
    renderAuthApp('/');

    const viewerTab = await screen.findByRole('tab', { name: /viewer/i });
    await user.click(viewerTab);
    expect(viewerTab).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText(/^Read-only$/i)).toBeInTheDocument();
  });
});
