import React, { useState } from 'react';
import type { Product, ProductFormData, ValidationErrors } from '../types';
import { CATEGORIES_LIST, UNITS_LIST, WAREHOUSES_LIST } from '../mockData';
import { Modal, Button, Input, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';

export interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => { success: boolean; errors?: ValidationErrors };
  initialProduct?: Product | null;
  mode: 'create' | 'edit';
}

const defaultFormData: ProductFormData = {
  sku: '',
  name: '',
  category: CATEGORIES_LIST[0],
  unit: UNITS_LIST[0],
  barcode: '',
  imageUrl: '',
  description: '',
  reorderLevel: 10,
  initialStock: 0,
  primaryWarehouse: WAREHOUSES_LIST[0].code,
  status: 'active',
};

interface ProductFormContentProps {
  initialProduct?: Product | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: ProductFormData) => { success: boolean; errors?: ValidationErrors };
}

const ProductFormContent: React.FC<ProductFormContentProps> = ({
  initialProduct,
  mode,
  onClose,
  onSubmit,
}) => {
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (mode === 'edit' && initialProduct) {
      return {
        sku: initialProduct.sku,
        name: initialProduct.name,
        category: initialProduct.category,
        unit: initialProduct.unit,
        barcode: initialProduct.barcode || '',
        imageUrl: initialProduct.imageUrl || '',
        description: initialProduct.description || '',
        reorderLevel: initialProduct.reorderLevel,
        initialStock: initialProduct.onHand,
        primaryWarehouse: initialProduct.warehouses[0]?.warehouseCode || WAREHOUSES_LIST[0].code,
        status: initialProduct.status,
      };
    }
    return defaultFormData;
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = onSubmit(formData);
    if (result.success) {
      setIsSubmitting(false);
      onClose();
    } else {
      setIsSubmitting(false);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <Input
            id="product-input-sku"
            label={t('products.form.skuLabel')}
            required
            placeholder={t('products.form.skuPlaceholder')}
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
            error={errors.sku}
            hint={t('products.form.skuHint')}
            size="sm"
          />
        </div>

        {/* Barcode */}
        <div>
          <Input
            id="product-input-barcode"
            label={t('products.form.barcodeLabel')}
            placeholder={t('products.form.barcodePlaceholder')}
            value={formData.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            error={errors.barcode}
            hint={t('products.form.barcodeHint')}
            size="sm"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <Input
          id="product-input-name"
          label={t('products.form.nameLabel')}
          required
          placeholder={t('products.form.namePlaceholder')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <Select
            id="product-select-category"
            label={t('products.form.categoryLabel')}
            required
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            error={errors.category}
            options={CATEGORIES_LIST.map((c) => ({
              value: c,
              label: translateDomainLabel(language, 'categories', c),
            }))}
            size="sm"
          />
        </div>

        {/* Unit */}
        <div>
          <Select
            id="product-select-unit"
            label={t('products.form.unitLabel')}
            required
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            error={errors.unit}
            options={UNITS_LIST.map((u) => ({
              value: u,
              label: translateDomainLabel(language, 'units', u),
            }))}
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Reorder Level */}
        <div>
          <Input
            id="product-input-reorder"
            label={t('products.form.reorderLabel')}
            required
            type="number"
            min={0}
            placeholder="10"
            value={formData.reorderLevel}
            onChange={(e) => handleChange('reorderLevel', Math.max(0, parseInt(e.target.value) || 0))}
            error={errors.reorderLevel}
            hint={t('products.form.reorderHint')}
            size="sm"
          />
        </div>

        {/* Initial Stock (Only Create) */}
        <div>
          <Input
            id="product-input-stock"
            label={mode === 'create' ? t('products.form.initialStockLabel') : t('products.form.currentStockLabel')}
            type="number"
            min={0}
            placeholder="0"
            value={formData.initialStock}
            onChange={(e) => handleChange('initialStock', Math.max(0, parseInt(e.target.value) || 0))}
            error={errors.initialStock}
            disabled={mode === 'edit'}
            hint={mode === 'edit' ? t('products.form.stockEditHint') : t('products.form.stockCreateHint')}
            size="sm"
          />
        </div>

        {/* Warehouse (Only Create) */}
        <div>
          <Select
            id="product-select-warehouse"
            label={t('products.form.warehouseLabel')}
            required={mode === 'create'}
            disabled={mode === 'edit'}
            value={formData.primaryWarehouse}
            onChange={(e) => handleChange('primaryWarehouse', e.target.value)}
            error={errors.primaryWarehouse}
            options={WAREHOUSES_LIST.map((w) => ({
              value: w.code,
              label: translateDomainLabel(language, 'warehouseNames', w.code, w.name),
            }))}
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Image URL */}
        <div>
          <Input
            id="product-input-image"
            label={t('products.form.imageLabel')}
            placeholder={t('products.form.imagePlaceholder')}
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            hint={t('products.form.imageHint')}
            size="sm"
          />
        </div>

        {/* Status */}
        <div>
          <Select
            id="product-select-status"
            label={t('products.form.statusLabel')}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
            options={[
              { value: 'active', label: t('products.filters.statusActiveOpt') },
              { value: 'inactive', label: t('products.filters.statusInactiveOpt') },
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="productDesc" className="block text-xs font-medium text-[#0F172A] mb-1">
          {t('products.form.descLabel')}
        </label>
        <textarea
          id="productDesc"
          rows={3}
          placeholder={t('products.form.descPlaceholder')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        />
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} type="button">
          {t('products.form.cancelBtn')}
        </Button>
        <Button
          variant="primary"
          loading={isSubmitting}
          type="submit"
          id="btn-submit-product"
        >
          {mode === 'create' ? t('products.form.createSubmitBtn') : t('products.form.editSubmitBtn')}
        </Button>
      </div>
    </form>
  );
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialProduct,
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
          ? t('products.form.createTitle')
          : t('products.form.editTitle', { sku: initialProduct?.sku ?? '' })
      }
      description={
        mode === 'create'
          ? t('products.form.createDesc')
          : t('products.form.editDesc')
      }
    >
      {open ? (
        <ProductFormContent
          key={mode === 'edit' ? initialProduct?.id ?? 'edit' : 'new'}
          mode={mode}
          initialProduct={initialProduct}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
};
