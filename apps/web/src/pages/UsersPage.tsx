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
import { translateDomainLabel } from '../i18n/domainTranslate';

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
          t('usersRbac.page.toastCreated', {
            id: res.user.id,
            fullName: res.user.fullName,
            role: res.user.role,
          })
        );
      }
      return res;
    }

    if (!editingUserId) {
      return {
        ok: false as const,
        errors: { fullName: t('usersRbac.errors.missingUserId') },
      };
    }
    const res = updateUser(editingUserId, data, language);
    if (res.ok) {
      notify(
        'success',
        t('usersRbac.page.toastUpdated', {
          id: res.user.id,
          role: res.user.role,
        })
      );
    }
    return res;
  };

  const handleToggleStatus = (user: SystemUser) => {
    const res = toggleUserStatus(user.id, language);
    if (res.ok) {
      const statusLabel =
        res.user.status === 'active'
          ? t('usersRbac.page.statusActiveText')
          : t('usersRbac.page.statusInactiveText');
      notify(
        'success',
        t('usersRbac.page.toastStatusChanged', {
          id: res.user.id,
          fullName: res.user.fullName,
          statusLabel,
        })
      );
    } else {
      notify('error', res.error);
    }
  };

  const columns: Column<SystemUser>[] = [
    {
      key: 'id',
      label: t('usersRbac.page.columns.id'),
      render: (_, record) => (
        <span className="font-mono text-xs font-bold text-[#0F172A] whitespace-nowrap">
          {record.id}
        </span>
      ),
    },
    {
      key: 'fullName',
      label: t('usersRbac.page.columns.fullName'),
      render: (_, record) => (
        <div className="min-w-0">
          <p className="font-semibold text-[#0F172A] truncate max-w-[200px]">{record.fullName}</p>
          <p className="text-xs text-[#475569] truncate max-w-[200px]">{record.email}</p>
          <p className="text-[11px] text-[#64748B] truncate max-w-[200px]">
            {translateDomainLabel(language, 'departments', record.department)}
          </p>
        </div>
      ),
    },
    {
      key: 'role',
      label: t('usersRbac.page.columns.role'),
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
      label: t('usersRbac.page.columns.assignedWarehouses'),
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
      label: t('usersRbac.page.columns.status'),
      render: (_, record) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <Badge variant={record.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
            {record.status === 'active'
              ? t('usersRbac.page.statusBadgeActive')
              : t('usersRbac.page.statusBadgeInactive')}
          </Badge>
          <p className="text-[11px] text-[#64748B] font-mono">{record.lastActive}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: t('usersRbac.page.columns.actions'),
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
            {t('usersRbac.page.editBtn')}
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
                ? t('usersRbac.page.deactivateAria', { id: record.id })
                : t('usersRbac.page.activateAria', { id: record.id })
            }
          >
            {record.status === 'active'
              ? t('usersRbac.page.disableBtn')
              : t('usersRbac.page.enableBtn')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.usersTitle')}
        description={t('usersRbac.page.description')}
        actions={
          capabilities.canManageUsers ? (
            <Button
              id="btn-create-user"
              variant="primary"
              size="sm"
              iconLeft={<UserPlus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              {t('usersRbac.page.createBtn')}
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
                    {t('usersRbac.page.kpiTotal')}
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
                    {t('usersRbac.page.kpiActive')}
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
                    {t('usersRbac.page.kpiInactive')}
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
                    {t('usersRbac.page.kpiAdmins')}
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
              caption={t('usersRbac.page.tableCaption')}
              emptyTitle={t('usersRbac.page.emptyTitle')}
              emptyDescription={t('usersRbac.page.emptyDescription')}
              emptyAction={
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  {t('usersRbac.page.emptyReset')}
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
