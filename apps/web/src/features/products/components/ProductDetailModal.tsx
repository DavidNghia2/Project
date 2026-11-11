import React from 'react';
import { Barcode, Package, Warehouse, Calendar, Pencil } from 'lucide-react';
import type { Product } from '../types';
import { Modal, Button, Badge } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';

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
  const { t, language } = useTranslation();

  if (!product) return null;

  const isOutOfStock = product.onHand === 0;
  const isLowStock = product.onHand <= product.reorderLevel;
  const displayCategory = translateDomainLabel(language, 'categories', product.category);
  const displayUnit = translateDomainLabel(language, 'units', product.unit);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <span>{t('products.detail.titlePrefix')}</span>
          <span className="font-mono text-blue-600">{product.sku}</span>
        </div>
      }
      description={t('products.detail.description')}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('products.detail.closeBtn')}
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
              {t('products.detail.editBtn')}
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
                {product.status === 'active' ? t('products.detail.statusActive') : t('products.detail.statusInactive')}
              </Badge>
              <span className="text-xs text-[#64748B] font-medium">{displayCategory}</span>
              <span className="text-xs text-[#CBD5E1]">•</span>
              <span className="text-xs text-[#64748B] font-medium">{displayUnit}</span>
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
            <span className="text-xs text-[#64748B] block">{t('products.detail.totalOnHand')}</span>
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
              <span className="text-xs text-[#64748B]">{displayUnit}</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg">
            <span className="text-xs text-[#64748B] block">{t('products.detail.minThreshold')}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xl font-bold text-slate-800">
                {product.reorderLevel.toLocaleString()}
              </span>
              <span className="text-xs text-[#64748B]">{displayUnit}</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg col-span-2 sm:col-span-1">
            <span className="text-xs text-[#64748B] block">{t('products.detail.stockCondition')}</span>
            <div className="mt-1">
              {isOutOfStock ? (
                <Badge variant="error" size="sm">
                  {t('products.detail.condOutOfStock')}
                </Badge>
              ) : isLowStock ? (
                <Badge variant="warning" size="sm">
                  {t('products.detail.condLowStock')}
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  {t('products.detail.condHealthy')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Warehouse Distribution */}
        <div className="space-y-2">
          <h5 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <Warehouse className="w-4 h-4 text-blue-600" />
            <span>{t('products.detail.whBreakdownHeading')}</span>
          </h5>

          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
                <tr>
                  <th className="py-2 px-3">{t('products.detail.whColCode')}</th>
                  <th className="py-2 px-3">{t('products.detail.whColName')}</th>
                  <th className="py-2 px-3 text-right">{t('products.detail.whColQty')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {product.warehouses.map((wh) => (
                  <tr key={wh.warehouseCode} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600">
                      {wh.warehouseCode}
                    </td>
                    <td className="py-2 px-3 text-[#334155]">
                      {translateDomainLabel(language, 'warehouseNames', wh.warehouseCode, wh.warehouseName)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-[#0F172A]">
                      {wh.quantity.toLocaleString()} {displayUnit}
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
            <span className="font-semibold text-xs text-[#0F172A] block">{t('products.detail.descHeading')}</span>
            <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              {product.description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {t('products.detail.createdLabel')} {new Date(product.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
          </span>
          <span>
            {t('products.detail.updatedLabel')} {new Date(product.updatedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
          </span>
        </div>
      </div>
    </Modal>
  );
};
