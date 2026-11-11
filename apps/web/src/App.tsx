import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { RolePreviewProvider } from './features/users-rbac';
import {
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
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
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
        </Routes>
      </BrowserRouter>
    </RolePreviewProvider>
  );
}

export default App;
