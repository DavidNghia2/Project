import { useMemo, useState } from 'react';
import { INITIAL_PRODUCTS } from '../products/mockData';
import type { Language } from '../../i18n';
import { translateKey } from '../../i18n/translate';
import { useHookLanguage } from '../../i18n/useTranslation';
import {
  INITIAL_STOCK_IN_ORDERS,
  INITIAL_STOCK_OUT_ORDERS,
  SIMULATED_ACTORS,
  lookupSupplierName,
  lookupWarehouseName,
} from './mockData';
import type {
  OrderStatus,
  StockInFormData,
  StockInLineItem,
  StockInOrder,
  StockOutFormData,
  StockOutLineItem,
  StockOutOrder,
} from './types';
import {
  applyStatusTransition,
  calcLineTotal,
  calcOrderTotals,
  getWarehouseAvailableStock,
  hasValidationErrors,
  validateStockInForm,
  validateStockOutForm,
} from './workflow';

export interface OrderFilterState {
  search: string;
  status: string;
  warehouseCode: string;
}

function nextVoucherCode(existingCodes: string[], prefix: 'IN-2026-' | 'OUT-2026-', floor: number): string {
  const maxNum = existingCodes.reduce((max, code) => {
    const match = code.match(/(\d+)$/);
    const num = match ? Number.parseInt(match[1], 10) : 0;
    return num > max ? num : max;
  }, floor);
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

function hydrateStockInItems(form: StockInFormData, language: Language): StockInLineItem[] {
  return form.items.map((line) => {
    const product = INITIAL_PRODUCTS.find((p) => p.id === line.productId);
    const quantity = Math.floor(line.quantity);
    const unitCost = Math.round(line.unitCost);
    return {
      id: line.id,
      productId: line.productId,
      sku: product?.sku ?? 'UNKNOWN',
      productName: product?.name ?? translateKey(language, 'stockOps.errors.unknownProduct'),
      unit: product?.unit ?? 'Cái (Piece)',
      quantity,
      unitCost,
      lineTotal: calcLineTotal(quantity, unitCost),
    };
  });
}

function hydrateStockOutItems(form: StockOutFormData, language: Language): StockOutLineItem[] {
  return form.items.map((line) => {
    const product = INITIAL_PRODUCTS.find((p) => p.id === line.productId);
    const availableStock = getWarehouseAvailableStock(
      line.productId,
      form.warehouseCode,
      INITIAL_PRODUCTS
    );
    const quantity = Math.floor(line.quantity);
    const unitCost = product?.costPrice ?? 0;
    return {
      id: line.id,
      productId: line.productId,
      sku: product?.sku ?? 'UNKNOWN',
      productName: product?.name ?? translateKey(language, 'stockOps.errors.unknownProduct'),
      unit: product?.unit ?? 'Cái (Piece)',
      availableStock,
      quantity,
      unitCost,
      lineTotal: calcLineTotal(quantity, unitCost),
    };
  });
}

function useCommonOrderControls(defaultActor: string = SIMULATED_ACTORS[0]) {
  const [filters, setFilters] = useState<OrderFilterState>({
    search: '',
    status: 'ALL',
    warehouseCode: 'ALL',
  });
  const [currentActor, setCurrentActor] = useState<string>(defaultActor);

  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search }));
  const setStatus = (status: string) => setFilters((prev) => ({ ...prev, status }));
  const setWarehouseCode = (warehouseCode: string) =>
    setFilters((prev) => ({ ...prev, warehouseCode }));
  const resetFilters = () =>
    setFilters({ search: '', status: 'ALL', warehouseCode: 'ALL' });

  return {
    filters,
    currentActor,
    setSearch,
    setStatus,
    setWarehouseCode,
    setCurrentActor,
    resetFilters,
  };
}

