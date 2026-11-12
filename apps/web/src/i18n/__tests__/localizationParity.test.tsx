import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import en from '../locales/en.json';
import vi from '../locales/vi.json';
import { I18nProvider, useTranslation } from '../index';
import { translateKey } from '../translate';
import { RolePreviewProvider } from '../../features/users-rbac';
import { AppLayout } from '../../layouts/AppLayout';
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
  LandingPage,
} from '../../pages';
import { LoginPage, RegisterPage } from '../../features/auth';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenKeys(v as Record<string, unknown>, fullKey));
    } else {
      out[fullKey] = v;
    }
  }
  return out;
}

function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{[a-zA-Z0-9_]+\}/g);
  return matches ? Array.from(new Set(matches)).sort() : [];
}

const RAW_KEY_PATTERN =
  /(?<!@)\b(?:common|status|table|validation|emptyState|alert|nav|topbar|notFound|pages|demo|layout|domain|dashboard|alerts|stocktaking|settings|products|masterData|stockOps|reports|usersRbac|auth|landing)\.[a-zA-Z0-9_]+/;

const LanguageProbe: React.FC = () => {
  const { language, toggleLanguage, t } = useTranslation();
  return (
    <div>
      <span data-testid="probe-lang">{language}</span>
      <span data-testid="probe-sample">{t('pages.dashboardTitle')}</span>
      <button type="button" onClick={toggleLanguage}>
        toggle-probe
      </button>
    </div>
  );
};

