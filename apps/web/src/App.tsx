import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MotionRoot, PageLoader, ToastProvider } from './design-system';
import { RolePreviewProvider } from './features/users-rbac';
import {
  AuthProvider,
  GuestRoute,
  ProtectedRoute,
  MemberRoute,
} from './features/auth';

// Route-level code splitting for smaller initial bundle
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AccountPage = lazy(() => import('./features/onboarding/AccountPage').then((m) => ({ default: m.AccountPage })));
const OnboardingPage = lazy(() => import('./features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const AcceptInvitationPage = lazy(() =>
  import('./features/onboarding/AcceptInvitationPage').then((m) => ({ default: m.AcceptInvitationPage }))
);
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const WarehousesPage = lazy(() => import('./pages/WarehousesPage').then((m) => ({ default: m.WarehousesPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const UnitsPage = lazy(() => import('./pages/UnitsPage').then((m) => ({ default: m.UnitsPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const StockInPage = lazy(() => import('./pages/StockInPage').then((m) => ({ default: m.StockInPage })));
const StockOutPage = lazy(() => import('./pages/StockOutPage').then((m) => ({ default: m.StockOutPage })));
const StocktakingPage = lazy(() => import('./pages/StocktakingPage').then((m) => ({ default: m.StocktakingPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AlertsPage = lazy(() => import('./pages/AlertsPage').then((m) => ({ default: m.AlertsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const DesignSystemDemo = lazy(() => import('./pages/DesignSystemDemo').then((m) => ({ default: m.DesignSystemDemo })));

const ADMIN_ROLES = ['ADMIN'] as const;
const STOCK_OPERATOR_ROLES = ['ADMIN', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF'] as const;

export function App() {
  return (
    <ErrorBoundary>
      <MotionRoot>
        <ToastProvider>
          <RolePreviewProvider>
            <AuthProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                {/* Public / Guest-only routes */}
                <Route element={<GuestRoute />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Authenticated onboarding routes */}
                <Route element={<ProtectedRoute loadingVariant="neutral" />}>
                  <Route path="/onboarding" element={<AccountPage firstVisit />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/onboarding/create-company" element={<OnboardingPage />} />
                  <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
                </Route>

                {/* Protected Inventory Management routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MemberRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/warehouses" element={<WarehousesPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/units" element={<UnitsPage />} />
                      <Route path="/suppliers" element={<SuppliersPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/alerts" element={<AlertsPage />} />

                      {/* Stock operations (hidden from VIEWER) */}
                      <Route element={<ProtectedRoute allowedRoles={STOCK_OPERATOR_ROLES} />}>
                        <Route path="/stock-in" element={<StockInPage />} />
                        <Route path="/stock-out" element={<StockOutPage />} />
                        <Route path="/stocktaking" element={<StocktakingPage />} />
                      </Route>

                      {/* Admin-only administration routes */}
                      <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Route>

                      {import.meta.env.DEV && (
                        <Route path="/design-system" element={<DesignSystemDemo />} />
                      )}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </RolePreviewProvider>
        </ToastProvider>
      </MotionRoot>
    </ErrorBoundary>
  );
}

export default App;
