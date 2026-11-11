import React, { useState } from 'react';
import type { Product, ProductFormData, ValidationErrors } from '../types';
import { CATEGORIES_LIST, UNITS_LIST, WAREHOUSES_LIST } from '../mockData';
import { Modal, Button, Input, Select } from '../../../design-system';

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
            label="Mã SKU (Duy nhất)"
            required
            placeholder="VD: SKU-DELL-P2419"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
            error={errors.sku}
            hint="Mã định danh duy nhất không được trùng lặp"
            size="sm"
          />
        </div>

        {/* Barcode */}
        <div>
          <Input
            id="product-input-barcode"
            label="Mã vạch (Barcode / EAN-13)"
            placeholder="VD: 8936012345678"
            value={formData.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            error={errors.barcode}
            hint="Để trống nếu muốn hệ thống tự sinh mã vạch"
            size="sm"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <Input
          id="product-input-name"
          label="Tên sản phẩm"
          required
          placeholder="VD: Màn hình Dell Professional 24 inch FHD IPS"
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
            label="Danh mục ngành hàng"
            required
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            error={errors.category}
            options={CATEGORIES_LIST.map((c) => ({ value: c, label: c }))}
            size="sm"
          />
        </div>

        {/* Unit */}
        <div>
          <Select
            id="product-select-unit"
            label="Đơn vị tính"
            required
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            error={errors.unit}
            options={UNITS_LIST.map((u) => ({ value: u, label: u }))}
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Reorder Level */}
        <div>
          <Input
            id="product-input-reorder"
            label="Ngưỡng tồn an toàn"
            required
            type="number"
            min={0}
            placeholder="10"
            value={formData.reorderLevel}
            onChange={(e) => handleChange('reorderLevel', Math.max(0, parseInt(e.target.value) || 0))}
            error={errors.reorderLevel}
            hint="Cảnh báo khi tồn <= ngưỡng"
            size="sm"
          />
        </div>

        {/* Initial Stock (Only Create) */}
        <div>
          <Input
            id="product-input-stock"
            label={mode === 'create' ? 'Tồn ban đầu' : 'Tồn hiện tại'}
            type="number"
            min={0}
            placeholder="0"
            value={formData.initialStock}
            onChange={(e) => handleChange('initialStock', Math.max(0, parseInt(e.target.value) || 0))}
            error={errors.initialStock}
            disabled={mode === 'edit'}
            hint={mode === 'edit' ? 'Tồn kho chỉ đổi qua phiếu nhập/xuất' : 'Số lượng nhập ban đầu'}
            size="sm"
          />
        </div>

        {/* Warehouse (Only Create) */}
        <div>
          <Select
            id="product-select-warehouse"
            label="Kho lưu trữ ban đầu"
            required={mode === 'create'}
            disabled={mode === 'edit'}
            value={formData.primaryWarehouse}
            onChange={(e) => handleChange('primaryWarehouse', e.target.value)}
            error={errors.primaryWarehouse}
            options={WAREHOUSES_LIST.map((w) => ({ value: w.code, label: w.name }))}
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Image URL */}
        <div>
          <Input
            id="product-input-image"
            label="Đường dẫn ảnh sản phẩm (URL)"
            placeholder="https://images.unsplash.com/..."
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            hint="Để trống nếu sử dụng ảnh mặc định"
            size="sm"
          />
        </div>

        {/* Status */}
        <div>
          <Select
            id="product-select-status"
            label="Trạng thái kinh doanh"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
            options={[
              { value: 'active', label: 'Đang hoạt động (Active)' },
              { value: 'inactive', label: 'Ngừng kinh doanh (Inactive)' },
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="productDesc" className="block text-xs font-medium text-[#0F172A] mb-1">
          Mô tả thông số kỹ thuật & quy cách
        </label>
        <textarea
          id="productDesc"
          rows={3}
          placeholder="Nhập thông tin xuất xứ, chất liệu, tiêu chuẩn đóng gói..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        />
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} type="button">
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          loading={isSubmitting}
          type="submit"
          id="btn-submit-product"
        >
          {mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
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
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={mode === 'create' ? 'Thêm mới sản phẩm vào kho' : `Chỉnh sửa sản phẩm: ${initialProduct?.sku}`}
      description={
        mode === 'create'
          ? 'Khai báo thông tin chi tiết mặt hàng, mã SKU, quy cách và định mức tồn an toàn.'
          : 'Cập nhật thông tin danh mục, quy cách và mức tồn tối thiểu cho sản phẩm.'
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
