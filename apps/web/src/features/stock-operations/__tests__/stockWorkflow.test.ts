import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { INITIAL_PRODUCTS } from '../../products/mockData';
import {
  INITIAL_STOCK_IN_ORDERS,
  INITIAL_STOCK_OUT_ORDERS,
  SIMULATED_ACTORS,
  applyStatusTransition,
  calcLineTotal,
  calcOrderTotals,
  canApproveOrReject,
  canTransition,
  getWarehouseAvailableStock,
  hasValidationErrors,
  useStockInOrders,
  useStockOutOrders,
  validateStockInForm,
  validateStockOutForm,
} from '../index';

describe('Stock Operations Calculations & Stock Lookup', () => {
  it('computes accurate line totals and guards against invalid inputs', () => {
    expect(calcLineTotal(10, 280000)).toBe(2800000);
    expect(calcLineTotal(3, 150000)).toBe(450000);
    expect(calcLineTotal(0, 150000)).toBe(0);
    expect(calcLineTotal(-5, 150000)).toBe(0);
    expect(calcLineTotal(Number.NaN, 150000)).toBe(0);
  });

  it('computes multi-line voucher totalQty and totalAmount accurately', () => {
    const totals = calcOrderTotals([
      { quantity: 10, unitCost: 250000 },
      { quantity: 4, unitCost: 1200000 },
      { quantity: 2, unitCost: 75000 },
    ]);
    expect(totals.totalQty).toBe(16);
    expect(totals.totalAmount).toBe(10 * 250000 + 4 * 1200000 + 2 * 75000);
  });

  it('looks up available warehouse stock accurately from mock products', () => {
    const firstProduct = INITIAL_PRODUCTS[0];
    const wh1Entry = firstProduct.warehouses.find((w) => w.warehouseCode === 'WH-01');
    expect(getWarehouseAvailableStock(firstProduct.id, 'WH-01', INITIAL_PRODUCTS)).toBe(
      wh1Entry ? wh1Entry.quantity : 0
    );
    expect(getWarehouseAvailableStock(firstProduct.id, 'WH-NON-EXISTENT', INITIAL_PRODUCTS)).toBe(0);
    expect(getWarehouseAvailableStock('missing-id', 'WH-01', INITIAL_PRODUCTS)).toBe(0);
  });
});

describe('Stock Operations Validation Rules', () => {
  it('validates stock-in required headers, line quantities, unitCost, and duplicate products', () => {
    const invalid = validateStockInForm(
      {
        warehouseCode: '',
        supplierCode: '',
        referenceNote: '',
        items: [
          { id: 'l1', productId: INITIAL_PRODUCTS[0].id, quantity: 0, unitCost: 0 },
          { id: 'l2', productId: INITIAL_PRODUCTS[0].id, quantity: 5, unitCost: 100000 },
        ],
      },
      'vi'
    );

    expect(hasValidationErrors(invalid)).toBe(true);
    expect(invalid.warehouseCode).toBeTruthy();
    expect(invalid.supplierCode).toBeTruthy();
    expect(invalid.lineErrors?.l1?.quantity).toBeTruthy();
    expect(invalid.lineErrors?.l1?.unitCost).toBeTruthy();
    expect(invalid.lineErrors?.l2?.productId).toMatch(/trùng lặp/i);
  });

  it('strictly blocks stock-out quantities exceeding available warehouse stock', () => {
    const stockedProduct = INITIAL_PRODUCTS.find(
      (p) => getWarehouseAvailableStock(p.id, 'WH-01', INITIAL_PRODUCTS) > 0
    )!;
    const available = getWarehouseAvailableStock(stockedProduct.id, 'WH-01', INITIAL_PRODUCTS);

    const overStockErrors = validateStockOutForm(
      {
        warehouseCode: 'WH-01',
        destination: 'Khách hàng Doanh nghiệp',
        reason: 'SALES_ORDER',
        items: [{ id: 'l1', productId: stockedProduct.id, quantity: available + 1 }],
      },
      INITIAL_PRODUCTS,
      'vi'
    );

    expect(hasValidationErrors(overStockErrors)).toBe(true);
    expect(overStockErrors.lineErrors?.l1?.quantity).toContain(String(available));

    const exactBoundaryOk = validateStockOutForm(
      {
        warehouseCode: 'WH-01',
        destination: 'Khách hàng Doanh nghiệp',
        reason: 'SALES_ORDER',
        items: [{ id: 'l1', productId: stockedProduct.id, quantity: available }],
      },
      INITIAL_PRODUCTS,
      'vi'
    );
    expect(hasValidationErrors(exactBoundaryOk)).toBe(false);
  });

  it('blocks stock-out when chosen warehouse has 0 stock for a product', () => {
    const zeroStockProduct = INITIAL_PRODUCTS.find(
      (p) => getWarehouseAvailableStock(p.id, 'WH-01', INITIAL_PRODUCTS) === 0
    );
    if (!zeroStockProduct) return;

    const errors = validateStockOutForm(
      {
        warehouseCode: 'WH-01',
        destination: 'Chi nhánh Test',
        reason: 'BRANCH_TRANSFER',
        items: [{ id: 'l1', productId: zeroStockProduct.id, quantity: 1 }],
      },
      INITIAL_PRODUCTS,
      'en'
    );

    expect(hasValidationErrors(errors)).toBe(true);
    expect(errors.lineErrors?.l1?.quantity).toMatch(/0 stock/i);
  });
});

