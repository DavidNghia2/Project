import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n';
import { SupabaseUsersPage } from '../UsersPage';

const { rpc, invoke, order } = vi.hoisted(() => ({ rpc: vi.fn(), invoke: vi.fn(), order: vi.fn() }));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc,
    functions: { invoke },
    from: () => ({ select: () => ({ eq: () => ({ order }) }) }),
  },
}));

vi.mock('../../features/auth', () => ({
  useAuth: () => ({
    user: { company: { name: 'Demo Company' }, isOwner: true },
    isMockMode: false,
  }),
}));

const member = {
  user_id: 'member-1',
  full_name: 'Warehouse Staff',
  email: 'staff@example.com',
  role_code: 'WAREHOUSE_STAFF',
  membership_status: 'active',
  is_owner: false,
  warehouse_ids: ['warehouse-1'],
  warehouse_codes: ['WH-01'],
};

function renderPage() {
  return render(<I18nProvider><SupabaseUsersPage /></I18nProvider>);
}

describe('SupabaseUsersPage role changes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('smart_inventory_language', 'vi');
    rpc.mockResolvedValue({ data: [member], error: null });
    order.mockResolvedValue({ data: [{ id: 'warehouse-1', code: 'WH-01', name: 'Main Warehouse' }], error: null });
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
  });

  it.each([
    ['en', 'Members and permissions', 'Create invitation', 'Role for staff@example.com'],
    ['zh-CN', '成员与权限', '创建邀请', 'staff@example.com 的角色'],
  ])('localizes the Supabase member screen in %s', async (language, heading, invite, role) => {
    localStorage.setItem('smart_inventory_language', language);
    renderPage();
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: invite })).toBeInTheDocument();
    expect(screen.getByLabelText(role)).toHaveValue('WAREHOUSE_STAFF');
  });

  it('keeps an Admin promotion as a draft until it is confirmed', async () => {
    const user = userEvent.setup();
    renderPage();
    const roleSelect = await screen.findByLabelText('Vai trò staff@example.com');

    await user.selectOptions(roleSelect, 'ADMIN');
    expect(invoke).not.toHaveBeenCalled();
    expect(screen.getByText('Cảnh báo quyền Admin')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Cấp quyền Admin')).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận lưu thay đổi' }));
    expect(invoke).toHaveBeenCalledWith('admin-users', {
      body: {
        action: 'update',
        userId: 'member-1',
        roleCode: 'ADMIN',
        status: 'active',
        warehouseIds: [],
      },
    });
  });

  it('blocks saving a non-Admin role without a warehouse', async () => {
    const user = userEvent.setup();
    rpc.mockResolvedValueOnce({ data: [{ ...member, warehouse_ids: [], warehouse_codes: [] }], error: null });
    renderPage();
    const roleSelect = await screen.findByLabelText('Vai trò staff@example.com');

    await user.selectOptions(roleSelect, 'VIEWER');
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Cần gán ít nhất một kho');
    expect(invoke).not.toHaveBeenCalled();
  });
});
