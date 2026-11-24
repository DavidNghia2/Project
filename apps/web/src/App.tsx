import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { RolePreviewProvider } from './features/users-rbac';
import {
  AuthProvider,
  GuestRoute,
  ProtectedRoute,
  MemberRoute,
  LoginPage,
  RegisterPage,
} from './features/auth';
import { AcceptInvitationPage, OnboardingPage } from './features/onboarding';
import { AccountPage } from './features/onboarding/AccountPage';
import {
  LandingPage,
  DashboardPage,
  ProductsPage,
  WarehousesPage,
  CategoriesPage,
  UnitsPage,
  SuppliersPage,
  StockInPage,
  StockOutPage,
  StocktakingPage,
  ReportsPage,
  AlertsPage,
  UsersPage,
  SettingsPage,
  NotFoundPage,
  DesignSystemDemo,
} from './pages';

export function App() {
  return (
    <RolePreviewProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Guest-only routes */}
            <Route element={<GuestRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated onboarding routes */}
            <Route element={<ProtectedRoute />}>
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
                <Route path="/stock-in" element={<StockInPage />} />
                <Route path="/stock-out" element={<StockOutPage />} />
                <Route path="/stocktaking" element={<StocktakingPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/design-system" element={<DesignSystemDemo />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </RolePreviewProvider>
  );
}

export default App;