export function useStockInOrders(language?: Language) {
  const hookLanguage = useHookLanguage('vi');
  const activeLanguage = language ?? hookLanguage;
  const [orders, setOrders] = useState<StockInOrder[]>(INITIAL_STOCK_IN_ORDERS);
  const controls = useCommonOrderControls();

  const filteredOrders = useMemo(() => {
    const q = controls.filters.search.trim().toLowerCase();
    return orders.filter((order) => {
      if (controls.filters.status !== 'ALL' && order.status !== controls.filters.status) {
        return false;
      }
      if (
        controls.filters.warehouseCode !== 'ALL' &&
        order.warehouseCode !== controls.filters.warehouseCode
      ) {
        return false;
      }
      if (!q) return true;
      return (
        order.code.toLowerCase().includes(q) ||
        order.supplierName.toLowerCase().includes(q) ||
        order.warehouseName.toLowerCase().includes(q) ||
        order.referenceNote.toLowerCase().includes(q) ||
        order.createdBy.toLowerCase().includes(q) ||
        order.items.some(
          (item) =>
            item.sku.toLowerCase().includes(q) ||
            item.productName.toLowerCase().includes(q)
        )
      );
    });
  }, [orders, controls.filters]);

  const createOrder = (
    form: StockInFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ): { ok: true; order: StockInOrder } | { ok: false; error: string } => {
    const errors = validateStockInForm(form, activeLanguage);
    if (hasValidationErrors(errors)) {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.invalidStockIn'),
      };
    }

    const now = new Date().toISOString();
    const code = nextVoucherCode(
      orders.map((o) => o.code),
      'IN-2026-',
      89
    );
    const items = hydrateStockInItems(form, activeLanguage);
    const totals = calcOrderTotals(items);
    const history = [
      {
        id: `hist-${Date.now()}-1`,
        fromStatus: null,
        toStatus: 'DRAFT' as const,
        actor: controls.currentActor,
        timestamp: now,
        note: translateKey(activeLanguage, 'stockOps.history.createdIn'),
      },
      ...(targetStatus === 'SUBMITTED'
        ? [
            {
              id: `hist-${Date.now()}-2`,
              fromStatus: 'DRAFT' as const,
              toStatus: 'SUBMITTED' as const,
              actor: controls.currentActor,
              timestamp: now,
              note: translateKey(activeLanguage, 'stockOps.history.submittedIn'),
            },
          ]
        : []),
    ];

    const newOrder: StockInOrder = {
      id: `in-${Date.now()}`,
      code,
      warehouseCode: form.warehouseCode,
      warehouseName: lookupWarehouseName(form.warehouseCode),
      supplierCode: form.supplierCode,
      supplierName: lookupSupplierName(form.supplierCode),
      referenceNote: form.referenceNote.trim(),
      items,
      totalQty: totals.totalQty,
      totalAmount: totals.totalAmount,
      status: targetStatus,
      createdBy: controls.currentActor,
      createdAt: now,
      updatedAt: now,
      statusHistory: history,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return { ok: true, order: newOrder };
  };

  const updateOrder = (
    id: string,
    form: StockInFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ): { ok: true; order: StockInOrder } | { ok: false; error: string } => {
    const existing = orders.find((o) => o.id === id);
    if (!existing) {
      return { ok: false, error: translateKey(activeLanguage, 'stockOps.errors.notFound') };
    }
    if (existing.status !== 'DRAFT') {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.onlyDraftEdit'),
      };
    }

    const errors = validateStockInForm(form, activeLanguage);
    if (hasValidationErrors(errors)) {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.invalidStockIn'),
      };
    }

    const now = new Date().toISOString();
    const items = hydrateStockInItems(form, activeLanguage);
    const totals = calcOrderTotals(items);
    const nextHistory =
      targetStatus === 'SUBMITTED'
        ? [
            ...existing.statusHistory,
            {
              id: `hist-${Date.now()}-sub`,
              fromStatus: 'DRAFT' as const,
              toStatus: 'SUBMITTED' as const,
              actor: controls.currentActor,
              timestamp: now,
              note: translateKey(activeLanguage, 'stockOps.history.updatedSubmittedIn'),
            },
          ]
        : existing.statusHistory;

    const updated: StockInOrder = {
      ...existing,
      warehouseCode: form.warehouseCode,
      warehouseName: lookupWarehouseName(form.warehouseCode),
      supplierCode: form.supplierCode,
      supplierName: lookupSupplierName(form.supplierCode),
      referenceNote: form.referenceNote.trim(),
      items,
      totalQty: totals.totalQty,
      totalAmount: totals.totalAmount,
      status: targetStatus,
      updatedAt: now,
      statusHistory: nextHistory,
    };

    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    return { ok: true, order: updated };
  };

  const deleteDraft = (id: string): { ok: true } | { ok: false; error: string } => {
    const existing = orders.find((o) => o.id === id);
    if (!existing) {
      return { ok: false, error: translateKey(activeLanguage, 'stockOps.errors.notFound') };
    }
    if (existing.status !== 'DRAFT') {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.onlyDraftDelete'),
      };
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    return { ok: true };
  };

  const transitionOrder = (
    id: string,
    nextStatus: OrderStatus,
    note = ''
  ): { ok: true; order: StockInOrder } | { ok: false; error: string } => {
    const existing = orders.find((o) => o.id === id);
    if (!existing) {
      return { ok: false, error: translateKey(activeLanguage, 'stockOps.errors.notFound') };
    }
    const result = applyStatusTransition(existing, nextStatus, controls.currentActor, note, activeLanguage);
    if (!result.ok) {
      return result;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? result.order : o)));
    return result;
  };

  return {
    orders,
    filteredOrders,
    ...controls,
    createOrder,
    updateOrder,
    deleteDraft,
    transitionOrder,
  };
}

