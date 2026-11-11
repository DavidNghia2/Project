import React, { useState } from 'react';
import { Shield, Warehouse as WarehouseIcon } from 'lucide-react';
import { Alert, Button, Checkbox, Input, Modal, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';
import { AVAILABLE_WAREHOUSE_OPTIONS } from '../mockUsers';
import { ROLE_META, ROLE_ORDER } from '../rbacMatrix';
import type {
  RoleCode,
  SystemUser,
  UserFormData,
  UserStatus,
  UserValidationErrors,
} from '../types';

export interface UserFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialUser: SystemUser | null;
  onClose: () => void;
  onSubmit: (
    data: UserFormData,
    mode: 'create' | 'edit',
    editingUserId: string | null
  ) => { ok: true; user: SystemUser } | { ok: false; errors: UserValidationErrors };
}

interface UserFormContentProps {
  mode: 'create' | 'edit';
  initialUser: SystemUser | null;
  onClose: () => void;
  onSubmit: UserFormModalProps['onSubmit'];
}

const DEFAULT_FORM_STATE: UserFormData = {
  fullName: '',
  email: '',
  department: 'Vận hành Kho Miền Bắc',
  role: 'WAREHOUSE_STAFF',
  assignedWarehouses: ['WH-01'],
  status: 'active',
};

