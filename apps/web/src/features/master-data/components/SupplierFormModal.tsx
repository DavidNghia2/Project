import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../design-system';
import { SUPPLIER_PAYMENT_TERMS } from '../mockData';
import { CATEGORIES_LIST } from '../../products/mockData';
import type { Supplier, SupplierFormData, MasterStatus, ValidationErrors } from '../types';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';

export interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => { success: boolean; errors?: ValidationErrors };
  initialItem?: Supplier | null;
  mode: 'create' | 'edit';
}

const defaultSupplierForm: SupplierFormData = {
  code: '',
  name: '',
  categoryFocus: CATEGORIES_LIST[0],
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  paymentTerms: SUPPLIER_PAYMENT_TERMS[2],
  notes: '',
  status: 'active',
};

interface SupplierFormContentProps {
  initialItem?: Supplier | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => { success: boolean; errors?: ValidationErrors };
}

const SupplierFormContent: React.FC<SupplierFormContentProps> = ({
  initialItem,
  mode,
  onClose,
  onSubmit,
}) => {
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState<SupplierFormData>(() => {
    if (mode === 'edit' && initialItem) {
      return {
        code: initialItem.code,
        name: initialItem.name,
        categoryFocus: initialItem.categoryFocus,
        contactPerson: initialItem.contactPerson,
        phone: initialItem.phone,
        email: initialItem.email,
        address: initialItem.address,
        paymentTerms: initialItem.paymentTerms,
        notes: initialItem.notes,
        status: initialItem.status,
      };
    }
    return defaultSupplierForm;
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (field: keyof SupplierFormData, value: string) => {
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
          id="sup-input-code"
          label={t('masterData.suppliers.formCodeLabel')}
          required
          placeholder={t('masterData.suppliers.formCodePlaceholder')}
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          error={errors.code}
          size="sm"
        />
        <Input
          id="sup-input-name"
          label={t('masterData.suppliers.formNameLabel')}
          required
          placeholder={t('masterData.suppliers.formNamePlaceholder')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="sup-input-contact"
          label={t('masterData.suppliers.formContactLabel')}
          required
          placeholder={t('masterData.suppliers.formContactPlaceholder')}
          value={formData.contactPerson}
          onChange={(e) => handleChange('contactPerson', e.target.value)}
          error={errors.contactPerson}
          size="sm"
        />
        <Input
          id="sup-input-phone"
          label={t('masterData.suppliers.formPhoneLabel')}
          required
          placeholder={t('masterData.suppliers.formPhonePlaceholder')}
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          size="sm"
        />
        <Input
          id="sup-input-email"
          label={t('masterData.suppliers.formEmailLabel')}
          type="email"
          required
          placeholder={t('masterData.suppliers.formEmailPlaceholder')}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          size="sm"
        />
      </div>

      <Input
        id="sup-input-address"
        label={t('masterData.suppliers.formAddressLabel')}
        required
        placeholder={t('masterData.suppliers.formAddressPlaceholder')}
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
        size="sm"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="sup-input-focus"
          label={t('masterData.suppliers.formFocusLabel')}
          placeholder={t('masterData.suppliers.formFocusPlaceholder')}
          value={formData.categoryFocus}
          onChange={(e) => handleChange('categoryFocus', e.target.value)}
          size="sm"
        />
        <Select
          id="sup-select-terms"
          label={t('masterData.suppliers.formTermsLabel')}
          value={formData.paymentTerms}
          onChange={(e) => handleChange('paymentTerms', e.target.value)}
          options={SUPPLIER_PAYMENT_TERMS.map((p) => ({
            value: p,
            label: translateDomainLabel(language, 'paymentTerms', p),
          }))}
          size="sm"
        />
        <Select
          id="sup-select-status"
          label={t('masterData.suppliers.formStatusLabel')}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as MasterStatus)}
          options={[
            { value: 'active', label: t('masterData.suppliers.formStatusActive') },
            { value: 'inactive', label: t('masterData.suppliers.formStatusInactive') },
          ]}
          size="sm"
        />
      </div>

      <div>
        <label htmlFor="sup-input-notes" className="block text-xs font-medium text-[#0F172A] mb-1">
          {t('masterData.suppliers.formNotesLabel')}
        </label>
        <textarea
          id="sup-input-notes"
          rows={2}
          placeholder={t('masterData.suppliers.formNotesPlaceholder')}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          {t('masterData.common.cancelBtn')}
        </Button>
        <Button id="btn-submit-supplier" variant="primary" size="sm" type="submit">
          {mode === 'create'
            ? t('masterData.suppliers.formCreateSubmit')
            : t('masterData.common.saveBtn')}
        </Button>
      </div>
    </form>
  );
};

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
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
          ? t('masterData.suppliers.formCreateTitle')
          : t('masterData.suppliers.formEditTitle', { code: initialItem?.code ?? '' })
      }
      description={
        mode === 'create'
          ? t('masterData.suppliers.formCreateDesc')
          : t('masterData.suppliers.formEditDesc')
      }
    >
      {open ? (
        <SupplierFormContent
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