export function useStockOutOrders(language?: Language) {
  const hookLanguage = useHookLanguage('vi');
  const activeLanguage = language ?? hookLanguage;
  const [orders, setOrders] = useState<StockOutOrder[]>(INITIAL_STOCK_OUT_ORDERS);
  const controls = useCommonOrderControls();

  const filteredOrders = useMemo(() => {
    const q = controls.filters.search.trim().toLowerCase();
    return orders.filter((order) => {
      if (controls.filters.status !== 'ALL' && order.status !== controls.filters.status) {
        return false;
      }
      if (
        controls.filters.warehouseCode !== 'ALL' &&
        order.warehouseCode !== controls.filters.warehouseCode
      ) {
        return false;
      }
      if (!q) return true;
      return (
        order.code.toLowerCase().includes(q) ||
        order.destination.toLowerCase().includes(q) ||
        order.warehouseName.toLowerCase().includes(q) ||
        order.createdBy.toLowerCase().includes(q) ||
        order.items.some(
          (item) =>
            item.sku.toLowerCase().includes(q) ||
            item.productName.toLowerCase().includes(q)
        )
      );
    });
  }, [orders, controls.filters]);

  const createOrder = (
    form: StockOutFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ): { ok: true; order: StockOutOrder } | { ok: false; error: string } => {
    const errors = validateStockOutForm(form, INITIAL_PRODUCTS, activeLanguage);
    if (hasValidationErrors(errors)) {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.invalidStockOut'),
      };
    }

    const now = new Date().toISOString();
    const code = nextVoucherCode(
      orders.map((o) => o.code),
      'OUT-2026-',
      42
    );
    const items = hydrateStockOutItems(form, activeLanguage);
    const totals = calcOrderTotals(items);
    const history = [
      {
        id: `hist-${Date.now()}-1`,
        fromStatus: null,
        toStatus: 'DRAFT' as const,
        actor: controls.currentActor,
        timestamp: now,
        note: translateKey(activeLanguage, 'stockOps.history.createdOut'),
      },
      ...(targetStatus === 'SUBMITTED'
        ? [
            {
              id: `hist-${Date.now()}-2`,
              fromStatus: 'DRAFT' as const,
              toStatus: 'SUBMITTED' as const,
              actor: controls.currentActor,
              timestamp: now,
              note: translateKey(activeLanguage, 'stockOps.history.submittedOut'),
            },
          ]
        : []),
    ];

    const newOrder: StockOutOrder = {
      id: `out-${Date.now()}`,
      code,
      warehouseCode: form.warehouseCode,
      warehouseName: lookupWarehouseName(form.warehouseCode),
      destination: form.destination.trim(),
      reason: form.reason,
      items,
      totalQty: totals.totalQty,
      totalAmount: totals.totalAmount,
      status: targetStatus,
      createdBy: controls.currentActor,
      createdAt: now,
      updatedAt: now,
      statusHistory: history,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return { ok: true, order: newOrder };
  };

  const updateOrder = (
    id: string,
    form: StockOutFormData,
    targetStatus: 'DRAFT' | 'SUBMITTED'
  ): { ok: true; order: StockOutOrder } | { ok: false; error: string } => {
    const existing = orders.find((o) => o.id === id);
    if (!existing) {
      return { ok: false, error: translateKey(activeLanguage, 'stockOps.errors.notFound') };
    }
    if (existing.status !== 'DRAFT') {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.onlyDraftEdit'),
      };
    }

    const errors = validateStockOutForm(form, INITIAL_PRODUCTS, activeLanguage);
    if (hasValidationErrors(errors)) {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.invalidStockOut'),
      };
    }

    const now = new Date().toISOString();
    const items = hydrateStockOutItems(form, activeLanguage);
    const totals = calcOrderTotals(items);
    const nextHistory =
      targetStatus === 'SUBMITTED'
        ? [
            ...existing.statusHistory,
            {
              id: `hist-${Date.now()}-sub`,
              fromStatus: 'DRAFT' as const,
              toStatus: 'SUBMITTED' as const,
              actor: controls.currentActor,
              timestamp: now,
              note: translateKey(activeLanguage, 'stockOps.history.updatedSubmittedOut'),
            },
          ]
        : existing.statusHistory;

    const updated: StockOutOrder = {
      ...existing,
      warehouseCode: form.warehouseCode,
      warehouseName: lookupWarehouseName(form.warehouseCode),
      destination: form.destination.trim(),
      reason: form.reason,
      items,
      totalQty: totals.totalQty,
      totalAmount: totals.totalAmount,
      status: targetStatus,
      updatedAt: now,
      statusHistory: nextHistory,
    };

    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    return { ok: true, order: updated };
  };

  const deleteDraft = (id: string): { ok: true } | { ok: false; error: string } => {
    const existing = orders.find((o) => o.id === id);
    if (!existing) {
      return { ok: false, error: translateKey(activeLanguage, 'stockOps.errors.notFound') };
    }
    if (existing.status !== 'DRAFT') {
      return {
        ok: false,
        error: translateKey(activeLanguage, 'stockOps.errors.onlyDraftDelete'),
      };
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    return { ok: true };
  };

  const transitionOrder = (
    id: string,
    nextStatus: OrderStatus,
    note = ''
  ): { ok: true; order: StockOutOrder } | { ok: false; error: string } => {
    const existing = orders.find((o) => o.id === id);
    if (!existing) {
      return { ok: false, error: translateKey(activeLanguage, 'stockOps.errors.notFound') };
    }
    const result = applyStatusTransition(existing, nextStatus, controls.currentActor, note, activeLanguage);
    if (!result.ok) {
      return result;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? result.order : o)));
    return result;
  };

  return {
    orders,
    filteredOrders,
    ...controls,
    createOrder,
    updateOrder,
    deleteDraft,
    transitionOrder,
  };
}
