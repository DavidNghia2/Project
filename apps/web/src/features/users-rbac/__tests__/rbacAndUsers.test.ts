import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  RBAC_ROLE_MATRIX,
  canAccessNavKey,
  INITIAL_SYSTEM_USERS,
  validateUserForm,
  useUsers,
  type NavMenuKey,
} from '../index';

describe('RBAC Permission Matrix (4 Roles)', () => {
  it('grants Admin access to all 14 navigation menus and all write capabilities', () => {
    const allKeys: NavMenuKey[] = [
      'dashboard',
      'stock-in',
      'stock-out',
      'stocktaking',
      'products',
      'warehouses',
      'categories',
      'units',
      'suppliers',
      'alerts',
      'reports',
      'users',
      'settings',
      'design-system',
    ];
    for (const key of allKeys) {
      expect(canAccessNavKey('ADMIN', key)).toBe(true);
    }
    expect(RBAC_ROLE_MATRIX.ADMIN.canManageUsers).toBe(true);
    expect(RBAC_ROLE_MATRIX.ADMIN.canManageSettings).toBe(true);
    expect(RBAC_ROLE_MATRIX.ADMIN.canApproveStockOrder).toBe(true);
    expect(RBAC_ROLE_MATRIX.ADMIN.isReadOnly).toBe(false);
  });

  it('hides Admin/Settings/Design-System menus from Warehouse Manager while keeping operations & catalog', () => {
    expect(canAccessNavKey('WAREHOUSE_MANAGER', 'users')).toBe(false);
    expect(canAccessNavKey('WAREHOUSE_MANAGER', 'settings')).toBe(false);
    expect(canAccessNavKey('WAREHOUSE_MANAGER', 'stock-in')).toBe(true);
    expect(canAccessNavKey('WAREHOUSE_MANAGER', 'products')).toBe(true);
    expect(RBAC_ROLE_MATRIX.WAREHOUSE_MANAGER.canManageUsers).toBe(false);
    expect(RBAC_ROLE_MATRIX.WAREHOUSE_MANAGER.canManageCatalog).toBe(true);
    expect(RBAC_ROLE_MATRIX.WAREHOUSE_MANAGER.canApproveStockOrder).toBe(true);
  });

  it('allows Warehouse Staff to create stock vouchers but forbids approval, master data mutation, and Admin pages', () => {
    expect(canAccessNavKey('WAREHOUSE_STAFF', 'stock-in')).toBe(true);
    expect(canAccessNavKey('WAREHOUSE_STAFF', 'stock-out')).toBe(true);
    expect(canAccessNavKey('WAREHOUSE_STAFF', 'users')).toBe(false);
    expect(RBAC_ROLE_MATRIX.WAREHOUSE_STAFF.canCreateStockOrder).toBe(true);
    expect(RBAC_ROLE_MATRIX.WAREHOUSE_STAFF.canApproveStockOrder).toBe(false);
    expect(RBAC_ROLE_MATRIX.WAREHOUSE_STAFF.canManageCatalog).toBe(false);
    expect(RBAC_ROLE_MATRIX.WAREHOUSE_STAFF.canManageWarehouses).toBe(false);
  });

  it('enforces strictly read-only permissions and limited nav menu for Viewer', () => {
    expect(canAccessNavKey('VIEWER', 'dashboard')).toBe(true);
    expect(canAccessNavKey('VIEWER', 'products')).toBe(true);
    expect(canAccessNavKey('VIEWER', 'reports')).toBe(true);
    expect(canAccessNavKey('VIEWER', 'alerts')).toBe(true);
    expect(canAccessNavKey('VIEWER', 'stock-in')).toBe(false);
    expect(canAccessNavKey('VIEWER', 'stock-out')).toBe(false);
    expect(canAccessNavKey('VIEWER', 'stocktaking')).toBe(false);
    expect(canAccessNavKey('VIEWER', 'users')).toBe(false);
    expect(canAccessNavKey('VIEWER', 'settings')).toBe(false);

    const v = RBAC_ROLE_MATRIX.VIEWER;
    expect(v.isReadOnly).toBe(true);
    expect(v.canManageCatalog).toBe(false);
    expect(v.canCreateStockOrder).toBe(false);
    expect(v.canApproveStockOrder).toBe(false);
    expect(v.canManageUsers).toBe(false);
    expect(v.canConfigureAlerts).toBe(false);
  });
});

describe('validateUserForm & useUsers Hook', () => {
  it('validates required fields, email format, unique email, and warehouse assignment', () => {
    const errors = validateUserForm(
      {
        fullName: 'A',
        email: 'admin@smartinventory.local', // duplicate of USR-001
        department: '',
        role: 'WAREHOUSE_STAFF',
        assignedWarehouses: [],
        status: 'active',
      },
      INITIAL_SYSTEM_USERS,
      null,
      'vi'
    );

    expect(errors.fullName).toBeDefined();
    expect(errors.email).toMatch(/tồn tại|exists/i);
    expect(errors.department).toBeDefined();
    expect(errors.assignedWarehouses).toBeDefined();
  });

  it('creates mock users, assigns role & warehouses, filters, and toggles status safely', () => {
    const { result } = renderHook(() => useUsers());
    expect(result.current.users).toHaveLength(5);

    // Create a new Manager user
    act(() => {
      const res = result.current.createUser(
        {
          fullName: 'Ngô Văn Hùng',
          email: 'hung.ngo@smartinventory.local',
          department: 'Vận hành Kho Miền Trung',
          role: 'WAREHOUSE_MANAGER',
          assignedWarehouses: ['WH-02', 'WH-03'],
          status: 'active',
        },
        'vi'
      );
      expect(res.ok).toBe(true);
    });

    expect(result.current.users).toHaveLength(6);
    const created = result.current.users[0];
    expect(created.id).toBe('USR-006');
    expect(created.role).toBe('WAREHOUSE_MANAGER');
    expect(created.assignedWarehouses).toEqual(['WH-02', 'WH-03']);

    // Update user role to ADMIN (normalizes warehouses to ['ALL'])
    act(() => {
      const upd = result.current.updateUser(
        created.id,
        {
          fullName: 'Ngô Văn Hùng (Admin)',
          email: created.email,
          department: created.department,
          role: 'ADMIN',
          assignedWarehouses: ['WH-01'],
          status: 'active',
        },
        'en'
      );
      expect(upd.ok).toBe(true);
    });
    expect(result.current.users[0].assignedWarehouses).toEqual(['ALL']);

    // Toggle status on created Admin succeeds because USR-001 is still active
    act(() => {
      const t1 = result.current.toggleUserStatus(created.id, 'en');
      expect(t1.ok).toBe(true);
    });
    expect(result.current.users[0].status).toBe('inactive');

    // Trying to deactivate sole remaining active Admin (USR-001) is blocked
    act(() => {
      const blocked = result.current.toggleUserStatus('USR-001', 'en');
      expect(blocked.ok).toBe(false);
    });
    const admin = result.current.users.find((u) => u.id === 'USR-001');
    expect(admin?.status).toBe('active');

    // Combined filters (role + status + search)
    act(() => {
      result.current.setRoleFilter('WAREHOUSE_MANAGER');
      result.current.setStatusFilter('active');
      result.current.setSearch('Lê Hoàng Long');
    });
    expect(result.current.filteredUsers).toHaveLength(1);
    expect(result.current.filteredUsers[0].id).toBe('USR-003');
  });
});
