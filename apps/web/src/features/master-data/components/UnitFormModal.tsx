import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../design-system';
import type { UnitOfMeasure, UnitFormData, MeasureType, MasterStatus, ValidationErrors } from '../types';

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
          label="Mã đơn vị (Duy nhất)"
          required
          placeholder="VD: UOM-PACK"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          error={errors.code}
          size="sm"
        />
        <Input
          id="uom-input-name"
          label="Tên đơn vị tính"
          required
          placeholder="VD: Gói (Pack)"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
        <Input
          id="uom-input-symbol"
          label="Ký hiệu (Duy nhất)"
          required
          placeholder="VD: Gói"
          value={formData.symbol}
          onChange={(e) => handleChange('symbol', e.target.value)}
          error={errors.symbol}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="uom-select-type"
          label="Nhóm đo lường"
          required
          value={formData.measureType}
          onChange={(e) => handleChange('measureType', e.target.value as MeasureType)}
          options={[
            { value: 'discrete', label: 'Đơn vị đếm rời (Discrete)' },
            { value: 'packaging', label: 'Quy cách đóng gói (Packaging)' },
            { value: 'length', label: 'Chiều dài / Cuộn (Length)' },
            { value: 'weight', label: 'Khối lượng (Weight)' },
          ]}
          size="sm"
        />
        <Select
          id="uom-select-status"
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

      <Input
        id="uom-input-conversion"
        label="Quy ước quy đổi chuẩn"
        placeholder="VD: 1 Gói = 10 Cái tiêu chuẩn"
        value={formData.conversionNote}
        onChange={(e) => handleChange('conversionNote', e.target.value)}
        size="sm"
      />

      <div>
        <label htmlFor="uom-input-desc" className="block text-xs font-medium text-[#0F172A] mb-1">
          Mô tả áp dụng
        </label>
        <textarea
          id="uom-input-desc"
          rows={2}
          placeholder="Ghi chú phạm vi mặt hàng áp dụng đơn vị tính này..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          Hủy bỏ
        </Button>
        <Button id="btn-submit-unit" variant="primary" size="sm" type="submit">
          {mode === 'create' ? 'Tạo đơn vị tính' : 'Lưu thay đổi'}
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
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="lg"
    title={mode === 'create' ? 'Thêm đơn vị tính mới' : `Chỉnh sửa đơn vị tính: ${initialItem?.code}`}
    description={
      mode === 'create'
        ? 'Khai báo mã đơn vị, tên gọi và ký hiệu viết tắt duy nhất cho hệ thống đo lường.'
        : 'Cập nhật thông tin quy đổi và trạng thái sử dụng đơn vị tính.'
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
