import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../design-system';
import { WAREHOUSE_REGIONS } from '../mockData';
import type { Warehouse, WarehouseFormData, WarehouseType, MasterStatus, ValidationErrors } from '../types';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';

export interface WarehouseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WarehouseFormData) => { success: boolean; errors?: ValidationErrors };
  initialItem?: Warehouse | null;
  mode: 'create' | 'edit';
}

const defaultWarehouseForm: WarehouseFormData = {
  code: '',
  name: '',
  region: WAREHOUSE_REGIONS[0],
  type: 'regional',
  address: '',
  manager: '',
  staffCount: 5,
  capacityPercent: 0,
  description: '',
  status: 'active',
};

interface WarehouseFormContentProps {
  initialItem?: Warehouse | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: WarehouseFormData) => { success: boolean; errors?: ValidationErrors };
}

const WarehouseFormContent: React.FC<WarehouseFormContentProps> = ({
  initialItem,
  mode,
  onClose,
  onSubmit,
}) => {
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState<WarehouseFormData>(() => {
    if (mode === 'edit' && initialItem) {
      return {
        code: initialItem.code,
        name: initialItem.name,
        region: initialItem.region,
        type: initialItem.type,
        address: initialItem.address,
        manager: initialItem.manager,
        staffCount: initialItem.staffCount,
        capacityPercent: initialItem.capacityPercent,
        description: initialItem.description || '',
        status: initialItem.status,
      };
    }
    return defaultWarehouseForm;
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (field: keyof WarehouseFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onSubmit(formData);
    if (res.success) {
      onClose();
    } else if (res.errors) {
      setErrors(res.errors);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="wh-input-code"
          label={t('masterData.warehouses.formCodeLabel')}
          required
          placeholder={t('masterData.warehouses.formCodePlaceholder')}
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          error={errors.code}
          size="sm"
        />
        <Input
          id="wh-input-name"
          label={t('masterData.warehouses.formNameLabel')}
          required
          placeholder={t('masterData.warehouses.formNamePlaceholder')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          id="wh-select-region"
          label={t('masterData.warehouses.formRegionLabel')}
          required
          value={formData.region}
          onChange={(e) => handleChange('region', e.target.value)}
          error={errors.region}
          options={WAREHOUSE_REGIONS.map((r) => ({
            value: r,
            label: translateDomainLabel(language, 'regions', r),
          }))}
          size="sm"
        />
        <Select
          id="wh-select-type"
          label={t('masterData.warehouses.formTypeLabel')}
          required
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as WarehouseType)}
          options={[
            { value: 'main', label: t('masterData.warehouses.typeFormOpts.main') },
            { value: 'regional', label: t('masterData.warehouses.typeFormOpts.regional') },
            { value: 'transit', label: t('masterData.warehouses.typeFormOpts.transit') },
            { value: 'reserve', label: t('masterData.warehouses.typeFormOpts.reserve') },
          ]}
          size="sm"
        />
        <Select
          id="wh-select-status"
          label={t('masterData.warehouses.formStatusLabel')}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as MasterStatus)}
          options={[
            { value: 'active', label: t('masterData.common.statusActive') },
            { value: 'inactive', label: t('masterData.common.statusInactive') },
          ]}
          size="sm"
        />
      </div>

      <Input
        id="wh-input-address"
        label={t('masterData.warehouses.formAddressLabel')}
        required
        placeholder={t('masterData.warehouses.formAddressPlaceholder')}
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
        size="sm"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="wh-input-manager"
          label={t('masterData.warehouses.formManagerLabel')}
          required
          placeholder={t('masterData.warehouses.formManagerPlaceholder')}
          value={formData.manager}
          onChange={(e) => handleChange('manager', e.target.value)}
          error={errors.manager}
          size="sm"
        />
        <Input
          id="wh-input-staff"
          label={t('masterData.warehouses.formStaffLabel')}
          type="number"
          min={0}
          value={formData.staffCount}
          onChange={(e) => handleChange('staffCount', parseInt(e.target.value, 10) || 0)}
          error={errors.staffCount}
          size="sm"
        />
        <Input
          id="wh-input-capacity"
          label={t('masterData.warehouses.formCapacityLabel')}
          type="number"
          min={0}
          max={100}
          value={formData.capacityPercent}
          onChange={(e) => handleChange('capacityPercent', parseInt(e.target.value, 10) || 0)}
          error={errors.capacityPercent}
          size="sm"
        />
      </div>

      <div>
        <label htmlFor="wh-input-desc" className="block text-xs font-medium text-[#0F172A] mb-1">
          {t('masterData.warehouses.formNotesLabel')}
        </label>
        <textarea
          id="wh-input-desc"
          rows={2}
          placeholder={t('masterData.warehouses.formNotesPlaceholder')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          {t('masterData.common.cancelBtn')}
        </Button>
        <Button id="btn-submit-warehouse" variant="primary" size="sm" type="submit">
          {mode === 'create'
            ? t('masterData.warehouses.formCreateSubmit')
            : t('masterData.common.saveBtn')}
        </Button>
      </div>
    </form>
  );
};

export const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialItem,
  mode,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        mode === 'create'
          ? t('masterData.warehouses.formCreateTitle')
          : t('masterData.warehouses.formEditTitle', { code: initialItem?.code ?? '' })
      }
      description={
        mode === 'create'
          ? t('masterData.warehouses.formCreateDesc')
          : t('masterData.warehouses.formEditDesc')
      }
    >
      {open ? (
        <WarehouseFormContent
          key={mode === 'edit' ? initialItem?.id ?? 'edit' : 'new'}
          mode={mode}
          initialItem={initialItem}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
};
