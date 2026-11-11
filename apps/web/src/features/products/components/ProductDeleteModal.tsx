import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Product } from '../types';
import { Modal, Button } from '../../../design-system';

export interface ProductDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  product,
}) => {
  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Xác nhận xóa sản phẩm"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Xác nhận xóa
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-xs text-red-900">Cảnh báo thao tác xóa dữ liệu</p>
            <p className="text-xs text-red-700 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm{' '}
              <strong className="font-bold text-red-900">{product.name}</strong> (Mã SKU:{' '}
              <span className="font-mono font-bold text-red-900">{product.sku}</span>)?
            </p>
          </div>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          Sản phẩm sẽ bị loại bỏ khỏi danh mục hiển thị. Dữ liệu lịch sử giao dịch liên quan trong sổ cái sẽ được lưu vết theo quy định kiểm toán kho.
        </p>
      </div>
    </Modal>
  );
};
