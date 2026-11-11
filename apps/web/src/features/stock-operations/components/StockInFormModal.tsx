import React, { useState } from 'react';
import { FileEdit, Send } from 'lucide-react';
import { Button, Input, Modal, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { INITIAL_SUPPLIERS, INITIAL_WAREHOUSES } from '../../master-data/mockData';
import { INITIAL_PRODUCTS } from '../../products/mockData';
import type {
  StockInFormData,
  StockInLineForm,
  StockInOrder,
  StockOrderValidationErrors,
} from '../types';
import { hasValidationErrors, validateStockInForm } from '../workflow';
import { StockLineItemsEditor, type EditableLineItem } from './StockLineItemsEditor';

export interface StockInFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialOrder?: StockInOrder | null;
  onClose: () => void;
  onSave: (
    formData: StockInFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ) => { ok: boolean; error?: string };
}

function createEmptyLine(): StockInLineForm {
  const defaultProduct = INITIAL_PRODUCTS[0];
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId: defaultProduct?.id ?? '',
    quantity: 1,
    unitCost: defaultProduct?.costPrice ?? 250000,
  };
}

interface FormContentProps {
  mode: 'create' | 'edit';
  initialOrder?: StockInOrder | null;
  onClose: () => void;
  onSave: (
    formData: StockInFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ) => { ok: boolean; error?: string };
}

const StockInFormContent: React.FC<FormContentProps> = ({
  mode,
  initialOrder,
  onClose,
  onSave,
}) => {
  const { language } = useTranslation();

  const [formData, setFormData] = useState<StockInFormData>(() => {
    if (mode === 'edit' && initialOrder) {
      return {
        warehouseCode: initialOrder.warehouseCode,
        supplierCode: initialOrder.supplierCode,
        referenceNote: initialOrder.referenceNote,
        items: initialOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
      };
    }
    return {
      warehouseCode: INITIAL_WAREHOUSES[0]?.code ?? 'WH-01',
      supplierCode: INITIAL_SUPPLIERS[0]?.code ?? 'SUP-LOGI-VN',
      referenceNote: '',
      items: [createEmptyLine()],
    };
  });

  const [errors, setErrors] = useState<StockOrderValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const warehouseOptions = INITIAL_WAREHOUSES.filter((w) => w.status === 'active').map((w) => ({
    value: w.code,
    label: `${w.code} — ${w.name}`,
  }));

  const supplierOptions = INITIAL_SUPPLIERS.filter((s) => s.status === 'active').map((s) => ({
    value: s.code,
    label: `${s.code} — ${s.name}`,
  }));

  const handleChangeLine = (lineId: string, patch: Partial<EditableLineItem>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === lineId ? { ...item, ...patch } : item)),
    }));
    if (errors.lineErrors?.[lineId]) {
      setErrors((prev) => {
        const nextLines = { ...(prev.lineErrors ?? {}) };
        delete nextLines[lineId];
        return { ...prev, lineErrors: nextLines };
      });
    }
  };

  const handleAddLine = () => {
    const usedIds = new Set(formData.items.map((i) => i.productId));
    const unusedProduct = INITIAL_PRODUCTS.find((p) => !usedIds.has(p.id));
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: unusedProduct ? unusedProduct.id : '',
          quantity: 1,
          unitCost: unusedProduct ? (unusedProduct.costPrice ?? 250000) : 0,
        },
      ],
    }));
    if (errors.itemsGeneral) {
      setErrors((prev) => ({ ...prev, itemsGeneral: undefined }));
    }
  };

  const handleRemoveLine = (lineId: string) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== lineId),
    }));
  };

  const handleAction = (targetStatus: 'DRAFT' | 'SUBMITTED') => {
    setSubmitError(null);
    const nextErrors = validateStockInForm(formData, language);
    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    const res = onSave(formData, targetStatus);
    if (res.ok) {
      onClose();
    } else if (res.error) {
      setSubmitError(res.error);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleAction('SUBMITTED');
      }}
      className="space-y-5"
    >
      {submitError && (
        <div
          role="alert"
          className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs text-[#B91C1C]"
        >
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="stock-in-warehouse"
          label={language === 'vi' ? 'Kho tiếp nhận' : 'Receiving Warehouse'}
          required
          value={formData.warehouseCode}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, warehouseCode: e.target.value }));
            if (errors.warehouseCode) setErrors((prev) => ({ ...prev, warehouseCode: undefined }));
          }}
          options={warehouseOptions}
          error={errors.warehouseCode}
          size="sm"
        />

        <Select
          id="stock-in-supplier"
          label={language === 'vi' ? 'Nhà cung cấp' : 'Supplier'}
          required
          value={formData.supplierCode}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, supplierCode: e.target.value }));
            if (errors.supplierCode) setErrors((prev) => ({ ...prev, supplierCode: undefined }));
          }}
          options={supplierOptions}
          error={errors.supplierCode}
          size="sm"
        />
      </div>

      <Input
        id="stock-in-note"
        label={language === 'vi' ? 'Chứng từ tham chiếu / Ghi chú' : 'Reference Note / PO'}
        placeholder={
          language === 'vi'
            ? 'VD: PO-2026-450 · Nhập bổ sung hàng chuẩn bị chiến dịch cuối năm'
            : 'e.g. PO-2026-450 · Q4 replenishment batch'
        }
        value={formData.referenceNote}
        onChange={(e) => setFormData((prev) => ({ ...prev, referenceNote: e.target.value }))}
        size="sm"
      />

      <StockLineItemsEditor
        mode="in"
        warehouseCode={formData.warehouseCode}
        items={formData.items}
        lineErrors={errors.lineErrors}
        itemsGeneralError={errors.itemsGeneral}
        onChangeLine={handleChangeLine}
        onAddLine={handleAddLine}
        onRemoveLine={handleRemoveLine}
      />

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
        <Button type="button" variant="ghost" onClick={onClose}>
          {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
        </Button>
        <Button
          id="btn-save-draft"
          type="button"
          variant="secondary"
          onClick={() => handleAction('DRAFT')}
          iconLeft={<FileEdit className="w-4 h-4" />}
        >
          {language === 'vi' ? 'Lưu nháp' : 'Save Draft'}
        </Button>
        <Button
          id="btn-submit-order"
          type="submit"
          variant="primary"
          iconLeft={<Send className="w-4 h-4" />}
        >
          {language === 'vi' ? 'Gửi chờ duyệt' : 'Submit for Approval'}
        </Button>
      </div>
    </form>
  );
};

export const StockInFormModal: React.FC<StockInFormModalProps> = ({
  open,
  mode,
  initialOrder,
  onClose,
  onSave,
}) => {
  const { language } = useTranslation();

  const title =
    mode === 'edit' && initialOrder
      ? language === 'vi'
        ? `Chỉnh sửa phiếu nhập ${initialOrder.code}`
        : `Edit Stock-In Voucher ${initialOrder.code}`
      : language === 'vi'
        ? 'Tạo phiếu nhập kho mới'
        : 'Create New Stock-In Voucher';

  const description =
    language === 'vi'
      ? 'Chọn kho tiếp nhận, nhà cung cấp và danh sách sản phẩm nhập. Có thể lưu nháp hoặc gửi phê duyệt ngay.'
      : 'Select warehouse, supplier, and product lines. Save as draft or submit directly for manager approval.';

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="xl">
      {open && (
        <StockInFormContent
          key={initialOrder?.id ?? `new-in-${mode}`}
          mode={mode}
          initialOrder={initialOrder}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
};