describe('Bilingual Localization Integrity & Parity (EN <-> VI)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('maintains 100% leaf-key, non-empty string, and placeholder parity between en.json and vi.json', () => {
    const enFlat = flattenKeys(en as Record<string, unknown>);
    const viFlat = flattenKeys(vi as Record<string, unknown>);

    const enKeys = Object.keys(enFlat).sort();
    const viKeys = Object.keys(viFlat).sort();

    expect(enKeys.length).toBeGreaterThan(1200);
    expect(enKeys).toEqual(viKeys);

    for (const key of enKeys) {
      const enVal = enFlat[key];
      const viVal = viFlat[key];
      expect(typeof enVal).toBe('string');
      expect(typeof viVal).toBe('string');
      expect((enVal as string).trim().length).toBeGreaterThan(0);
      expect((viVal as string).trim().length).toBeGreaterThan(0);
      expect(extractPlaceholders(enVal as string)).toEqual(extractPlaceholders(viVal as string));
      expect(translateKey('en', key)).not.toBe(key);
      expect(translateKey('vi', key)).not.toBe(key);
    }
  });

  it('persists selected language to localStorage, updates html lang, and toggles live across layout and routes', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>
    );

    expect(screen.getByTestId('probe-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('probe-sample')).toHaveTextContent('Warehouse Dashboard');
    expect(document.documentElement.lang).toBe('en');

    await user.click(screen.getByRole('button', { name: 'toggle-probe' }));

    expect(screen.getByTestId('probe-lang')).toHaveTextContent('vi');
    expect(screen.getByTestId('probe-sample')).toHaveTextContent('Bảng Điều Khiển Quản Lý Kho');
    expect(localStorage.getItem('smart_inventory_language')).toBe('vi');
    expect(document.documentElement.lang).toBe('vi');
  });

  it('switches Topbar language pill cleanly inside AppLayout from EN -> VI -> EN', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <RolePreviewProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </RolePreviewProvider>
      </I18nProvider>
    );

    expect(screen.getByRole('heading', { name: /Warehouse Dashboard/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Switch Language/i }));

    expect(
      screen.getByRole('heading', { name: /Bảng Điều Khiển Quản Lý Kho/i })
    ).toBeInTheDocument();
    expect(localStorage.getItem('smart_inventory_language')).toBe('vi');

    await user.click(screen.getByRole('button', { name: /Đổi ngôn ngữ/i }));
    expect(screen.getByRole('heading', { name: /Warehouse Dashboard/i })).toBeInTheDocument();
    expect(localStorage.getItem('smart_inventory_language')).toBe('en');
  });

  it('renders every application page in both EN and VI with zero raw translation keys leaked', () => {
    const routes: Array<{
      path: string;
      element: React.ReactElement;
      enMatch: RegExp;
      viMatch: RegExp;
    }> = [
      { path: '/dashboard', element: <DashboardPage />, enMatch: /Warehouse Dashboard/i, viMatch: /Bảng Điều Khiển Quản Lý Kho/i },
      { path: '/products', element: <ProductsPage />, enMatch: /Product Catalog/i, viMatch: /Danh Mục Hàng Hóa/i },
      { path: '/warehouses', element: <WarehousesPage />, enMatch: /Warehouse Management/i, viMatch: /Quản Lý Kho Bãi/i },
      { path: '/categories', element: <CategoriesPage />, enMatch: /Product Categories/i, viMatch: /Danh Mục Phân Loại Hàng/i },
      { path: '/units', element: <UnitsPage />, enMatch: /Units of Measurement/i, viMatch: /Quản Lý Đơn Vị Tính/i },
      { path: '/suppliers', element: <SuppliersPage />, enMatch: /Supplier Registry/i, viMatch: /Danh Bạ Nhà Cung Cấp/i },
      { path: '/stock-in', element: <StockInPage />, enMatch: /Inbound Stock Receipts/i, viMatch: /Nhập kho/i },
      { path: '/stock-out', element: <StockOutPage />, enMatch: /Stock Out/i, viMatch: /Xuất kho/i },
      { path: '/stocktaking', element: <StocktakingPage />, enMatch: /Inventory Stocktaking/i, viMatch: /Kiểm Kê Kho Định Kỳ/i },
      { path: '/reports', element: <ReportsPage />, enMatch: /Reports & Analytics/i, viMatch: /Báo Cáo & Phân Tích/i },
      { path: '/alerts', element: <AlertsPage />, enMatch: /Low Stock & Threshold Alerts/i, viMatch: /Cảnh Báo & Định Mức Tồn Thấp/i },
      { path: '/users', element: <UsersPage />, enMatch: /Users & Access Control/i, viMatch: /Quản Trị Người Dùng/i },
      { path: '/settings', element: <SettingsPage />, enMatch: /System Settings/i, viMatch: /Cài Đặt Hệ Thống/i },
      { path: '/design-system', element: <DesignSystemDemo />, enMatch: /OPERATE MODE/i, viMatch: /CHẾ ĐỘ VẬN HÀNH/i },
      { path: '/unknown-route', element: <NotFoundPage />, enMatch: /Page Not Found/i, viMatch: /Không tìm thấy trang/i },
      { path: '/', element: <LandingPage />, enMatch: /Warehouse inventory software/i, viMatch: /Phần mềm quản lý kho/i },
      { path: '/login', element: <LoginPage />, enMatch: /Sign in to Smart Inventory/i, viMatch: /Đăng nhập Smart Inventory/i },
      { path: '/register', element: <RegisterPage />, enMatch: /Create your warehouse account/i, viMatch: /Tạo tài khoản làm việc mới/i },
    ];

    for (const lang of ['en', 'vi'] as const) {
      localStorage.setItem('smart_inventory_language', lang);
      for (const route of routes) {
        const { container, unmount } = render(
          <I18nProvider>
            <RolePreviewProvider>
              <MemoryRouter initialEntries={[route.path]}>
                <Routes>
                  <Route path={route.path} element={route.element} />
                </Routes>
              </MemoryRouter>
            </RolePreviewProvider>
          </I18nProvider>
        );

        const text = container.textContent ?? '';
        expect(text).toMatch(lang === 'en' ? route.enMatch : route.viMatch);
        expect(text).not.toMatch(RAW_KEY_PATTERN);
        unmount();
      }
    }
  });
});
