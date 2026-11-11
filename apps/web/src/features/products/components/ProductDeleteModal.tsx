import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../../i18n';
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
  const { t } = useTranslation();
  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={t('products.delete.title')}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('products.delete.cancelBtn')}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {t('products.delete.confirmBtn')}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-xs text-red-900">{t('products.delete.warningHeading')}</p>
            <p className="text-xs text-red-700 leading-relaxed">
              {t('products.delete.promptPrefix')}{' '}
              <strong className="font-bold text-red-900">{product.name}</strong> ({t('products.delete.promptSkuLabel')}{' '}
              <span className="font-mono font-bold text-red-900">{product.sku}</span>)?
            </p>
          </div>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          {t('products.delete.auditNote')}
        </p>
      </div>
    </Modal>
  );
};
