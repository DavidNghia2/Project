import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../design-system';
import { WAREHOUSE_REGIONS } from '../mockData';
import type { Warehouse, WarehouseFormData, WarehouseType, MasterStatus, ValidationErrors } from '../types';

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
          label="Mã kho (Duy nhất)"
          required
          placeholder="VD: WH-05"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          error={errors.code}
          size="sm"
        />
        <Input
          id="wh-input-name"
          label="Tên kho hàng"
          required
          placeholder="VD: Kho Trung Chuyển Cần Thơ"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          id="wh-select-region"
          label="Khu vực"
          required
          value={formData.region}
          onChange={(e) => handleChange('region', e.target.value)}
          error={errors.region}
          options={WAREHOUSE_REGIONS.map((r) => ({ value: r, label: r }))}
          size="sm"
        />
        <Select
          id="wh-select-type"
          label="Loại hình kho"
          required
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as WarehouseType)}
          options={[
            { value: 'main', label: 'Kho trung tâm (Main Hub)' },
            { value: 'regional', label: 'Kho vùng (Regional)' },
            { value: 'transit', label: 'Kho trung chuyển (Transit)' },
            { value: 'reserve', label: 'Kho dự phòng (Reserve)' },
          ]}
          size="sm"
        />
        <Select
          id="wh-select-status"
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
        id="wh-input-address"
        label="Địa điểm / Khu công nghiệp"
        required
        placeholder="VD: Đường số 2, KCN Trà Nóc, Bình Thủy, Cần Thơ"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
        size="sm"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          id="wh-input-manager"
          label="Quản lý phụ trách"
          required
          placeholder="VD: Nguyễn Minh Hải"
          value={formData.manager}
          onChange={(e) => handleChange('manager', e.target.value)}
          error={errors.manager}
          size="sm"
        />
        <Input
          id="wh-input-staff"
          label="Số nhân sự"
          type="number"
          min={0}
          value={formData.staffCount}
          onChange={(e) => handleChange('staffCount', parseInt(e.target.value, 10) || 0)}
          error={errors.staffCount}
          size="sm"
        />
        <Input
          id="wh-input-capacity"
          label="Tỷ lệ lấp đầy (%)"
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
          Ghi chú vận hành
        </label>
        <textarea
          id="wh-input-desc"
          rows={2}
          placeholder="Ghi chú phân khu kệ, năng lực bốc xếp hoặc giờ nhận hàng..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-md text-xs sm:text-sm bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
        />
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          Hủy bỏ
        </Button>
        <Button id="btn-submit-warehouse" variant="primary" size="sm" type="submit">
          {mode === 'create' ? 'Tạo kho hàng' : 'Lưu thay đổi'}
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
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="lg"
    title={mode === 'create' ? 'Thêm kho hàng mới' : `Chỉnh sửa kho hàng: ${initialItem?.code}`}
    description={
      mode === 'create'
        ? 'Khai báo thông tin mã kho duy nhất, địa điểm lưu trữ và nhân sự quản lý.'
        : 'Cập nhật thông tin vận hành, phụ trách và trạng thái kho hàng.'
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