const UserFormContent: React.FC<UserFormContentProps> = ({
  mode,
  initialUser,
  onClose,
  onSubmit,
}) => {
  const { t, language } = useTranslation();

  const [formData, setFormData] = useState<UserFormData>(() => {
    if (mode === 'edit' && initialUser) {
      return {
        fullName: initialUser.fullName,
        email: initialUser.email,
        department: translateDomainLabel(language, 'departments', initialUser.department),
        role: initialUser.role,
        assignedWarehouses:
          initialUser.role === 'ADMIN'
            ? ['ALL']
            : initialUser.assignedWarehouses.filter((w) => w !== 'ALL'),
        status: initialUser.status,
      };
    }
    return {
      ...DEFAULT_FORM_STATE,
      department: translateDomainLabel(language, 'departments', DEFAULT_FORM_STATE.department),
    };
  });

  const [errors, setErrors] = useState<UserValidationErrors>({});

  const handleRoleChange = (nextRole: RoleCode) => {
    setFormData((prev) => {
      if (nextRole === 'ADMIN') {
        return { ...prev, role: nextRole, assignedWarehouses: ['ALL'] };
      }
      const cleaned = prev.assignedWarehouses.filter((w) => w !== 'ALL');
      return {
        ...prev,
        role: nextRole,
        assignedWarehouses: cleaned.length > 0 ? cleaned : ['WH-01'],
      };
    });
    setErrors((prev) => ({ ...prev, assignedWarehouses: undefined }));
  };

  const handleToggleWarehouse = (warehouseCode: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.assignedWarehouses.filter((w) => w !== 'ALL');
      const next = checked
        ? Array.from(new Set([...current, warehouseCode]))
        : current.filter((c) => c !== warehouseCode);
      return { ...prev, assignedWarehouses: next };
    });
    setErrors((prev) => ({ ...prev, assignedWarehouses: undefined }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onSubmit(formData, mode, initialUser ? initialUser.id : null);
    if (!res.ok) {
      setErrors(res.errors);
      return;
    }
    onClose();
  };

  const roleMeta = ROLE_META[formData.role];

  return (
    <form id="user-form" onSubmit={handleFormSubmit} className="space-y-4">
      <Alert variant="info" message={t('usersRbac.form.mockAlert')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="user-input-fullname"
          label={t('usersRbac.form.fullNameLabel')}
          required
          placeholder={t('usersRbac.form.fullNamePlaceholder')}
          value={formData.fullName}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, fullName: e.target.value }));
            setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          error={errors.fullName}
          size="sm"
        />

        <Input
          id="user-input-email"
          label={t('usersRbac.form.emailLabel')}
          type="email"
          required
          placeholder={t('usersRbac.form.emailPlaceholder')}
          value={formData.email}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, email: e.target.value }));
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="user-input-department"
          label={t('usersRbac.form.departmentLabel')}
          required
          placeholder={t('usersRbac.form.departmentPlaceholder')}
          value={formData.department}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, department: e.target.value }));
            setErrors((prev) => ({ ...prev, department: undefined }));
          }}
          error={errors.department}
          size="sm"
        />

        <Select
          id="user-select-status"
          label={t('usersRbac.form.statusLabel')}
          required
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, status: e.target.value as UserStatus }))
          }
          size="sm"
          options={[
            {
              value: 'active',
              label: t('usersRbac.form.statusActiveOption'),
            },
            {
              value: 'inactive',
              label: t('usersRbac.form.statusInactiveOption'),
            },
          ]}
        />
      </div>

      {/* Role Assignment */}
      <div className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
          <Shield className="w-4 h-4 text-[#2563EB]" />
          <span>{t('usersRbac.form.roleSectionTitle')}</span>
        </div>

        <Select
          id="user-select-role"
          label={t('usersRbac.form.roleLabel')}
          required
          value={formData.role}
          onChange={(e) => handleRoleChange(e.target.value as RoleCode)}
          size="sm"
          options={ROLE_ORDER.map((code) => ({
            value: code,
            label: t(ROLE_META[code].labelKey),
          }))}
        />

        <p className="text-xs text-[#475569]">{t(roleMeta.scopeNoteKey)}</p>
      </div>

      {/* Warehouse Scope Assignment */}
      <div className="p-3.5 rounded-lg border border-[#E2E8F0] bg-white space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
            <WarehouseIcon className="w-4 h-4 text-[#0284C7]" />
            <span>{t('usersRbac.form.warehouseSectionTitle')}</span>
          </div>
          {formData.role === 'ADMIN' && (
            <span className="text-[11px] font-mono font-semibold text-[#2563EB]">
              {t('usersRbac.form.allWarehousesBadge')}
            </span>
          )}
        </div>

        {formData.role === 'ADMIN' ? (
          <p className="text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2">
            {t('usersRbac.form.adminAllWarehousesNote')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {AVAILABLE_WAREHOUSE_OPTIONS.map((wh) => {
              const checked = formData.assignedWarehouses.includes(wh.code);
              return (
                <div
                  key={wh.code}
                  className={`p-2 rounded-md border transition-colors ${
                    checked
                      ? 'border-[#93C5FD] bg-[#EFF6FF]/50'
                      : 'border-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
                >
                  <Checkbox
                    id={`user-wh-${wh.code}`}
                    checked={checked}
                    onChange={(isChecked) => handleToggleWarehouse(wh.code, isChecked)}
                    label={
                      <span className="text-xs font-medium text-[#0F172A]">
                        <span className="font-mono font-semibold text-[#2563EB]">
                          {wh.code}
                        </span>{' '}
                        — {translateDomainLabel(language, 'warehouseNames', wh.code, wh.name)}
                        {wh.status === 'inactive' && (
                          <span className="text-[11px] text-[#64748B]">
                            {' '}
                            ({t('usersRbac.form.reserveTag')})
                          </span>
                        )}
                      </span>
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {errors.assignedWarehouses && (
          <p role="alert" className="text-xs text-[#DC2626] font-medium">
            {errors.assignedWarehouses}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          {t('usersRbac.form.cancel')}
        </Button>
        <Button id="btn-submit-user-form" type="submit" variant="primary" size="sm">
          {mode === 'create' ? t('usersRbac.form.submitCreate') : t('usersRbac.form.submitEdit')}
        </Button>
      </div>
    </form>
  );
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  mode,
  initialUser,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const title =
    mode === 'create'
      ? t('usersRbac.form.createTitle')
      : t('usersRbac.form.editTitle', { id: initialUser?.id ?? '' });

  const description =
    mode === 'create'
      ? t('usersRbac.form.createDescription')
      : t('usersRbac.form.editDescription');

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="lg">
      {open && (
        <UserFormContent
          key={`${mode}-${initialUser?.id ?? 'new'}`}
          mode={mode}
          initialUser={initialUser}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
};
