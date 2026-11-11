import React, { useState } from 'react';
import { FileEdit, Send } from 'lucide-react';
import { Button, Input, Modal, Select } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { translateDomainLabel } from '../../../i18n/domainTranslate';
import { INITIAL_WAREHOUSES } from '../../master-data/mockData';
import { INITIAL_PRODUCTS } from '../../products/mockData';
import { STOCK_OUT_REASONS } from '../mockData';
import type {
  StockOrderValidationErrors,
  StockOutFormData,
  StockOutLineForm,
  StockOutOrder,
} from '../types';
import {
  getWarehouseAvailableStock,
  hasValidationErrors,
  validateStockOutForm,
} from '../workflow';
import { StockLineItemsEditor, type EditableLineItem } from './StockLineItemsEditor';

export interface StockOutFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialOrder?: StockOutOrder | null;
  onClose: () => void;
  onSave: (
    formData: StockOutFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ) => { ok: boolean; error?: string };
}

function createInitialOutLine(warehouseCode: string): StockOutLineForm {
  const firstInStock = INITIAL_PRODUCTS.find(
    (p) => getWarehouseAvailableStock(p.id, warehouseCode, INITIAL_PRODUCTS) > 0
  );
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId: firstInStock?.id ?? '',
    quantity: 1,
  };
}

interface FormContentProps {
  mode: 'create' | 'edit';
  initialOrder?: StockOutOrder | null;
  onClose: () => void;
  onSave: (
    formData: StockOutFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ) => { ok: boolean; error?: string };
}

const StockOutFormContent: React.FC<FormContentProps> = ({
  mode,
  initialOrder,
  onClose,
  onSave,
}) => {
  const { t, language } = useTranslation();

  const [formData, setFormData] = useState<StockOutFormData>(() => {
    if (mode === 'edit' && initialOrder) {
      return {
        warehouseCode: initialOrder.warehouseCode,
        destination: initialOrder.destination,
        reason: initialOrder.reason,
        items: initialOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
    }
    const defaultWh = INITIAL_WAREHOUSES[0]?.code ?? 'WH-01';
    return {
      warehouseCode: defaultWh,
      destination: '',
      reason: STOCK_OUT_REASONS[0].value,
      items: [createInitialOutLine(defaultWh)],
    };
  });

  const [errors, setErrors] = useState<StockOrderValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const warehouseOptions = INITIAL_WAREHOUSES.filter((w) => w.status === 'active').map((w) => ({
    value: w.code,
    label: `${w.code} — ${translateDomainLabel(language, 'warehouseNames', w.code, w.name)}`,
  }));

  const reasonOptions = STOCK_OUT_REASONS.map((r) => ({
    value: r.value,
    label: t(`stockOps.reasons.${r.value}`),
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
    const nextInStock = INITIAL_PRODUCTS.find(
      (p) =>
        !usedIds.has(p.id) &&
        getWarehouseAvailableStock(p.id, formData.warehouseCode, INITIAL_PRODUCTS) > 0
    );
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: nextInStock ? nextInStock.id : '',
          quantity: 1,
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
    const nextErrors = validateStockOutForm(formData, INITIAL_PRODUCTS, language);
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
          id="stock-out-warehouse"
          label={t('stockOps.form.out.dispatchWarehouse')}
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
          id="stock-out-reason"
          label={t('stockOps.form.out.reason')}
          required
          value={formData.reason}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, reason: e.target.value }));
            if (errors.reason) setErrors((prev) => ({ ...prev, reason: undefined }));
          }}
          options={reasonOptions}
          error={errors.reason}
          size="sm"
        />
      </div>

      <Input
        id="stock-out-destination"
        label={t('stockOps.form.out.destination')}
        required
        placeholder={t('stockOps.form.out.destinationPlaceholder')}
        value={formData.destination}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, destination: e.target.value }));
          if (errors.destination) setErrors((prev) => ({ ...prev, destination: undefined }));
        }}
        error={errors.destination}
        size="sm"
      />

      <StockLineItemsEditor
        mode="out"
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
          {t('stockOps.form.cancel')}
        </Button>
        <Button
          id="btn-save-draft"
          type="button"
          variant="secondary"
          onClick={() => handleAction('DRAFT')}
          iconLeft={<FileEdit className="w-4 h-4" />}
        >
          {t('stockOps.form.saveDraft')}
        </Button>
        <Button
          id="btn-submit-order"
          type="submit"
          variant="primary"
          iconLeft={<Send className="w-4 h-4" />}
        >
          {t('stockOps.form.submitForApproval')}
        </Button>
      </div>
    </form>
  );
};

export const StockOutFormModal: React.FC<StockOutFormModalProps> = ({
  open,
  mode,
  initialOrder,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  const title =
    mode === 'edit' && initialOrder
      ? t('stockOps.form.out.editTitle', { code: initialOrder.code })
      : t('stockOps.form.out.createTitle');

  const description = t('stockOps.form.out.description');

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="xl">
      {open && (
        <StockOutFormContent
          key={initialOrder?.id ?? `new-out-${mode}`}
          mode={mode}
          initialOrder={initialOrder}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
};
