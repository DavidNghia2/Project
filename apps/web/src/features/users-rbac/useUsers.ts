import { useCallback, useMemo, useState } from 'react';
import { type Language } from '../../i18n';
import { translateKey } from '../../i18n/translate';
import { useHookLanguage } from '../../i18n/useTranslation';
import { INITIAL_SYSTEM_USERS } from './mockUsers';
import type {
  RoleCode,
  SystemUser,
  UserFormData,
  UserStatus,
  UserValidationErrors,
} from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateUserForm(
  data: UserFormData,
  existingUsers: SystemUser[],
  editingUserId: string | null,
  language: Language = 'vi'
): UserValidationErrors {
  const errors: UserValidationErrors = {};
  const trimmedName = data.fullName.trim();
  const trimmedEmail = data.email.trim().toLowerCase();
  const trimmedDept = data.department.trim();

  if (!trimmedName) {
    errors.fullName = translateKey(language, 'usersRbac.validation.fullNameRequired');
  } else if (trimmedName.length < 2) {
    errors.fullName = translateKey(language, 'usersRbac.validation.fullNameMin');
  }

  if (!trimmedEmail) {
    errors.email = translateKey(language, 'usersRbac.validation.emailRequired');
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = translateKey(language, 'usersRbac.validation.emailInvalid');
  } else {
    const duplicate = existingUsers.some(
      (u) => u.email.trim().toLowerCase() === trimmedEmail && u.id !== editingUserId
    );
    if (duplicate) {
      errors.email = translateKey(language, 'usersRbac.validation.emailDuplicate');
    }
  }

  if (!trimmedDept) {
    errors.department = translateKey(language, 'usersRbac.validation.departmentRequired');
  }

  if (data.role !== 'ADMIN') {
    const specificCodes = data.assignedWarehouses.filter((c) => c !== 'ALL');
    if (specificCodes.length === 0) {
      errors.assignedWarehouses = translateKey(
        language,
        'usersRbac.validation.warehousesRequired'
      );
    }
  }

  return errors;
}

export function normalizeWarehousesForRole(role: RoleCode, warehouses: string[]): string[] {
  if (role === 'ADMIN') {
    return ['ALL'];
  }
  return Array.from(new Set(warehouses.filter((code) => code !== 'ALL')));
}

export interface UseUsersReturn {
  users: SystemUser[];
  filteredUsers: SystemUser[];
  search: string;
  setSearch: (val: string) => void;
  roleFilter: RoleCode | 'ALL';
  setRoleFilter: (val: RoleCode | 'ALL') => void;
  statusFilter: UserStatus | 'ALL';
  setStatusFilter: (val: UserStatus | 'ALL') => void;
  resetFilters: () => void;
  summary: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
  };
  createUser: (
    data: UserFormData,
    language?: Language
  ) => { ok: true; user: SystemUser } | { ok: false; errors: UserValidationErrors };
  updateUser: (
    id: string,
    data: UserFormData,
    language?: Language
  ) => { ok: true; user: SystemUser } | { ok: false; errors: UserValidationErrors };
  toggleUserStatus: (
    id: string,
    language?: Language
  ) => { ok: true; user: SystemUser } | { ok: false; error: string };
}

export function useUsers(initialUsers: SystemUser[] = INITIAL_SYSTEM_USERS): UseUsersReturn {
  const activeLanguage = useHookLanguage('vi');
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleCode | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');

  const resetFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (query) {
        const hay = `${u.id} ${u.fullName} ${u.email} ${u.department}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
      admins: users.filter((u) => u.role === 'ADMIN' && u.status === 'active').length,
    }),
    [users]
  );

  const createUser = useCallback(
    (
      data: UserFormData,
      language: Language = activeLanguage
    ): { ok: true; user: SystemUser } | { ok: false; errors: UserValidationErrors } => {
      const errors = validateUserForm(data, users, null, language);
      if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
      }

      const maxNum = users.reduce((max, u) => {
        const n = Number(u.id.replace('USR-', ''));
        return Number.isFinite(n) && n > max ? n : max;
      }, 0);
      const nextId = `USR-${String(maxNum + 1).padStart(3, '0')}`;
      const nowIso = new Date().toISOString();

      const newUser: SystemUser = {
        id: nextId,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        department: data.department.trim(),
        role: data.role,
        assignedWarehouses: normalizeWarehousesForRole(data.role, data.assignedWarehouses),
        status: data.status,
        lastActive: translateKey(language, 'usersRbac.mockLastActive'),
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setUsers((prev) => [newUser, ...prev]);
      return { ok: true, user: newUser };
    },
    [users, activeLanguage]
  );

  const updateUser = useCallback(
    (
      id: string,
      data: UserFormData,
      language: Language = activeLanguage
    ): { ok: true; user: SystemUser } | { ok: false; errors: UserValidationErrors } => {
      const errors = validateUserForm(data, users, id, language);
      if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
      }

      const target = users.find((u) => u.id === id);
      if (!target) {
        return {
          ok: false,
          errors: { fullName: translateKey(language, 'usersRbac.errors.userNotFound') },
        };
      }

      const normalizedWarehouses = normalizeWarehousesForRole(data.role, data.assignedWarehouses);
      const updatedUser: SystemUser = {
        ...target,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        department: data.department.trim(),
        role: data.role,
        assignedWarehouses: normalizedWarehouses,
        status: data.status,
        updatedAt: new Date().toISOString(),
      };

      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      return { ok: true, user: updatedUser };
    },
    [users, activeLanguage]
  );

  const toggleUserStatus = useCallback(
    (
      id: string,
      language: Language = activeLanguage
    ): { ok: true; user: SystemUser } | { ok: false; error: string } => {
      const target = users.find((u) => u.id === id);
      if (!target) {
        return {
          ok: false,
          error: translateKey(language, 'usersRbac.errors.userNotFound'),
        };
      }

      const nextStatus: UserStatus = target.status === 'active' ? 'inactive' : 'active';
      const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.status === 'active');

      if (target.role === 'ADMIN' && target.status === 'active' && activeAdmins.length <= 1) {
        return {
          ok: false,
          error: translateKey(language, 'usersRbac.errors.lastAdminDeactivate'),
        };
      }

      const updated: SystemUser = {
        ...target,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return { ok: true, user: updated };
    },
    [users, activeLanguage]
  );

  return {
    users,
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
  };
}