describe('Workflow Transitions & Maker-Checker Enforcement', () => {
  it('enforces valid state transition graph DRAFT -> SUBMITTED -> APPROVED -> COMPLETED and REJECTED', () => {
    expect(canTransition('DRAFT', 'SUBMITTED')).toBe(true);
    expect(canTransition('DRAFT', 'APPROVED')).toBe(false);
    expect(canTransition('SUBMITTED', 'APPROVED')).toBe(true);
    expect(canTransition('SUBMITTED', 'REJECTED')).toBe(true);
    expect(canTransition('APPROVED', 'COMPLETED')).toBe(true);
    expect(canTransition('REJECTED', 'DRAFT')).toBe(true);
    expect(canTransition('COMPLETED', 'DRAFT')).toBe(false);
  });

  it('prevents voucher creator from self-approving or self-rejecting (Maker-Checker)', () => {
    const creator = SIMULATED_ACTORS[3]; // Phạm Văn Nam (Staff)
    const reviewer = SIMULATED_ACTORS[1]; // Trần Thị Thu (Manager)

    expect(canApproveOrReject(creator, creator, 'vi').allowed).toBe(false);
    expect(canApproveOrReject(creator, reviewer, 'vi').allowed).toBe(true);

    const submittedOrder = INITIAL_STOCK_IN_ORDERS.find((o) => o.code === 'IN-2026-089')!;
    const selfAttempt = applyStatusTransition(
      submittedOrder,
      'APPROVED',
      submittedOrder.createdBy,
      '',
      'vi'
    );
    expect(selfAttempt.ok).toBe(false);

    const managerAttempt = applyStatusTransition(
      submittedOrder,
      'APPROVED',
      reviewer,
      'Đã kiểm tra chứng từ đầy đủ',
      'vi'
    );
    expect(managerAttempt.ok).toBe(true);
    if (managerAttempt.ok) {
      expect(managerAttempt.order.status).toBe('APPROVED');
      expect(managerAttempt.order.statusHistory.at(-1)?.actor).toBe(reviewer);
    }
  });

  it('requires rejection note when transitioning to REJECTED and appends timeline entry', () => {
    const submittedOut = INITIAL_STOCK_OUT_ORDERS.find((o) => o.code === 'OUT-2026-042')!;
    const reviewer = SIMULATED_ACTORS[0];

    const missingNote = applyStatusTransition(submittedOut, 'REJECTED', reviewer, '   ', 'vi');
    expect(missingNote.ok).toBe(false);

    const withNote = applyStatusTransition(
      submittedOut,
      'REJECTED',
      reviewer,
      'Thiếu xác nhận giao hàng của khách',
      'vi'
    );
    expect(withNote.ok).toBe(true);
    if (withNote.ok) {
      expect(withNote.order.status).toBe('REJECTED');
      expect(withNote.order.statusHistory.at(-1)?.note).toContain('Thiếu xác nhận');
    }
  });

  it('completes vouchers without mutating master product stock balances', () => {
    const snapshot = INITIAL_PRODUCTS.map((p) => ({ id: p.id, onHand: p.onHand }));
    const approvedOrder = INITIAL_STOCK_IN_ORDERS.find((o) => o.status === 'APPROVED')!;
    const res = applyStatusTransition(approvedOrder, 'COMPLETED', SIMULATED_ACTORS[0], '', 'vi');
    expect(res.ok).toBe(true);

    const after = INITIAL_PRODUCTS.map((p) => ({ id: p.id, onHand: p.onHand }));
    expect(after).toEqual(snapshot);
  });
});

