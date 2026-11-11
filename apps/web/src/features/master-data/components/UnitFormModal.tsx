import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../design-system';
import type { UnitOfMeasure, UnitFormData, MeasureType, MasterStatus, ValidationErrors } from '../types';
import { useTranslation } from '../../../i18n';

export interface UnitFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UnitFormData) => { success: boolean; errors?: ValidationErrors };
  initialItem?: UnitOfMeasure | null;
  mode: 'create' | 'edit';
}

const defaultUnitForm: UnitFormData = {
  code: '',
  name: '',
  symbol: '',
  measureType: 'discrete',
  conversionNote: '',
  description: '',
  status: 'active',
};

interface UnitFormContentProps {
  initialItem?: UnitOfMeasure | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: UnitFormData) => { success: boolean; errors?: ValidationErrors };
}

const UnitFormContent: React.FC<UnitFormContentProps> = ({
  initialItem,
  mode,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UnitFormData>(() => {
    if (mode === 'edit' && initialItem) {
      return {
        code: initialItem.code,
        name: initialItem.name,
        symbol: initialItem.symbol,
        measureType: initialItem.measureType,
        conversionNote: initialItem.conversionNote,
        description: initialItem.description,
        status: initialItem.status,
      };
    }
    return defaultUnitForm;
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (field: keyof UnitFormData, value: string) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="uom-input-code"
          label={t('masterData.units.formCodeLabel')}
          required
          placeholder={t('masterData.units.formCodePlaceholder')}
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          error={errors.code}
          size="sm"
        />
        <Input
          id="uom-input-name"
          label={t('masterData.units.formNameLabel')}
          required
          placeholder={t('masterData.units.formNamePlaceholder')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
        <Input
          id="uom-input-symbol"
          label={t('masterData.units.formSymbolLabel')}
          required
          placeholder={t('masterData.units.formSymbolPlaceholder')}
          value={formData.symbol}
          onChange={(e) => handleChange('symbol', e.target.value)}
          error={errors.symbol}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="uom-select-type"
          label={t('masterData.units.formTypeLabel')}
          required
          value={formData.measureType}
          onChange={(e) => handleChange('measureType', e.target.value as MeasureType)}
          options={[
            { value: 'discrete', label: t('masterData.units.measureFormOpts.discrete') },
            { value: 'packaging', label: t('masterData.units.measureFormOpts.packaging') },
            { value: 'length', label: t('masterData.units.measureFormOpts.length') },
            { value: 'weight', label: t('masterData.units.measureFormOpts.weight') },
          ]}
          size="sm"
        />
        <Select
          id="uom-select-status"
          label={t('masterData.units.formStatusLabel')}
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
        id="uom-input-conversion"
        label={t('masterData.units.formConversionLabel')}
        placeholder={t('masterData.units.formConversionPlaceholder')}
        value={formData.conversionNote}
        onChange={(e) => handleChange('conversionNote', e.target.value)}
        size="sm"
      />

      <div>
        <label htmlFor="uom-input-desc" className="block text-xs font-medium text-[#0F172A] mb-1">
          {t('masterData.units.formDescLabel')}
        </label>
        <textarea
          id="uom-input-desc"
          rows={2}
          placeholder={t('masterData.units.formDescPlaceholder')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          {t('masterData.common.cancelBtn')}
        </Button>
        <Button id="btn-submit-unit" variant="primary" size="sm" type="submit">
          {mode === 'create'
            ? t('masterData.units.formCreateSubmit')
            : t('masterData.common.saveBtn')}
        </Button>
      </div>
    </form>
  );
};

export const UnitFormModal: React.FC<UnitFormModalProps> = ({
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
          ? t('masterData.units.formCreateTitle')
          : t('masterData.units.formEditTitle', { code: initialItem?.code ?? '' })
      }
      description={
        mode === 'create'
          ? t('masterData.units.formCreateDesc')
          : t('masterData.units.formEditDesc')
      }
    >
      {open ? (
        <UnitFormContent
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
