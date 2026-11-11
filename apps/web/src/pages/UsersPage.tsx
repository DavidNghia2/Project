import React, { useState } from 'react';
import {
  Pencil,
  Power,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  Users as UsersIcon,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Alert, Badge, Button, Card, Table, type Column } from '../design-system';
import {
  ROLE_META,
  RoleMatrixSummaryCard,
  RoleScopeNotice,
  UserFiltersBar,
  UserFormModal,
  formatWarehouseScopeLabel,
  useRolePreview,
  useUsers,
  type SystemUser,
  type UserFormData,
} from '../features/users-rbac';
import { useTranslation } from '../i18n';

export const UsersPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const {
    filteredUsers,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    resetFilters,
    summary,
    createUser,
    updateUser,
    toggleUserStatus,
  } = useUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(
    null
  );

  const notify = (variant: 'success' | 'error', message: string) => {
    setToast({ variant, message });
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSubmitForm = (
    data: UserFormData,
    mode: 'create' | 'edit',
    editingUserId: string | null
  ) => {
    if (mode === 'create') {
      const res = createUser(data, language);
      if (res.ok) {
        notify(
          'success',
          language === 'vi'
            ? `Đã tạo tài khoản mẫu ${res.user.id} (${res.user.fullName}) với vai trò ${res.user.role}.`
            : `Created mock user ${res.user.id} (${res.user.fullName}) as ${res.user.role}.`
        );
      }
      return res;
    }

    if (!editingUserId) {
      return { ok: false as const, errors: { fullName: 'Missing user ID' } };
    }
    const res = updateUser(editingUserId, data, language);
    if (res.ok) {
      notify(
        'success',
        language === 'vi'
          ? `Đã cập nhật thông tin & phân quyền cho ${res.user.id} (${res.user.role}).`
          : `Updated profile & assignments for ${res.user.id} (${res.user.role}).`
      );
    }
    return res;
  };

  const handleToggleStatus = (user: SystemUser) => {
    const res = toggleUserStatus(user.id, language);
    if (res.ok) {
      const label =
        res.user.status === 'active'
          ? language === 'vi'
            ? 'đang hoạt động'
            : 'active'
          : language === 'vi'
            ? 'ngừng hoạt động'
            : 'inactive';
      notify(
        'success',
        language === 'vi'
          ? `Tài khoản ${res.user.id} (${res.user.fullName}) đã chuyển sang trạng thái ${label}.`
          : `Account ${res.user.id} (${res.user.fullName}) is now ${label}.`
      );
    } else {
      notify('error', res.error);
    }
  };

  const columns: Column<SystemUser>[] = [
    {
      key: 'id',
      label: language === 'vi' ? 'Mã NV' : 'User ID',
      render: (_, record) => (
        <span className="font-mono text-xs font-bold text-[#0F172A] whitespace-nowrap">
          {record.id}
        </span>
      ),
    },
    {
      key: 'fullName',
      label: language === 'vi' ? 'Họ và tên / Phòng ban' : 'Name / Department',
      render: (_, record) => (
        <div className="min-w-0">
          <p className="font-semibold text-[#0F172A] truncate max-w-[200px]">{record.fullName}</p>
          <p className="text-xs text-[#475569] truncate max-w-[200px]">{record.email}</p>
          <p className="text-[11px] text-[#64748B] truncate max-w-[200px]">
            {record.department}
          </p>
        </div>
      ),
    },
    {
      key: 'role',
      label: language === 'vi' ? 'Vai trò' : 'Role',
      render: (_, record) => {
        const meta = ROLE_META[record.role];
        return (
          <Badge variant={meta.badgeVariant} size="sm" className="whitespace-nowrap">
            {record.role}
          </Badge>
        );
      },
    },
    {
      key: 'assignedWarehouses',
      label: language === 'vi' ? 'Kho làm việc' : 'Assigned Warehouses',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {record.assignedWarehouses.map((code) => (
              <span
                key={code}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] font-mono text-[11px] font-semibold text-[#334155]"
              >
                {code}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-[#64748B] max-w-[180px] truncate">
            {formatWarehouseScopeLabel(record.assignedWarehouses, language)}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: language === 'vi' ? 'Trạng thái' : 'Status',
      render: (_, record) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <Badge variant={record.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
            {record.status === 'active'
              ? language === 'vi'
                ? 'Hoạt động'
                : 'Active'
              : language === 'vi'
                ? 'Đã khóa'
                : 'Inactive'}
          </Badge>
          <p className="text-[11px] text-[#64748B] font-mono">{record.lastActive}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: language === 'vi' ? 'Thao tác' : 'Actions',
      align: 'right',
      render: (_, record) => (
        <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            id={`btn-edit-user-${record.id}`}
            type="button"
            variant="secondary"
            size="sm"
            className="whitespace-nowrap"
            iconLeft={<Pencil className="w-3.5 h-3.5" />}
            onClick={() => handleOpenEdit(record)}
          >
            {language === 'vi' ? 'Sửa & Gán quyền' : 'Edit / Assign'}
          </Button>
          <Button
            id={`btn-toggle-status-${record.id}`}
            type="button"
            variant={record.status === 'active' ? 'ghost' : 'secondary'}
            size="sm"
            className="whitespace-nowrap"
            iconLeft={<Power className="w-3.5 h-3.5" />}
            onClick={() => handleToggleStatus(record)}
            aria-label={
              record.status === 'active'
                ? `${language === 'vi' ? 'Tạm khóa' : 'Deactivate'} ${record.id}`
                : `${language === 'vi' ? 'Kích hoạt' : 'Activate'} ${record.id}`
            }
          >
            {record.status === 'active'
              ? language === 'vi'
                ? 'Tắt'
                : 'Disable'
              : language === 'vi'
                ? 'Bật'
                : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.usersTitle')}
        description={
          language === 'vi'
            ? 'Quản lý tài khoản mẫu, gán vai trò và phân bổ phạm vi kho làm việc. Không lưu mật khẩu và không thực hiện xác thực thực trong nguyên mẫu.'
            : 'Manage mock users, assign RBAC roles, and scope warehouse assignments. Prototype mode without real credentials or authentication.'
        }
        actions={
          capabilities.canManageUsers ? (
            <Button
              id="btn-create-user"
              variant="primary"
              size="sm"
              iconLeft={<UserPlus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {language === 'vi' ? 'Thêm người dùng mẫu' : 'Create Mock User'}
            </Button>
          ) : undefined
        }
      />

      {!capabilities.canManageUsers ? (
        <RoleScopeNotice role={activeRole} context="restricted" />
      ) : (
        <>
          {toast && (
            <Alert
              variant={toast.variant}
              message={toast.message}
              dismissible
              onDismiss={() => setToast(null)}
            />
          )}

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">
                    {language === 'vi' ? 'Tổng tài khoản mẫu' : 'Total Mock Users'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                    {summary.total}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                  <UsersIcon className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">
                    {language === 'vi' ? 'Đang hoạt động' : 'Active Accounts'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#16A34A] mt-1">
                    {summary.active}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F0FDF4] text-[#16A34A]">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">
                    {language === 'vi' ? 'Ngừng hoạt động' : 'Inactive Accounts'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#64748B] mt-1">
                    {summary.inactive}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F1F5F9] text-[#64748B]">
                  <UserX className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">
                    {language === 'vi' ? 'Quản trị viên (Admin)' : 'Active Admins'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-1">
                    {summary.admins}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          <Card padding="md" className="space-y-4">
            <UserFiltersBar
              search={search}
              onSearchChange={setSearch}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onReset={resetFilters}
            />

            <Table<SystemUser>
              columns={columns}
              data={filteredUsers}
              caption={
                language === 'vi'
                  ? 'Danh sách tài khoản người dùng và phạm vi kho'
                  : 'System user accounts and warehouse scope table'
              }
              emptyTitle={
                language === 'vi' ? 'Không tìm thấy người dùng phù hợp' : 'No matching users found'
              }
              emptyDescription={
                language === 'vi'
                  ? 'Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc vai trò / trạng thái.'
                  : 'Try adjusting the search keyword, role filter, or status filter.'
              }
              emptyAction={
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  {language === 'vi' ? 'Đặt lại bộ lọc' : 'Reset Filters'}
                </Button>
              }
            />
          </Card>

          <UserFormModal
            open={modalOpen}
            mode={modalMode}
            initialUser={selectedUser}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmitForm}
          />
        </>
      )}

      <RoleMatrixSummaryCard highlightedRole={activeRole} />
    </div>
  );
};