describe('Stock Operations Hooks CRUD & Filtering', () => {
  it('supports multi-line stock-in creation, draft editing, draft deletion, and status filtering', () => {
    const { result } = renderHook(() => useStockInOrders('vi'));
    const initialCount = result.current.orders.length;

    let createdId = '';
    act(() => {
      const created = result.current.createOrder(
        {
          warehouseCode: 'WH-01',
          supplierCode: 'SUP-LOGI-VN',
          referenceNote: 'PO-TEST-900',
          items: [
            { id: 'l1', productId: INITIAL_PRODUCTS[0].id, quantity: 5, unitCost: 200000 },
            { id: 'l2', productId: INITIAL_PRODUCTS[1].id, quantity: 2, unitCost: 1500000 },
          ],
        },
        'DRAFT'
      );
      expect(created.ok).toBe(true);
      if (created.ok) {
        createdId = created.order.id;
        expect(created.order.totalQty).toBe(7);
        expect(created.order.totalAmount).toBe(4000000);
        expect(created.order.status).toBe('DRAFT');
      }
    });

    expect(result.current.orders).toHaveLength(initialCount + 1);

    // Edit draft & submit
    act(() => {
      const updated = result.current.updateOrder(
        createdId,
        {
          warehouseCode: 'WH-01',
          supplierCode: 'SUP-LOGI-VN',
          referenceNote: 'PO-TEST-900-REV',
          items: [{ id: 'l1', productId: INITIAL_PRODUCTS[0].id, quantity: 10, unitCost: 200000 }],
        },
        'SUBMITTED'
      );
      expect(updated.ok).toBe(true);
      if (updated.ok) {
        expect(updated.order.status).toBe('SUBMITTED');
        expect(updated.order.totalAmount).toBe(2000000);
      }
    });

    // Cannot delete non-draft
    act(() => {
      const del = result.current.deleteDraft(createdId);
      expect(del.ok).toBe(false);
    });

    // Search filter works
    act(() => {
      result.current.setSearch('PO-TEST-900-REV');
    });
    expect(result.current.filteredOrders).toHaveLength(1);
  });

  it('rejects over-stock dispatch inside useStockOutOrders.createOrder', () => {
    const { result } = renderHook(() => useStockOutOrders('vi'));
    const product = INITIAL_PRODUCTS[0];
    const available = getWarehouseAvailableStock(product.id, 'WH-01', INITIAL_PRODUCTS);

    act(() => {
      const res = result.current.createOrder(
        {
          warehouseCode: 'WH-01',
          destination: 'Test Client',
          reason: 'SALES_ORDER',
          items: [{ id: 'l1', productId: product.id, quantity: available + 50 }],
        },
        'SUBMITTED'
      );
      expect(res.ok).toBe(false);
    });
  });
});
