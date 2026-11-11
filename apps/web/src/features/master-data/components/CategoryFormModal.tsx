import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../design-system';
import { CATEGORY_PARENT_GROUPS } from '../mockData';
import type { Category, CategoryFormData, MasterStatus, ValidationErrors } from '../types';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';

export interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => { success: boolean; errors?: ValidationErrors };
  initialItem?: Category | null;
  mode: 'create' | 'edit';
}

const defaultCategoryForm: CategoryFormData = {
  code: '',
  name: '',
  parentGroup: CATEGORY_PARENT_GROUPS[0],
  description: '',
  status: 'active',
};

interface CategoryFormContentProps {
  initialItem?: Category | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => { success: boolean; errors?: ValidationErrors };
}

const CategoryFormContent: React.FC<CategoryFormContentProps> = ({
  initialItem,
  mode,
  onClose,
  onSubmit,
}) => {
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState<CategoryFormData>(() => {
    if (mode === 'edit' && initialItem) {
      return {
        code: initialItem.code,
        name: initialItem.name,
        parentGroup: initialItem.parentGroup,
        description: initialItem.description,
        status: initialItem.status,
      };
    }
    return defaultCategoryForm;
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (field: keyof CategoryFormData, value: string) => {
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
          id="cat-input-code"
          label={t('masterData.categories.formCodeLabel')}
          required
          placeholder={t('masterData.categories.formCodePlaceholder')}
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          error={errors.code}
          size="sm"
        />
        <Input
          id="cat-input-name"
          label={t('masterData.categories.formNameLabel')}
          required
          placeholder={t('masterData.categories.formNamePlaceholder')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="cat-select-parent"
          label={t('masterData.categories.formParentGroupLabel')}
          required
          value={formData.parentGroup}
          onChange={(e) => handleChange('parentGroup', e.target.value)}
          error={errors.parentGroup}
          options={CATEGORY_PARENT_GROUPS.map((g) => ({
            value: g,
            label: translateDomainLabel(language, 'parentGroups', g),
          }))}
          size="sm"
        />
        <Select
          id="cat-select-status"
          label={t('masterData.categories.formStatusLabel')}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as MasterStatus)}
          options={[
            { value: 'active', label: t('masterData.common.statusActive') },
            { value: 'inactive', label: t('masterData.common.statusInactive') },
          ]}
          size="sm"
        />
      </div>

      <div>
        <label htmlFor="cat-input-desc" className="block text-xs font-medium text-[#0F172A] mb-1">
          {t('masterData.categories.formDescLabel')}
        </label>
        <textarea
          id="cat-input-desc"
          rows={3}
          placeholder={t('masterData.categories.formDescPlaceholder')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          {t('masterData.common.cancelBtn')}
        </Button>
        <Button id="btn-submit-category" variant="primary" size="sm" type="submit">
          {mode === 'create'
            ? t('masterData.categories.formCreateSubmit')
            : t('masterData.common.saveBtn')}
        </Button>
      </div>
    </form>
  );
};

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
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
      size="md"
      title={
        mode === 'create'
          ? t('masterData.categories.formCreateTitle')
          : t('masterData.categories.formEditTitle', { code: initialItem?.code ?? '' })
      }
      description={
        mode === 'create'
          ? t('masterData.categories.formCreateDesc')
          : t('masterData.categories.formEditDesc')
      }
    >
      {open ? (
        <CategoryFormContent
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
