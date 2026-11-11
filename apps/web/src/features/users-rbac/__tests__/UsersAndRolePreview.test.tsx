import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '../../../i18n';
import { AppLayout } from '../../../layouts/AppLayout';
import { RolePreviewProvider } from '../RolePreviewProvider';
import {
  DashboardPage,
  UsersPage,
  ProductsPage,
  SuppliersPage,
  StockInPage,
  SettingsPage,
  ReportsPage,
} from '../../../pages';

function renderAppWithRolePreview(initialRoute = '/users') {
  return render(
    <I18nProvider>
      <RolePreviewProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/warehouses" element={<div>Warehouses</div>} />
              <Route path="/categories" element={<div>Categories</div>} />
              <Route path="/units" element={<div>Units</div>} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/stock-in" element={<StockInPage />} />
              <Route path="/stock-out" element={<div>StockOut</div>} />
              <Route path="/stocktaking" element={<div>Stocktaking</div>} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/alerts" element={<div>Alerts</div>} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </RolePreviewProvider>
    </I18nProvider>
  );
}

describe('Users Management Page (/users)', () => {
  it('renders user directory without any password input fields', () => {
    const { container } = renderAppWithRolePreview('/users');
    expect(screen.getByText('USR-001')).toBeInTheDocument();
    expect(screen.getByText('USR-005')).toBeInTheDocument();
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(0);
  });

  it('supports search, role & status filters, create mock user, edit/assign role+warehouses, and toggle status', async () => {
    const user = userEvent.setup();
    renderAppWithRolePreview('/users');

    // Filter by role WAREHOUSE_MANAGER
    await user.selectOptions(document.getElementById('user-role-filter')!, 'WAREHOUSE_MANAGER');
    expect(screen.getByText('USR-002')).toBeInTheDocument();
    expect(screen.getByText('USR-003')).toBeInTheDocument();
    expect(screen.queryByText('USR-001')).not.toBeInTheDocument();

    // Reset filters
    await user.click(screen.getByRole('button', { name: /đặt lại|reset/i }));
    expect(screen.getByText('USR-001')).toBeInTheDocument();

    // Create a mock user (first test duplicate email guard)
    await user.click(document.getElementById('btn-create-user')!);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/không yêu cầu hoặc lưu trữ mật khẩu|no password fields/i)).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/họ và tên|full name/i), 'Vũ Minh Tuấn');
    await user.type(within(dialog).getByLabelText(/^email/i), 'admin@smartinventory.local');
    await user.click(document.getElementById('btn-submit-user-form')!);
    expect(await within(dialog).findByText(/tồn tại|already exists/i)).toBeInTheDocument();

    // Fix email and create user assigned to WH-02
    const emailInput = within(dialog).getByLabelText(/^email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'tuan.vu@smartinventory.local');
    await user.click(document.getElementById('user-wh-WH-02')!);
    await user.click(document.getElementById('btn-submit-user-form')!);

    expect(await screen.findByText('USR-006')).toBeInTheDocument();
    expect(screen.getByText('Vũ Minh Tuấn')).toBeInTheDocument();

    // Edit USR-004: promote to WAREHOUSE_MANAGER and assign WH-03
    await user.click(document.getElementById('btn-edit-user-USR-004')!);
    const editDialog = screen.getByRole('dialog');
    await user.selectOptions(
      within(editDialog).getByLabelText(/vai trò hệ thống|system role/i),
      'WAREHOUSE_MANAGER'
    );
    await user.click(document.getElementById('user-wh-WH-03')!);
    await user.click(document.getElementById('btn-submit-user-form')!);

    const row004 = screen.getByText('USR-004').closest('tr')!;
    expect(within(row004).getByText('WAREHOUSE_MANAGER')).toBeInTheDocument();
    expect(within(row004).getByText('WH-03')).toBeInTheDocument();

    // Toggle status on USR-004 -> becomes Inactive
    await user.click(document.getElementById('btn-toggle-status-USR-004')!);
    expect(within(row004).getByText(/đã khóa|inactive/i)).toBeInTheDocument();

    // Trying to toggle off sole active Admin USR-001 displays safeguard error
    await user.click(document.getElementById('btn-toggle-status-USR-001')!);
    expect(
      await screen.findByText(/admin đang hoạt động duy nhất|last active administrator/i)
    ).toBeInTheDocument();
  });
});

