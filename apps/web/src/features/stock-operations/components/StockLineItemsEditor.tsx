import React from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { INITIAL_PRODUCTS } from '../../products/mockData';
import type { Product } from '../../products/types';
import type { LineValidationError } from '../types';
import {
  calcLineTotal,
  calcOrderTotals,
  formatCurrencyVND,
  getWarehouseAvailableStock,
} from '../workflow';

export interface EditableLineItem {
  id: string;
  productId: string;
  quantity: number;
  unitCost?: number;
}

export interface StockLineItemsEditorProps {
  mode: 'in' | 'out';
  warehouseCode: string;
  items: EditableLineItem[];
  lineErrors?: Record<string, LineValidationError>;
  itemsGeneralError?: string;
  products?: ReadonlyArray<Product>;
  onChangeLine: (id: string, patch: Partial<EditableLineItem>) => void;
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
}

export const StockLineItemsEditor: React.FC<StockLineItemsEditorProps> = ({
  mode,
  warehouseCode,
  items,
  lineErrors = {},
  itemsGeneralError,
  products = INITIAL_PRODUCTS,
  onChangeLine,
  onAddLine,
  onRemoveLine,
}) => {
  const { language } = useTranslation();

  const resolvedLinesForTotal = items.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    const effectiveCost =
      mode === 'in' ? (line.unitCost ?? 0) : (product?.costPrice ?? line.unitCost ?? 0);
    return {
      quantity: line.quantity,
      unitCost: effectiveCost,
    };
  });
  const totals = calcOrderTotals(resolvedLinesForTotal);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
            {language === 'vi' ? 'Danh sách sản phẩm' : 'Product Line Items'}
            <span className="text-[#DC2626] ml-0.5">*</span>
          </h4>
          <p className="text-[11px] text-[#64748B]">
            {mode === 'in'
              ? language === 'vi'
                ? 'Chọn từng mặt hàng, nhập số lượng và đơn giá nhập để tự động tính tổng.'
                : 'Select products, enter quantities and unit cost to calculate voucher totals.'
              : language === 'vi'
                ? `Số lượng xuất không được vượt quá tồn kho khả dụng tại ${warehouseCode || 'kho đã chọn'}.`
                : `Dispatch quantity cannot exceed available stock in ${warehouseCode || 'selected warehouse'}.`}
          </p>
        </div>

        <Button
          id="btn-add-line"
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAddLine}
          iconLeft={<Plus className="w-3.5 h-3.5" />}
        >
          {language === 'vi' ? 'Thêm dòng sản phẩm' : 'Add Product Line'}
        </Button>
      </div>

      {itemsGeneralError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#B91C1C]"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{itemsGeneralError}</span>
        </div>
      )}

      <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
        <div className="divide-y divide-[#E2E8F0]">
          {items.map((line, index) => {
            const product = products.find((p) => p.id === line.productId);
            const available =
              mode === 'out' && line.productId && warehouseCode
                ? getWarehouseAvailableStock(line.productId, warehouseCode, products)
                : 0;

            const effectiveCost =
              mode === 'in'
                ? (line.unitCost ?? 0)
                : (product?.costPrice ?? line.unitCost ?? 0);
            const lineTotal = calcLineTotal(line.quantity, effectiveCost);

            const err = lineErrors[line.id] ?? {};
            const liveOverStockError =
              mode === 'out' &&
              line.productId &&
              warehouseCode &&
              Number.isFinite(line.quantity) &&
              line.quantity > available
                ? language === 'vi'
                  ? `Vượt quá tồn kho khả dụng (${available})`
                  : `Exceeds available stock (${available})`
                : undefined;

            const qtyError = err.quantity || liveOverStockError;

            return (
              <div
                key={line.id}
                data-testid={`line-row-${index}`}
                className="p-3 bg-white hover:bg-[#F8FAFC]/60 transition-colors space-y-2.5"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  {/* Product selector */}
                  <div className={mode === 'in' ? 'md:col-span-5' : 'md:col-span-6'}>
                    <label
                      htmlFor={`line-product-${index}`}
                      className="block text-[11px] font-medium text-[#475569] mb-1"
                    >
                      {language === 'vi' ? `Sản phẩm #${index + 1}` : `Product #${index + 1}`}
                    </label>
                    <select
                      id={`line-product-${index}`}
                      value={line.productId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        const nextProd = products.find((p) => p.id === nextId);
                        onChangeLine(line.id, {
                          productId: nextId,
                          ...(mode === 'in' && nextProd
                            ? { unitCost: nextProd.costPrice ?? 250000 }
                            : {}),
                        });
                      }}
                      aria-invalid={Boolean(err.productId)}
                      className={`w-full h-9 rounded-md border bg-white px-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 ${
                        err.productId
                          ? 'border-[#DC2626] focus:ring-[#FEE2E2]'
                          : 'border-[#CBD5E1] focus:border-[#0284C7] focus:ring-[#E0F2FE]'
                      }`}
                    >
                      <option value="">
                        {language === 'vi' ? '-- Chọn sản phẩm --' : '-- Select product --'}
                      </option>
                      {products.map((p) => {
                        const stockLabel =
                          mode === 'out' && warehouseCode
                            ? ` · ${language === 'vi' ? 'Tồn' : 'Avail'}: ${getWarehouseAvailableStock(
                                p.id,
                                warehouseCode,
                                products
                              )}`
                            : '';
                        return (
                          <option key={p.id} value={p.id}>
                            {p.sku} — {p.name} ({p.unit}){stockLabel}
                          </option>
                        );
                      })}
                    </select>
                    {err.productId && (
                      <p className="mt-1 text-[11px] text-[#DC2626]" role="alert">
                        {err.productId}
                      </p>
                    )}

                    {mode === 'out' && line.productId && warehouseCode && (
                      <p
                        className={`mt-1 text-[11px] font-medium tabular-nums ${
                          available === 0 ? 'text-[#DC2626]' : 'text-[#475569]'
                        }`}
                      >
                        {language === 'vi'
                          ? `Tồn kho khả dụng tại ${warehouseCode}: `
                          : `Available in ${warehouseCode}: `}
                        <strong className="font-mono">
                          {available} {product?.unit ?? ''}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`line-qty-${index}`}
                      className="block text-[11px] font-medium text-[#475569] mb-1"
                    >
                      {language === 'vi' ? 'Số lượng' : 'Quantity'}
                    </label>
                    <input
                      id={`line-qty-${index}`}
                      type="number"
                      min={1}
                      step={1}
                      value={Number.isNaN(line.quantity) ? '' : line.quantity}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const parsed = raw === '' ? 0 : Number.parseInt(raw, 10);
                        onChangeLine(line.id, {
                          quantity: Number.isNaN(parsed) ? 0 : parsed,
                        });
                      }}
                      aria-invalid={Boolean(qtyError)}
                      className={`w-full h-9 rounded-md border bg-white px-2.5 text-xs font-mono tabular-nums text-right text-[#0F172A] focus:outline-none focus:ring-2 ${
                        qtyError
                          ? 'border-[#DC2626] bg-[#FEF2F2]/40 focus:ring-[#FEE2E2]'
                          : 'border-[#CBD5E1] focus:border-[#0284C7] focus:ring-[#E0F2FE]'
                      }`}
                    />
                    {qtyError && (
                      <p className="mt-1 text-[11px] text-[#DC2626] font-medium" role="alert">
                        {qtyError}
                      </p>
                    )}
                  </div>

                  {/* Unit Cost (editable in Stock In, read-only valuation in Stock Out) */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`line-cost-${index}`}
                      className="block text-[11px] font-medium text-[#475569] mb-1"
                    >
                      {language === 'vi' ? 'Đơn giá (₫)' : 'Unit Cost (₫)'}
                    </label>
                    {mode === 'in' ? (
                      <>
                        <input
                          id={`line-cost-${index}`}
                          type="number"
                          min={0}
                          step={1000}
                          value={Number.isNaN(line.unitCost ?? 0) ? '' : (line.unitCost ?? 0)}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const parsed = raw === '' ? 0 : Number(raw);
                            onChangeLine(line.id, {
                              unitCost: Number.isNaN(parsed) ? 0 : parsed,
                            });
                          }}
                          aria-invalid={Boolean(err.unitCost)}
                          className={`w-full h-9 rounded-md border bg-white px-2.5 text-xs font-mono tabular-nums text-right text-[#0F172A] focus:outline-none focus:ring-2 ${
                            err.unitCost
                              ? 'border-[#DC2626] focus:ring-[#FEE2E2]'
                              : 'border-[#CBD5E1] focus:border-[#0284C7] focus:ring-[#E0F2FE]'
                          }`}
                        />
                        {err.unitCost && (
                          <p className="mt-1 text-[11px] text-[#DC2626]" role="alert">
                            {err.unitCost}
                          </p>
                        )}
                      </>
                    ) : (
                      <div
                        id={`line-cost-${index}`}
                        className="h-9 flex items-center justify-end px-2.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-mono tabular-nums text-[#475569]"
                      >
                        {formatCurrencyVND(effectiveCost)}
                      </div>
                    )}
                  </div>

                  {/* Line total & Remove button */}
                  <div className={mode === 'in' ? 'md:col-span-3' : 'md:col-span-2'}>
                    <span className="block text-[11px] font-medium text-[#475569] mb-1">
                      {language === 'vi' ? 'Thành tiền' : 'Line Total'}
                    </span>
                    <div className="flex items-center justify-between gap-2 h-9">
                      <span
                        data-testid={`line-total-${index}`}
                        className="text-xs font-semibold font-mono tabular-nums text-[#0F172A] truncate"
                      >
                        {formatCurrencyVND(lineTotal)}
                      </span>
                      <button
                        type="button"
                        id={`line-remove-${index}`}
                        onClick={() => onRemoveLine(line.id)}
                        disabled={items.length <= 1}
                        aria-label={
                          language === 'vi'
                            ? `Xóa dòng sản phẩm #${index + 1}`
                            : `Remove product line #${index + 1}`
                        }
                        className="p-1.5 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals Footer */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#475569]">
            {language === 'vi' ? 'Số dòng hàng:' : 'Line count:'}{' '}
            <strong className="font-mono tabular-nums text-[#0F172A]">{items.length}</strong>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-xs text-[#475569]">
              {language === 'vi' ? 'Tổng số lượng:' : 'Total Qty:'}{' '}
              <strong
                data-testid="voucher-total-qty"
                className="font-mono tabular-nums text-sm text-[#0F172A]"
              >
                {totals.totalQty}
              </strong>
            </div>
            <div className="text-xs text-[#475569]">
              {language === 'vi' ? 'Tổng giá trị:' : 'Total Value:'}{' '}
              <strong
                data-testid="voucher-total-amount"
                className="font-mono tabular-nums text-sm font-bold text-[#0284C7]"
              >
                {formatCurrencyVND(totals.totalAmount)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
