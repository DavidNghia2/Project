import type { Product } from '../products/types';
import { INITIAL_PRODUCTS } from '../products/mockData';
import type { Language } from '../../i18n';
import { translateKey } from '../../i18n/translate';
import type {
  LineValidationError,
  OrderStatus,
  StatusHistoryEntry,
  StockInFormData,
  StockInOrder,
  StockOrderValidationErrors,
  StockOutFormData,
  StockOutOrder,
} from './types';

export const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['COMPLETED'],
  REJECTED: ['DRAFT'],
  COMPLETED: [],
};

export function calcLineTotal(quantity: number, unitCost: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) return 0;
  if (quantity <= 0 || unitCost < 0) return 0;
  return Math.round(quantity * unitCost);
}

export function calcOrderTotals(
  items: ReadonlyArray<{ quantity: number; unitCost: number }>
): { totalQty: number; totalAmount: number } {
  return items.reduce(
    (acc, item) => {
      const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? Math.floor(item.quantity) : 0;
      const lineTotal = calcLineTotal(qty, item.unitCost);
      return {
        totalQty: acc.totalQty + qty,
        totalAmount: acc.totalAmount + lineTotal,
      };
    },
    { totalQty: 0, totalAmount: 0 }
  );
}

export function formatCurrencyVND(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `${new Intl.NumberFormat('vi-VN').format(safe)} ₫`;
}

export function getWarehouseAvailableStock(
  productId: string,
  warehouseCode: string,
  products: ReadonlyArray<Product> = INITIAL_PRODUCTS
): number {
  if (!productId || !warehouseCode) return 0;
  const product = products.find((p) => p.id === productId);
  if (!product) return 0;
  const wh = product.warehouses.find((w) => w.warehouseCode === warehouseCode);
  return wh ? wh.quantity : 0;
}

export function hasValidationErrors(errors: StockOrderValidationErrors): boolean {
  if (
    errors.warehouseCode ||
    errors.supplierCode ||
    errors.destination ||
    errors.reason ||
    errors.itemsGeneral
  ) {
    return true;
  }
  if (errors.lineErrors) {
    return Object.values(errors.lineErrors).some(
      (lineErr) => Boolean(lineErr.productId || lineErr.quantity || lineErr.unitCost)
    );
  }
  return false;
}

function validateCommonLines(
  items: ReadonlyArray<{ id: string; productId: string; quantity: number }>,
  language: Language
): { itemsGeneral?: string; lineErrors: Record<string, LineValidationError> } {
  const lineErrors: Record<string, LineValidationError> = {};
  if (items.length === 0) {
    return {
      itemsGeneral: translateKey(language, 'stockOps.validation.addAtLeastOneLine'),
      lineErrors,
    };
  }

  const seenProducts = new Set<string>();
  for (const item of items) {
    const err: LineValidationError = {};
    if (!item.productId) {
      err.productId =
        translateKey(language, 'stockOps.validation.selectProduct');
    } else if (seenProducts.has(item.productId)) {
      err.productId =
        translateKey(language, 'stockOps.validation.duplicateProduct');
    } else {
      seenProducts.add(item.productId);
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      err.quantity = translateKey(language, 'stockOps.validation.qtyPositiveInt');
    }

    if (err.productId || err.quantity) {
      lineErrors[item.id] = err;
    }
  }

  return { lineErrors };
}

export function validateStockInForm(
  form: StockInFormData,
  language: Language = 'vi'
): StockOrderValidationErrors {
  const errors: StockOrderValidationErrors = {};

  if (!form.warehouseCode.trim()) {
    errors.warehouseCode =
      translateKey(language, 'stockOps.validation.selectReceivingWarehouse');
  }
  if (!form.supplierCode.trim()) {
    errors.supplierCode =
      translateKey(language, 'stockOps.validation.selectSupplier');
  }

  const { itemsGeneral, lineErrors } = validateCommonLines(form.items, language);
  if (itemsGeneral) {
    errors.itemsGeneral = itemsGeneral;
  }

  for (const item of form.items) {
    if (!Number.isFinite(item.unitCost) || item.unitCost <= 0) {
      lineErrors[item.id] = {
        ...(lineErrors[item.id] ?? {}),
        unitCost: translateKey(language, 'stockOps.validation.unitCostPositive'),
      };
    }
  }

  if (Object.keys(lineErrors).length > 0) {
    errors.lineErrors = lineErrors;
  }

  return errors;
}

