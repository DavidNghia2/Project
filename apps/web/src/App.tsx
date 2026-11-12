import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { RolePreviewProvider } from './features/users-rbac';
import {
  AuthProvider,
  GuestRoute,
  ProtectedRoute,
  LoginPage,
  RegisterPage,
} from './features/auth';
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

            {/* Protected Inventory Management routes */}
            <Route element={<ProtectedRoute />}>
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </RolePreviewProvider>
  );
}

export default App;
