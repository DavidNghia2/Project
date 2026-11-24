import React, { useEffect, useState } from 'react';
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
import { Alert, Badge, Button, Card, Input, Modal, Select, Table, type Column } from '../design-system';
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
  const [memberDrafts, setMemberDrafts] = useState<Record<string, MemberDraft>>({});
  const [memberErrors, setMemberErrors] = useState<Record<string, boolean>>({});
  const [pendingRoleSave, setPendingRoleSave] = useState<RemoteMember | null>(null);
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<RemoteWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ key: string; name?: string } | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleCode>('WAREHOUSE_STAFF');
  const [inviteWarehouseIds, setInviteWarehouseIds] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [memberResult, warehouseResult] = await Promise.all([
      supabase.rpc('list_company_members'),
      supabase.from('warehouses').select('id, code, name').eq('status', 'active').order('code'),
    ]);
    if (memberResult.error) setError('members.loadError');
    if (warehouseResult.error) setError('members.loadError');
    const nextMembers = (memberResult.data ?? []) as RemoteMember[];
    setMembers(nextMembers);
    setMemberDrafts({});
    setMemberErrors({});
    setWarehouses((warehouseResult.data ?? []) as RemoteWarehouse[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
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

  const sendInvitation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await invokeAdminUsers({
      action: 'invite',
      email: inviteEmail,
      roleCode: inviteRole,
      warehouseIds: inviteRole === 'ADMIN' ? [] : inviteWarehouseIds,
    });
    if (!result) return;
    setInviteLink(typeof result.invitationUrl === 'string' ? result.invitationUrl : null);
    setNotice({ key: result.emailSent ? 'members.sent' : 'members.created' });
    setInviteEmail('');
    setInviteWarehouseIds([]);
  };

  const updateMember = async (
    member: RemoteMember,
    roleCode: RoleCode,
    status: 'active' | 'inactive',
    warehouseIds = member.warehouse_ids
  ) => {
    const result = await invokeAdminUsers({
      action: 'update',
      userId: member.user_id,
      roleCode,
      status,
      warehouseIds: roleCode === 'ADMIN' ? [] : warehouseIds,
    });
    if (result) {
      setNotice({ key: 'members.updated' });
      await load();
    }
  };

  const transferOwner = async (member: RemoteMember) => {
    const result = await invokeAdminUsers({ action: 'transfer-owner', userId: member.user_id });
    if (result) {
      setNotice({ key: 'members.transferred', name: member.full_name || member.email });
      await load();
    }
  };

  const toggleInviteWarehouse = (warehouseId: string) => {
    setInviteWarehouseIds((current) => current.includes(warehouseId)
      ? current.filter((id) => id !== warehouseId)
      : [...current, warehouseId]);
  };

  const getDraft = (member: RemoteMember): MemberDraft =>
    memberDrafts[member.user_id] ?? { roleCode: member.role_code, warehouseIds: member.warehouse_ids };

  const setMemberRole = (member: RemoteMember, roleCode: RoleCode) => {
    const draft = getDraft(member);
    setMemberDrafts((current) => ({ ...current, [member.user_id]: { ...draft, roleCode } }));
    setMemberErrors((current) => ({ ...current, [member.user_id]: false }));
  };

  const toggleMemberWarehouse = (member: RemoteMember, warehouseId: string) => {
    const draft = getDraft(member);
    setMemberDrafts((current) => {
      const assigned = draft.warehouseIds;
      return {
        ...current,
        [member.user_id]: {
          ...draft,
          warehouseIds: assigned.includes(warehouseId)
            ? assigned.filter((id) => id !== warehouseId)
            : [...assigned, warehouseId],
        },
      };
    });
    setMemberErrors((current) => ({ ...current, [member.user_id]: false }));
  };

  const discardMemberChanges = (memberId: string) => {
    setMemberDrafts((current) => {
      const { [memberId]: _discarded, ...rest } = current;
      return rest;
    });
    setMemberErrors((current) => ({ ...current, [memberId]: false }));
  };

  const hasDraftChanges = (member: RemoteMember, draft: MemberDraft) =>
    draft.roleCode !== member.role_code
      || draft.warehouseIds.length !== member.warehouse_ids.length
      || draft.warehouseIds.some((id) => !member.warehouse_ids.includes(id));

  const saveDraft = async (member: RemoteMember) => {
    const draft = getDraft(member);
    setSavingMemberId(member.user_id);
    const result = await invokeAdminUsers({
      action: 'update',
      userId: member.user_id,
      roleCode: draft.roleCode,
      status: member.membership_status,
      warehouseIds: draft.roleCode === 'ADMIN' ? [] : draft.warehouseIds,
    });
    if (result) {
      setNotice({ key: 'members.updated' });
      await load();
    }
    setSavingMemberId(null);
  };

  const requestSave = (member: RemoteMember) => {
    const draft = getDraft(member);
    if (draft.roleCode !== 'ADMIN' && draft.warehouseIds.length === 0) {
      setMemberErrors((current) => ({ ...current, [member.user_id]: true }));
      return;
    }
    if (draft.roleCode !== member.role_code) {
      setPendingRoleSave(member);
      return;
    }
    void saveDraft(member);
  };

  const confirmRoleSave = async () => {
    if (!pendingRoleSave) return;
    const member = pendingRoleSave;
    setPendingRoleSave(null);
    await saveDraft(member);
  };

  if (loading) return <div className="p-6 text-sm text-slate-600">{t('members.loading')}</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={t('members.title')} description={t('members.description', { company: user?.company?.name ?? t('members.company') })} />
      {error && <Alert variant="error" message={t(error)} dismissible onDismiss={() => setError(null)} />}
      {notice && <Alert variant="success" message={t(notice.key, notice.name ? { name: notice.name } : undefined)} dismissible onDismiss={() => setNotice(null)} />}

      <Card padding="md" className="space-y-4">
        <div><h2 className="font-semibold text-slate-900">{t('members.invite')}</h2><p className="text-sm text-slate-600 mt-1">{t('members.inviteHelp')}</p></div>
        <form onSubmit={sendInvitation} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Input label={t('auth.email')} type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} required placeholder="member@example.com" />
          <Select label={t('members.role')} value={inviteRole} onChange={(event) => setInviteRole(event.target.value as RoleCode)} options={roleOptions} />
          <Button type="submit">{t('members.createInvite')}</Button>
        </form>
        {inviteRole !== 'ADMIN' && warehouses.length > 0 && (
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            {warehouses.map((warehouse) => <label key={warehouse.id} className="inline-flex gap-2 text-sm text-slate-700"><input type="checkbox" checked={inviteWarehouseIds.includes(warehouse.id)} onChange={() => toggleInviteWarehouse(warehouse.id)} />{warehouse.code}</label>)}
          </div>
        )}
        {inviteLink && <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm"><p className="font-medium text-slate-800">{t('members.inviteLink')}</p><a href={inviteLink} className="text-blue-700 break-all underline">{inviteLink}</a></div>}
      </Card>

      <Card padding="md" className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500"><tr><th className="py-3 pr-4">{t('members.member')}</th><th className="py-3 pr-4">{t('members.role')}</th><th className="py-3 pr-4">{t('members.warehouse')}</th><th className="py-3 pr-4">{t('members.status')}</th><th className="py-3">{t('members.actions')}</th></tr></thead>
          <tbody>
            {members.map((member) => {
              const draft = getDraft(member);
              const hasChanges = hasDraftChanges(member, draft);
              const isSaving = savingMemberId === member.user_id;
              const isRoleChanged = draft.roleCode !== member.role_code;
              const requiresWarehouse = draft.roleCode !== 'ADMIN';

              return (
                <tr key={member.user_id} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-900">{member.full_name || t('members.unnamed')} {member.is_owner && <span className="text-xs text-blue-700">{t('members.owner')}</span>}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </td>
                  <td className="py-3 pr-4 min-w-64">
                    <Select
                      id={`member-role-${member.user_id}`}
                      aria-label={t('members.memberRole', { email: member.email })}
                      value={draft.roleCode}
                      size="sm"
                      disabled={member.is_owner || isSaving}
                      onChange={(event) => setMemberRole(member, event.target.value as RoleCode)}
                      options={roleOptions}
                    />
                    {hasChanges && <p className="mt-1.5 text-[11px] font-medium text-amber-700">{t('members.unsaved')}</p>}
                    {isRoleChanged && draft.roleCode === 'ADMIN' && (
                      <Alert
                        variant="warning"
                        title={t('members.adminWarning')}
                        message={t('members.adminHelp')}
                        className="mt-2 p-3"
                      />
                    )}
                    {isRoleChanged && draft.roleCode !== 'ADMIN' && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                        {draft.roleCode === 'VIEWER' ? t('members.viewerHelp') : t('members.assignedHelp')}
                      </p>
                    )}
                    {member.is_owner && <p className="mt-1.5 text-[11px] text-slate-500">{t('members.ownerHelp')}</p>}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 min-w-52">
                    {!requiresWarehouse ? (
                      <div className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-2 text-xs font-medium text-blue-800">{t('members.allWarehouses')}</div>
                    ) : (
                      <div className="space-y-1.5">
                        {warehouses.map((warehouse) => (
                          <label key={warehouse.id} className="flex items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              checked={draft.warehouseIds.includes(warehouse.id)}
                              disabled={member.is_owner || isSaving}
                              onChange={() => toggleMemberWarehouse(member, warehouse.id)}
                            />
                            {warehouse.code}
                          </label>
                        ))}
                        {memberErrors[member.user_id] && <p role="alert" className="pt-1 text-xs font-medium text-red-600">{t('members.warehouseRequired')}</p>}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <Button
                      size="sm"
                      variant={member.membership_status === 'active' ? 'ghost' : 'secondary'}
                      disabled={hasChanges || isSaving}
                      onClick={() => void updateMember(member, member.role_code, member.membership_status === 'active' ? 'inactive' : 'active')}
                    >
                      {member.membership_status === 'active' ? t('members.disable') : t('members.enable')}
                    </Button>
                  </td>
                  <td className="py-3 space-y-2 min-w-40">
                    <Button size="sm" variant="secondary" loading={isSaving} disabled={!hasChanges || member.is_owner} onClick={() => requestSave(member)}>{t('members.save')}</Button>
                    {hasChanges && <Button size="sm" variant="ghost" disabled={isSaving} onClick={() => discardMemberChanges(member.user_id)}>{t('members.discard')}</Button>}
                    {user?.isOwner && !member.is_owner && member.role_code === 'ADMIN' && member.membership_status === 'active' && <Button size="sm" variant="secondary" disabled={hasChanges || isSaving} onClick={() => void transferOwner(member)}>{t('members.transfer')}</Button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {pendingRoleSave && (() => {
        const draft = getDraft(pendingRoleSave);
        const isAdminPromotion = draft.roleCode === 'ADMIN';
        return (
          <Modal
            open
            onClose={() => setPendingRoleSave(null)}
            closeOnBackdrop={false}
            title={t('members.confirmTitle')}
            description={t('members.confirmHelp')}
            actions={
              <>
                <Button variant="secondary" onClick={() => setPendingRoleSave(null)}>{t('common.cancel')}</Button>
                <Button onClick={() => void confirmRoleSave()}>{t('members.confirmSave')}</Button>
              </>
            }
          >
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">{pendingRoleSave.full_name || pendingRoleSave.email}</p>
                {pendingRoleSave.full_name && <p className="mt-0.5 text-xs text-slate-600">{pendingRoleSave.email}</p>}
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-slate-200 p-3">
                <div><p className="text-xs text-slate-500">{t('members.currentRole')}</p><p className="mt-1 font-semibold text-slate-900">{t(`topbar.roleShort.${pendingRoleSave.role_code}`)}</p></div>
                <span className="text-slate-400" aria-hidden="true">→</span>
                <div><p className="text-xs text-slate-500">{t('members.newRole')}</p><p className="mt-1 font-semibold text-slate-900">{t(`topbar.roleShort.${draft.roleCode}`)}</p></div>
              </div>
              {isAdminPromotion ? (
                <Alert
                  variant="warning"
                  title={t('members.grantAdmin')}
                  message={t('members.grantHelp')}
                />
              ) : (
                <Alert
                  variant="info"
                  title={t('members.scope')}
                  message={t('members.scopeHelp', { count: draft.warehouseIds.length })}
                />
              )}
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