describe('Dev-Only Role Preview & RBAC UI Enforcement', () => {
  it('renders DevRolePreviewBar in dev/test env and updates Sidebar menus when switching roles', async () => {
    const user = userEvent.setup();
    renderAppWithRolePreview('/products');

    expect(screen.getByTestId('dev-role-preview-bar')).toBeInTheDocument();
    expect(screen.getByText(/14 menus|14 menu/i)).toBeInTheDocument();
    expect(document.getElementById('btn-add-product')).toBeInTheDocument();

    const sidebar = document.querySelector('aside')!;
    expect(within(sidebar).getByRole('link', { name: /users|người dùng/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /stock in|nhập kho/i })).toBeInTheDocument();

    // Switch to WAREHOUSE_MANAGER -> Admin menus disappear, Product Add remains
    await user.click(document.getElementById('btn-preview-role-WAREHOUSE_MANAGER')!);
    expect(within(sidebar).queryByRole('link', { name: /users|người dùng/i })).not.toBeInTheDocument();
    expect(within(sidebar).queryByRole('link', { name: /settings|cài đặt/i })).not.toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /stock in|nhập kho/i })).toBeInTheDocument();
    expect(document.getElementById('btn-add-product')).toBeInTheDocument();

    // Switch to WAREHOUSE_STAFF -> Product Add/Edit/Delete disappear, Stock In menu stays
    await user.click(document.getElementById('btn-preview-role-WAREHOUSE_STAFF')!);
    expect(within(sidebar).getByRole('link', { name: /stock in|nhập kho/i })).toBeInTheDocument();
    expect(document.getElementById('btn-add-product')).not.toBeInTheDocument();
    expect(screen.getByTestId('role-readonly-notice')).toBeInTheDocument();

    // Switch to VIEWER -> Stock In / Out / Stocktaking / Users / Settings all disappear from menu
    await user.click(document.getElementById('btn-preview-role-VIEWER')!);
    expect(within(sidebar).queryByRole('link', { name: /stock in|nhập kho/i })).not.toBeInTheDocument();
    expect(within(sidebar).queryByRole('link', { name: /stock out|xuất kho/i })).not.toBeInTheDocument();
    expect(within(sidebar).queryByRole('link', { name: /stocktaking|kiểm kê/i })).not.toBeInTheDocument();
    expect(within(sidebar).queryByRole('link', { name: /users|người dùng/i })).not.toBeInTheDocument();

    // Zero edit / create / delete controls on Products for Viewer
    expect(document.getElementById('btn-add-product')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(sửa|edit) /i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(xóa|delete) /i })).not.toBeInTheDocument();

    // Reset back to ADMIN restores full access
    await user.click(document.getElementById('btn-reset-preview-role')!);
    expect(document.getElementById('btn-add-product')).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: /users|người dùng/i })).toBeInTheDocument();
  });

  it('hides create/edit/delete/approve buttons for VIEWER across Suppliers, Stock-In, Reports, and Users', async () => {
    const user = userEvent.setup();
    renderAppWithRolePreview('/suppliers');

    await user.click(document.getElementById('btn-preview-role-VIEWER')!);
    expect(document.getElementById('btn-add-supplier')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(sửa|edit) /i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(xóa|delete) /i })).not.toBeInTheDocument();

    // Verify VIEWER visiting /dashboard sees no quick Stock-In / Stock-Out create links
    const viewerDash = render(
      <I18nProvider>
        <RolePreviewProvider initialRole="VIEWER">
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </MemoryRouter>
        </RolePreviewProvider>
      </I18nProvider>
    );
    expect(viewerDash.container.querySelectorAll('a[href="/stock-in"], a[href="/stock-out"]')).toHaveLength(0);
    viewerDash.unmount();

    // Verify VIEWER visiting /users directly sees restricted notice & zero create controls
    render(
      <I18nProvider>
        <RolePreviewProvider initialRole="VIEWER">
          <MemoryRouter initialEntries={['/users']}>
            <Routes>
              <Route path="/users" element={<UsersPage />} />
            </Routes>
          </MemoryRouter>
        </RolePreviewProvider>
      </I18nProvider>
    );
    expect(screen.getByTestId('role-restricted-notice')).toBeInTheDocument();
    expect(document.getElementById('btn-create-user')).not.toBeInTheDocument();
  });

  it('blocks Approve/Reject actions in StockIn detail modal when preview role is WAREHOUSE_STAFF', async () => {
    const user = userEvent.setup();
    renderAppWithRolePreview('/stock-in');

    await user.click(document.getElementById('btn-preview-role-WAREHOUSE_STAFF')!);
    // Staff CAN still create vouchers
    expect(document.getElementById('btn-create-stock-in')).toBeInTheDocument();

    // Open SUBMITTED voucher IN-2026-089 -> Approve button must NOT render for Staff
    await user.click(screen.getByTestId('btn-view-IN-2026-089'));
    expect(document.getElementById('btn-approve-order')).not.toBeInTheDocument();
    expect(
      screen.getByText(/không có quyền phê duyệt|cannot approve or reject/i)
    ).toBeInTheDocument();
  });

  it('switches UsersPage and DevRolePreviewBar cleanly to English without leftover Vietnamese UI strings', async () => {
    localStorage.setItem('smart_inventory_language', 'en');
    const user = userEvent.setup();
    renderAppWithRolePreview('/users');

    expect(screen.getByText(/Administrator · 14 menus/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Mock User/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Mock Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Northern Warehouse Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/All Warehouses \(System\)/i)).toBeInTheDocument();

    // Viewer restricted notice renders cleanly in English
    await user.click(document.getElementById('btn-preview-role-VIEWER')!);
    expect(screen.getByText(/Access restricted for current role/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Read-only\)/i)).toBeInTheDocument();

    localStorage.removeItem('smart_inventory_language');
  });
});