export function validateStockOutForm(
  form: StockOutFormData,
  products: ReadonlyArray<Product> = INITIAL_PRODUCTS,
  language: Language = 'vi'
): StockOrderValidationErrors {
  const errors: StockOrderValidationErrors = {};

  if (!form.warehouseCode.trim()) {
    errors.warehouseCode =
      translateKey(language, 'stockOps.validation.selectDispatchWarehouse');
  }
  if (!form.destination.trim() || form.destination.trim().length < 2) {
    errors.destination = translateKey(language, 'stockOps.validation.destinationRequired');
  }
  if (!form.reason.trim()) {
    errors.reason =
      translateKey(language, 'stockOps.validation.selectDispatchReason');
  }

  const { itemsGeneral, lineErrors } = validateCommonLines(form.items, language);
  if (itemsGeneral) {
    errors.itemsGeneral = itemsGeneral;
  }

  if (form.warehouseCode.trim()) {
    for (const item of form.items) {
      if (!item.productId) continue;
      const available = getWarehouseAvailableStock(item.productId, form.warehouseCode, products);
      if (available <= 0) {
        lineErrors[item.id] = {
          ...(lineErrors[item.id] ?? {}),
          quantity: translateKey(language, 'stockOps.validation.outOfStock'),
        };
      } else if (Number.isFinite(item.quantity) && item.quantity > available) {
        lineErrors[item.id] = {
          ...(lineErrors[item.id] ?? {}),
          quantity: translateKey(language, 'stockOps.validation.exceedsStock', {
            warehouse: form.warehouseCode,
            available,
          }),
        };
      }
    }
  }

  if (Object.keys(lineErrors).length > 0) {
    errors.lineErrors = lineErrors;
  }

  return errors;
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function canApproveOrReject(
  createdBy: string,
  currentActor: string,
  language: Language = 'vi'
): { allowed: boolean; reason?: string } {
  if (!currentActor.trim()) {
    return {
      allowed: false,
      reason: translateKey(language, 'stockOps.validation.operatorRequired'),
    };
  }

  if (createdBy.trim().toLowerCase() === currentActor.trim().toLowerCase()) {
    return {
      allowed: false,
      reason: translateKey(language, 'stockOps.validation.makerCheckerRule'),
    };
  }

  return { allowed: true };
}

export function applyStatusTransition<T extends StockInOrder | StockOutOrder>(
  order: T,
  nextStatus: OrderStatus,
  actor: string,
  note = '',
  language: Language = 'vi'
): { ok: true; order: T } | { ok: false; error: string } {
  if (!canTransition(order.status, nextStatus)) {
    return {
      ok: false,
      error: translateKey(language, 'stockOps.validation.invalidTransition', {
        from: order.status,
        to: nextStatus,
      }),
    };
  }

  if (nextStatus === 'APPROVED' || nextStatus === 'REJECTED') {
    const check = canApproveOrReject(order.createdBy, actor, language);
    if (!check.allowed) {
      return {
        ok: false,
        error: check.reason ?? translateKey(language, 'stockOps.validation.transitionNotAllowed'),
      };
    }
  }

  if (nextStatus === 'REJECTED' && !note.trim()) {
    return {
      ok: false,
      error: translateKey(language, 'stockOps.validation.rejectionReasonRequired'),
    };
  }

  const now = new Date().toISOString();
  const defaultNotes: Record<OrderStatus, string> = {
    DRAFT: translateKey(language, 'stockOps.history.defaultDRAFT'),
    SUBMITTED: translateKey(language, 'stockOps.history.defaultSUBMITTED'),
    APPROVED: translateKey(language, 'stockOps.history.defaultAPPROVED'),
    COMPLETED: translateKey(language, 'stockOps.history.defaultCOMPLETED'),
    REJECTED: note.trim(),
  };

  const historyEntry: StatusHistoryEntry = {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fromStatus: order.status,
    toStatus: nextStatus,
    actor,
    timestamp: now,
    note: note.trim() || defaultNotes[nextStatus],
  };

  return {
    ok: true,
    order: {
      ...order,
      status: nextStatus,
      updatedAt: now,
      statusHistory: [...order.statusHistory, historyEntry],
    },
  };
}
