import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Pencil,
  Power,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  Users as UsersIcon,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { UsersPageSkeleton } from './UsersPageSkeleton';
import { Alert, Badge, Button, Card, Input, Modal, Select, Table, useToast, type Column } from '../design-system';
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
  type RoleCode,
} from '../features/users-rbac';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import { useAuth } from '../features/auth';
import { supabase } from '../lib/supabase';

const MockUsersPage: React.FC = () => {
  const { t, language } = useTranslation();
  const toastApi = useToast();
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
    const id = variant === 'error' ? toastApi.error(message) : toastApi.success(message);
    if (!id) setToast({ variant, message });
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

type RemoteMember = {
  user_id: string;
  full_name: string;
  email: string;
  role_code: RoleCode;
  membership_status: 'active' | 'inactive';
  is_owner: boolean;
  warehouse_ids: string[];
  warehouse_codes: string[];
};

type RemoteWarehouse = { id: string; code: string; name: string };

type MemberDraft = {
  roleCode: RoleCode;
  warehouseIds: string[];
};

const roles: RoleCode[] = ['ADMIN', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF', 'VIEWER'];

export const SupabaseUsersPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const roleOptions = roles.map((role) => ({ value: role, label: t(`topbar.roleShort.${role}`) }));

  const [members, setMembers] = useState<RemoteMember[]>([]);
  const [warehouses, setWarehouses] = useState<RemoteWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ key: string; name?: string } | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleCode>('WAREHOUSE_STAFF');
  const [inviteWarehouseIds, setInviteWarehouseIds] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Role & Warehouse modal
  const [editingMember, setEditingMember] = useState<RemoteMember | null>(null);
  const [editDraft, setEditDraft] = useState<MemberDraft>({ roleCode: 'WAREHOUSE_STAFF', warehouseIds: [] });
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Admin confirmation step
  const [pendingRoleConfirm, setPendingRoleConfirm] = useState<{
    member: RemoteMember;
    draft: MemberDraft;
  } | null>(null);

  // Deactivate/Activate status confirm modal
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<RemoteMember | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchRemoteMembers = async () => {
    const [memberResult, warehouseResult] = await Promise.all([
      supabase.rpc('list_company_members'),
      supabase.from('warehouses').select('id, code, name').eq('status', 'active').order('code'),
    ]);
    return {
      hasError: Boolean(memberResult.error || warehouseResult.error),
      members: (memberResult.data ?? []) as RemoteMember[],
      warehouses: (warehouseResult.data ?? []) as RemoteWarehouse[],
    };
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchRemoteMembers();
    if (result.hasError) setError('members.loadError');
    setMembers(result.members);
    setWarehouses(result.warehouses);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    void fetchRemoteMembers().then((result) => {
      if (cancelled) return;
      if (result.hasError) setError('members.loadError');
      setMembers(result.members);
      setWarehouses(result.warehouses);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const invokeAdminUsers = async (body: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    setError(null);
    setNotice(null);
    const { data, error: invokeError } = await supabase.functions.invoke('admin-users', { body });
    if (invokeError) {
      setError('members.actionError');
      return null;
    }
    return data as Record<string, unknown>;
  };

  // KPI Calculations
  const stats = useMemo(() => {
    return {
      total: members.length,
      active: members.filter((m) => m.membership_status === 'active').length,
      inactive: members.filter((m) => m.membership_status === 'inactive').length,
      admins: members.filter((m) => m.role_code === 'ADMIN').length,
    };
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        member.full_name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'ALL' || member.role_code === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || member.membership_status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, roleFilter, statusFilter]);

  const hasActiveFilters = search.trim() !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  };

  // --- Handlers for Invite ---
  const handleOpenInvite = () => {
    setInviteEmail('');
    setInviteRole('WAREHOUSE_STAFF');
    setInviteWarehouseIds(warehouses.length > 0 ? [warehouses[0].id] : []);
    setInviteLink(null);
    setCopiedLink(false);
    setInviteModalOpen(true);
  };

  const toggleInviteWarehouse = (warehouseId: string) => {
    setInviteWarehouseIds((current) =>
      current.includes(warehouseId) ? current.filter((id) => id !== warehouseId) : [...current, warehouseId]
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteRole !== 'ADMIN' && inviteWarehouseIds.length === 0) {
      setError('members.warehouseRequired');
      return;
    }
    setIsInviting(true);
    const result = await invokeAdminUsers({
      action: 'invite',
      email: inviteEmail,
      roleCode: inviteRole,
      warehouseIds: inviteRole === 'ADMIN' ? [] : inviteWarehouseIds,
    });
    setIsInviting(false);
    if (!result) return;

    if (typeof result.invitationUrl === 'string') {
      setInviteLink(result.invitationUrl);
    } else {
      setInviteModalOpen(false);
    }
    setNotice({ key: result.emailSent ? 'members.sent' : 'members.created' });
    void load();
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // --- Handlers for Edit Role & Warehouse ---
  const handleOpenEditRole = (member: RemoteMember) => {
    setEditingMember(member);
    setEditDraft({
      roleCode: member.role_code,
      warehouseIds: [...member.warehouse_ids],
    });
    setEditError(null);
  };

  const toggleEditWarehouse = (warehouseId: string) => {
    setEditDraft((prev) => {
      const current = prev.warehouseIds;
      const next = current.includes(warehouseId)
        ? current.filter((id) => id !== warehouseId)
        : [...current, warehouseId];
      return { ...prev, warehouseIds: next };
    });
    setEditError(null);
  };

  const handleRequestSaveRole = () => {
    if (!editingMember) return;
    if (editDraft.roleCode !== 'ADMIN' && editDraft.warehouseIds.length === 0) {
      setEditError('members.warehouseRequired');
      return;
    }

    // If promoting to Admin from another role, show confirmation dialog
    if (editDraft.roleCode === 'ADMIN' && editingMember.role_code !== 'ADMIN') {
      setPendingRoleConfirm({ member: editingMember, draft: editDraft });
      return;
    }

    void executeSaveRole(editingMember, editDraft);
  };

  const executeSaveRole = async (member: RemoteMember, draft: MemberDraft) => {
    setIsSavingRole(true);
    const result = await invokeAdminUsers({
      action: 'update',
      userId: member.user_id,
      roleCode: draft.roleCode,
      status: member.membership_status,
      warehouseIds: draft.roleCode === 'ADMIN' ? [] : draft.warehouseIds,
    });
    setIsSavingRole(false);
    if (result) {
      setNotice({ key: 'members.updated' });
      setEditingMember(null);
      setPendingRoleConfirm(null);
      await load();
    }
  };

  // --- Handlers for Deactivate / Activate ---
  const handleToggleStatus = async () => {
    if (!statusConfirmTarget) return;
    setIsUpdatingStatus(true);
    const nextStatus = statusConfirmTarget.membership_status === 'active' ? 'inactive' : 'active';
    const result = await invokeAdminUsers({
      action: 'update',
      userId: statusConfirmTarget.user_id,
      roleCode: statusConfirmTarget.role_code,
      status: nextStatus,
      warehouseIds: statusConfirmTarget.role_code === 'ADMIN' ? [] : statusConfirmTarget.warehouse_ids,
    });
    setIsUpdatingStatus(false);
    if (result) {
      setNotice({ key: 'members.updated' });
      setStatusConfirmTarget(null);
      await load();
    }
  };

  const handleTransferOwner = async (member: RemoteMember) => {
    const result = await invokeAdminUsers({ action: 'transfer-owner', userId: member.user_id });
    if (result) {
      setNotice({ key: 'members.transferred', name: member.full_name || member.email });
      await load();
    }
  };

  const getRoleBadgeVariant = (role: RoleCode): 'primary' | 'warning' | 'info' | 'neutral' => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'WAREHOUSE_MANAGER':
        return 'warning';
      case 'WAREHOUSE_STAFF':
        return 'info';
      case 'VIEWER':
      default:
        return 'neutral';
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name?.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (email?.slice(0, 2) || 'MB').toUpperCase();
  };

  if (loading) {
    return <UsersPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('members.title')}
        description={t('members.description', { company: user?.company?.name ?? t('members.company') })}
        actions={
          <Button
            id="btn-create-invite"
            variant="primary"
            size="sm"
            iconLeft={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenInvite}
          >
            {t('members.createInvite')}
          </Button>
        }
      />

      {error && <Alert variant="error" message={t(error)} dismissible onDismiss={() => setError(null)} />}
      {notice && (
        <Alert
          variant="success"
          message={t(notice.key, notice.name ? { name: notice.name } : undefined)}
          dismissible
          onDismiss={() => setNotice(null)}
        />
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{t('members.kpiTotal')}</p>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{t('members.kpiActive')}</p>
              <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{t('members.kpiInactive')}</p>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
              <UserX className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{t('members.kpiAdmins')}</p>
              <p className="text-2xl font-bold font-mono tabular-nums text-indigo-700 mt-1">{stats.admins}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={t('members.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-44">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: t('members.filterRoleAll') },
                  ...roleOptions,
                ]}
              />
            </div>

            <div className="w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: t('members.filterStatusAll') },
                  { value: 'active', label: t('members.statusActive') },
                  { value: 'inactive', label: t('members.statusInactive') },
                ]}
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="md"
                iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={resetFilters}
              >
                {t('members.resetFilters')}
              </Button>
            )}
          </div>
        </div>

        {/* Enterprise Members Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">{t('members.member')}</th>
                <th className="py-3 px-4">{t('members.role')}</th>
                <th className="py-3 px-4">{t('members.warehouse')}</th>
                <th className="py-3 px-4">{t('members.status')}</th>
                <th className="py-3 px-4 text-right">{t('members.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <p className="font-medium">{t('members.noMembersFound')}</p>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" className="mt-2" onClick={resetFilters}>
                        {t('members.resetFilters')}
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isOwner = member.is_owner;
                  const isActive = member.membership_status === 'active';

                  return (
                    <tr key={member.user_id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs font-mono shrink-0">
                            {getInitials(member.full_name, member.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                                {member.full_name || t('members.unnamed')}
                              </p>
                              {isOwner && (
                                <Badge variant="primary" size="sm" className="text-[10px] px-1.5 py-0">
                                  {t('members.owner')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate max-w-[220px] font-mono mt-0.5">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeVariant(member.role_code)} size="sm">
                          {t(`topbar.roleShort.${member.role_code}`)}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 min-w-44">
                        {member.role_code === 'ADMIN' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                            {t('members.allWarehouses')}
                          </span>
                        ) : member.warehouse_codes && member.warehouse_codes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {member.warehouse_codes.map((code) => (
                              <span
                                key={code}
                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-semibold text-slate-700"
                              >
                                {code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {t('members.warehouseRequired')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={isActive ? 'success' : 'neutral'} size="sm" dot>
                          {isActive ? t('members.statusActive') : t('members.statusInactive')}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            id={`btn-edit-role-${member.user_id}`}
                            variant="secondary"
                            size="sm"
                            iconLeft={<Pencil className="w-3.5 h-3.5" />}
                            disabled={isOwner && !user?.isOwner}
                            onClick={() => handleOpenEditRole(member)}
                          >
                            {t('members.editRole')}
                          </Button>

                          <Button
                            id={`btn-toggle-status-${member.user_id}`}
                            variant="ghost"
                            size="sm"
                            className={
                              isActive
                                ? 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }
                            iconLeft={<Power className="w-3.5 h-3.5" />}
                            disabled={isOwner}
                            onClick={() => setStatusConfirmTarget(member)}
                          >
                            {isActive ? t('members.disable') : t('members.enable')}
                          </Button>

                          {user?.isOwner && !member.is_owner && member.role_code === 'ADMIN' && isActive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-700 hover:bg-blue-50"
                              onClick={() => void handleTransferOwner(member)}
                            >
                              {t('members.transfer')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal 1: Mời thành viên mới */}
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={t('members.invite')}
        description={t('members.inviteHelp')}
        actions={
          <>
            <Button variant="secondary" onClick={() => setInviteModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            {!inviteLink && (
              <Button form="invite-member-form" type="submit" loading={isInviting}>
                {t('members.createInvite')}
              </Button>
            )}
          </>
        }
      >
        <form id="invite-member-form" onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label={t('auth.email')}
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            placeholder="member@example.com"
          />

          <Select
            label={t('members.role')}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as RoleCode)}
            options={roleOptions}
          />

          {inviteRole !== 'ADMIN' && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">
                {t('members.scope')} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                {warehouses.map((warehouse) => (
                  <label
                    key={warehouse.id}
                    className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs text-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={inviteWarehouseIds.includes(warehouse.id)}
                      onChange={() => toggleInviteWarehouse(warehouse.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-mono font-semibold">{warehouse.code}</span>
                    <span className="text-slate-500 truncate">{warehouse.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {inviteLink && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-900">{t('members.inviteLink')}</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-mono select-all"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={copyInviteLink}
                  iconLeft={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedLink ? 'Đã chép' : 'Sao chép'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal 2: Chỉnh sửa Vai trò & Kho */}
      {editingMember && !pendingRoleConfirm && (
        <Modal
          open
          onClose={() => setEditingMember(null)}
          title={t('members.editRoleModalTitle')}
          description={t('members.editRoleModalDesc')}
          actions={
            <>
              <Button variant="secondary" onClick={() => setEditingMember(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                loading={isSavingRole}
                onClick={handleRequestSaveRole}
              >
                {t('members.save')}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            {/* Member Profile Summary Card */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-bold flex items-center justify-center font-mono">
                {getInitials(editingMember.full_name, editingMember.email)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {editingMember.full_name || editingMember.email}
                </p>
                <p className="text-xs text-slate-500 font-mono truncate">{editingMember.email}</p>
              </div>
            </div>

            <Select
              id={`member-role-${editingMember.user_id}`}
              label={t('members.role')}
              aria-label={t('members.memberRole', { email: editingMember.email })}
              value={editDraft.roleCode}
              disabled={editingMember.is_owner || isSavingRole}
              onChange={(e) => {
                const nextRole = e.target.value as RoleCode;
                setEditDraft((prev) => ({
                  ...prev,
                  roleCode: nextRole,
                  warehouseIds: nextRole === 'ADMIN' ? [] : prev.warehouseIds,
                }));
                setEditError(null);
              }}
              options={roleOptions}
            />

            {editingMember.is_owner && (
              <p className="text-xs text-slate-500">{t('members.ownerHelp')}</p>
            )}

            {editDraft.roleCode === 'ADMIN' ? (
              <Alert
                variant="warning"
                title={t('members.adminWarning')}
                message={t('members.adminHelp')}
              />
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t('members.scope')} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {editDraft.warehouseIds.length} kho đã chọn
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {warehouses.map((warehouse) => (
                    <label
                      key={warehouse.id}
                      className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs text-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={editDraft.warehouseIds.includes(warehouse.id)}
                        disabled={editingMember.is_owner || isSavingRole}
                        onChange={() => toggleEditWarehouse(warehouse.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-mono font-semibold">{warehouse.code}</span>
                      <span className="text-slate-500 truncate">{warehouse.name}</span>
                    </label>
                  ))}
                </div>

                {editError && (
                  <Alert
                    variant="error"
                    message={t(editError)}
                    className="mt-2"
                  />
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal 3: Xác nhận nâng quyền Admin */}
      {pendingRoleConfirm && (
        <Modal
          open
          onClose={() => setPendingRoleConfirm(null)}
          title={t('members.confirmTitle')}
          description={t('members.confirmHelp')}
          actions={
            <>
              <Button variant="secondary" onClick={() => setPendingRoleConfirm(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                loading={isSavingRole}
                onClick={() => void executeSaveRole(pendingRoleConfirm.member, pendingRoleConfirm.draft)}
              >
                {t('members.confirmSave')}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="text-xs text-slate-500">{t('members.currentRole')}</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {t(`topbar.roleShort.${pendingRoleConfirm.member.role_code}`)}
                </p>
              </div>
              <span className="text-slate-400 font-bold" aria-hidden="true">→</span>
              <div>
                <p className="text-xs text-slate-500">{t('members.newRole')}</p>
                <p className="mt-1 font-semibold text-indigo-700">
                  {t(`topbar.roleShort.${pendingRoleConfirm.draft.roleCode}`)}
                </p>
              </div>
            </div>

            <Alert
              variant="warning"
              title={t('members.grantAdmin')}
              message={t('members.grantHelp')}
            />
          </div>
        </Modal>
      )}

      {/* Modal 4: Xác nhận Vô hiệu hóa / Kích hoạt thành viên */}
      {statusConfirmTarget && (() => {
        const isCurrentlyActive = statusConfirmTarget.membership_status === 'active';
        return (
          <Modal
            open
            onClose={() => setStatusConfirmTarget(null)}
            title={isCurrentlyActive ? t('members.confirmDeactivateTitle') : t('members.confirmActivateTitle')}
            actions={
              <>
                <Button variant="secondary" onClick={() => setStatusConfirmTarget(null)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant={isCurrentlyActive ? 'danger' : 'primary'}
                  loading={isUpdatingStatus}
                  onClick={handleToggleStatus}
                >
                  {isCurrentlyActive ? t('members.confirmDeactivateBtn') : t('members.confirmActivateBtn')}
                </Button>
              </>
            }
          >
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <p className="font-semibold text-slate-900">
                  {statusConfirmTarget.full_name || statusConfirmTarget.email}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{statusConfirmTarget.email}</p>
              </div>

              <Alert
                variant={isCurrentlyActive ? 'warning' : 'info'}
                message={isCurrentlyActive ? t('members.confirmDeactivateHelp') : t('members.confirmActivateHelp')}
              />
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};

export const UsersPage: React.FC = () => {
  const { isMockMode } = useAuth();
  return isMockMode ? <MockUsersPage /> : <SupabaseUsersPage />;
};
