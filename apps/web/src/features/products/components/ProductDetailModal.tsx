import React from 'react';
import { Barcode, Package, Warehouse, Calendar, Pencil } from 'lucide-react';
import type { Product } from '../types';
import { Modal, Button, Badge } from '../../../design-system';

export interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  canEdit?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  open,
  onClose,
  product,
  onEdit,
  canEdit = true,
}) => {
  if (!product) return null;

  const isOutOfStock = product.onHand === 0;
  const isLowStock = product.onHand <= product.reorderLevel;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <span>Chi tiết sản phẩm:</span>
          <span className="font-mono text-blue-600">{product.sku}</span>
        </div>
      }
      description="Xem thông số kỹ thuật, tình trạng lưu kho và lịch sử cập nhật."
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          {canEdit && (
            <Button
              variant="primary"
              iconLeft={<Pencil className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onEdit(product);
              }}
            >
              Chỉnh sửa thông tin
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5 text-xs sm:text-sm">
        {/* Top Info Card */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white border border-[#CBD5E1] overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-10 h-10 text-slate-300" />
            )}
          </div>

          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={product.status === 'active' ? 'success' : 'neutral'} size="sm" dot>
                {product.status === 'active' ? 'Đang hoạt động' : 'Ngừng kinh doanh'}
              </Badge>
              <span className="text-xs text-[#64748B] font-medium">{product.category}</span>
              <span className="text-xs text-[#CBD5E1]">•</span>
              <span className="text-xs text-[#64748B] font-medium">{product.unit}</span>
            </div>

            <h4 className="text-base font-bold text-[#0F172A] leading-snug">{product.name}</h4>

            {product.barcode && (
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
                <Barcode className="w-4 h-4 text-slate-400" />
                <span>{product.barcode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stock Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg">
            <span className="text-xs text-[#64748B] block">Tổng tồn khả dụng</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`font-mono text-xl font-bold ${
                  isOutOfStock
                    ? 'text-red-600'
                    : isLowStock
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {product.onHand.toLocaleString()}
              </span>
              <span className="text-xs text-[#64748B]">{product.unit}</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg">
            <span className="text-xs text-[#64748B] block">Ngưỡng an toàn tối thiểu</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xl font-bold text-slate-800">
                {product.reorderLevel.toLocaleString()}
              </span>
              <span className="text-xs text-[#64748B]">{product.unit}</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg col-span-2 sm:col-span-1">
            <span className="text-xs text-[#64748B] block">Tình trạng tồn</span>
            <div className="mt-1">
              {isOutOfStock ? (
                <Badge variant="error" size="sm">
                  Cần nhập ngay
                </Badge>
              ) : isLowStock ? (
                <Badge variant="warning" size="sm">
                  Dưới ngưỡng định mức
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Mức tồn ổn định
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Warehouse Distribution */}
        <div className="space-y-2">
          <h5 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <Warehouse className="w-4 h-4 text-blue-600" />
            <span>Phân bổ tồn kho thực tế theo từng kho bãi</span>
          </h5>

          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                <tr>
                  <th className="py-2 px-3">Mã kho</th>
                  <th className="py-2 px-3">Tên kho vật lý</th>
                  <th className="py-2 px-3 text-right">Số lượng tồn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {product.warehouses.map((wh) => (
                  <tr key={wh.warehouseCode} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600">
                      {wh.warehouseCode}
                    </td>
                    <td className="py-2 px-3 text-[#334155]">{wh.warehouseName}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-[#0F172A]">
                      {wh.quantity.toLocaleString()} {product.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Description & Timestamps */}
        {product.description && (
          <div className="space-y-1">
            <span className="font-semibold text-xs text-[#0F172A] block">Mô tả sản phẩm</span>
            <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              {product.description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Khởi tạo: {new Date(product.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <span>
            Cập nhật lần cuối: {new Date(product.updatedAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </Modal>
  );
};
