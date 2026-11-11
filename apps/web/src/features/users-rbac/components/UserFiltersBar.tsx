import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { Button, Input, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { ROLE_META, ROLE_ORDER } from '../rbacMatrix';
import type { RoleCode, UserStatus } from '../types';

export interface UserFiltersBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: RoleCode | 'ALL';
  onRoleFilterChange: (val: RoleCode | 'ALL') => void;
  statusFilter: UserStatus | 'ALL';
  onStatusFilterChange: (val: UserStatus | 'ALL') => void;
  onReset: () => void;
}

export const UserFiltersBar: React.FC<UserFiltersBarProps> = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
}) => {
  const { t } = useTranslation();
  const hasFilters = search.trim() !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
      <div className="flex-1 min-w-0">
        <Input
          id="user-search-input"
          label={t('usersRbac.filters.searchLabel')}
          placeholder={t('usersRbac.filters.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          prefix={<Search className="w-4 h-4" />}
          size="sm"
        />
      </div>

      <div className="w-full md:w-56">
        <Select
          id="user-role-filter"
          label={t('usersRbac.filters.roleLabel')}
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value as RoleCode | 'ALL')}
          size="sm"
          options={[
            {
              value: 'ALL',
              label: t('usersRbac.filters.allRoles'),
            },
            ...ROLE_ORDER.map((r) => ({
              value: r,
              label: t(ROLE_META[r].labelKey),
            })),
          ]}
        />
      </div>

      <div className="w-full md:w-44">
        <Select
          id="user-status-filter"
          label={t('usersRbac.filters.statusLabel')}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as UserStatus | 'ALL')}
          size="sm"
          options={[
            {
              value: 'ALL',
              label: t('usersRbac.filters.allStatuses'),
            },
            {
              value: 'active',
              label: t('usersRbac.filters.statusActive'),
            },
            {
              value: 'inactive',
              label: t('usersRbac.filters.statusInactive'),
            },
          ]}
        />
      </div>

      {hasFilters && (
        <Button
          id="btn-reset-user-filters"
          type="button"
          variant="secondary"
          size="sm"
          iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={onReset}
          className="shrink-0"
        >
          {t('usersRbac.filters.reset')}
        </Button>
      )}
    </div>
  );
};
