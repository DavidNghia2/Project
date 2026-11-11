import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '../i18n';
import { AppLayout } from '../layouts/AppLayout';
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
} from '../pages';

function renderWithRouter(initialRoute = '/') {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
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
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Application Routing & Navigation', () => {
  it('redirects root "/" to "/dashboard" and displays dashboard content', () => {
    renderWithRouter('/');
    expect(screen.getByRole('heading', { level: 1, name: /dashboard|bảng điều khiển/i })).toBeInTheDocument();
    expect(screen.getByText(/1,420/)).toBeInTheDocument();
    expect(screen.getByText('TRX-9481')).toBeInTheDocument();
  });

  it('renders Products route at "/products"', () => {
    renderWithRouter('/products');
    expect(screen.getByRole('heading', { level: 1, name: /products|sản phẩm/i })).toBeInTheDocument();
    expect(screen.getByText('SKU-LOGI-M331')).toBeInTheDocument();
  });

  it('renders Warehouses route at "/warehouses"', () => {
    renderWithRouter('/warehouses');
    expect(screen.getByRole('heading', { level: 1, name: /warehouses|kho hàng/i })).toBeInTheDocument();
    expect(screen.getByText('WH-01')).toBeInTheDocument();
  });

  it('renders Categories route at "/categories"', () => {
    renderWithRouter('/categories');
    expect(screen.getByRole('heading', { level: 1, name: /categories|danh mục/i })).toBeInTheDocument();
    expect(screen.getByText('CAT-IT-ACC')).toBeInTheDocument();
  });

  it('renders Units of Measure route at "/units"', () => {
    renderWithRouter('/units');
    expect(screen.getByRole('heading', { level: 1, name: /units of measure|đơn vị tính/i })).toBeInTheDocument();
    expect(screen.getByText('UOM-PCS')).toBeInTheDocument();
  });

  it('renders Suppliers route at "/suppliers"', () => {
    renderWithRouter('/suppliers');
    expect(screen.getByRole('heading', { level: 1, name: /suppliers|nhà cung cấp/i })).toBeInTheDocument();
    expect(screen.getByText('SUP-LOGI-VN')).toBeInTheDocument();
  });

  it('renders Stock In route at "/stock-in"', () => {
    renderWithRouter('/stock-in');
    expect(screen.getByRole('heading', { level: 1, name: /stock in|nhập kho/i })).toBeInTheDocument();
    expect(screen.getByText('IN-2026-089')).toBeInTheDocument();
  });

  it('renders Stock Out route at "/stock-out"', () => {
    renderWithRouter('/stock-out');
    expect(screen.getByRole('heading', { level: 1, name: /stock out|xuất kho/i })).toBeInTheDocument();
    expect(screen.getByText('OUT-2026-042')).toBeInTheDocument();
  });

  it('renders Stocktaking route at "/stocktaking"', () => {
    renderWithRouter('/stocktaking');
    expect(screen.getByRole('heading', { level: 1, name: /stocktaking|kiểm kê/i })).toBeInTheDocument();
    expect(screen.getByText('STK-2026-Q4-01')).toBeInTheDocument();
  });

  it('renders Reports route at "/reports"', () => {
    renderWithRouter('/reports');
    expect(screen.getByRole('heading', { level: 1, name: /reports|báo cáo/i })).toBeInTheDocument();
    expect(screen.getByText(/Inventory Balance Sheet/i)).toBeInTheDocument();
  });

  it('renders Alerts route at "/alerts"', () => {
    renderWithRouter('/alerts');
    expect(screen.getByRole('heading', { level: 1, name: /alerts|cảnh báo/i })).toBeInTheDocument();
    expect(screen.getByText('SKU-TONER-HP85A')).toBeInTheDocument();
  });

  it('renders Users route at "/users"', () => {
    renderWithRouter('/users');
    expect(screen.getByRole('heading', { level: 1, name: /users & roles|người dùng & quyền/i })).toBeInTheDocument();
    expect(screen.getByText('USR-001')).toBeInTheDocument();
  });

  it('renders Settings route at "/settings"', () => {
    renderWithRouter('/settings');
    expect(screen.getByRole('heading', { level: 1, name: /settings|cài đặt/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Maker-Checker/i).length).toBeGreaterThan(0);
  });

  it('renders 404 page for unmatched routes and navigates back to dashboard', async () => {
    const user = userEvent.setup();
    renderWithRouter('/some-invalid-path-404');

    expect(screen.getByText(/error 404/i)).toBeInTheDocument();
    expect(screen.getAllByText(/page not found|không tìm thấy trang/i).length).toBeGreaterThan(0);

    const returnBtn = screen.getByRole('button', { name: /return to dashboard|quay lại bảng điều khiển/i });
    expect(returnBtn).toBeInTheDocument();

    await user.click(returnBtn);
    expect(screen.getByRole('heading', { level: 1, name: /dashboard|bảng điều khiển/i })).toBeInTheDocument();
  });
});
