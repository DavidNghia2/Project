import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../design-system';
import { CATEGORY_PARENT_GROUPS } from '../mockData';
import type { Category, CategoryFormData, MasterStatus, ValidationErrors } from '../types';

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
          label="Mã danh mục (Duy nhất)"
          required
          placeholder="VD: CAT-PRINTER"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          error={errors.code}
          size="sm"
        />
        <Input
          id="cat-input-name"
          label="Tên danh mục (Duy nhất)"
          required
          placeholder="VD: Thiết bị in ấn"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="cat-select-parent"
          label="Nhóm ngành chính"
          required
          value={formData.parentGroup}
          onChange={(e) => handleChange('parentGroup', e.target.value)}
          error={errors.parentGroup}
          options={CATEGORY_PARENT_GROUPS.map((g) => ({ value: g, label: g }))}
          size="sm"
        />
        <Select
          id="cat-select-status"
          label="Trạng thái"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as MasterStatus)}
          options={[
            { value: 'active', label: 'Đang hoạt động' },
            { value: 'inactive', label: 'Ngừng hoạt động' },
          ]}
          size="sm"
        />
      </div>

      <div>
        <label htmlFor="cat-input-desc" className="block text-xs font-medium text-[#0F172A] mb-1">
          Mô tả phạm vi danh mục
        </label>
        <textarea
          id="cat-input-desc"
          rows={3}
          placeholder="Mô tả nhóm mặt hàng thuộc danh mục này..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          Hủy bỏ
        </Button>
        <Button id="btn-submit-category" variant="primary" size="sm" type="submit">
          {mode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
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
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="md"
    title={mode === 'create' ? 'Thêm danh mục sản phẩm mới' : `Chỉnh sửa danh mục: ${initialItem?.code}`}
    description={
      mode === 'create'
        ? 'Khai báo mã danh mục và tên ngành hàng duy nhất để phân nhóm sản phẩm.'
        : 'Cập nhật thông tin phân loại và trạng thái hoạt động của danh mục.'
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
