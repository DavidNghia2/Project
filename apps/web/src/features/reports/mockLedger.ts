import { INITIAL_PRODUCTS } from '../products/mockData';
import { lookupWarehouseName } from '../stock-operations/mockData';
import type { LedgerDirection, ReportLedgerEntry } from './types';

function makeEntry(
  id: string,
  voucherCode: string,
  date: string,
  direction: LedgerDirection,
  warehouseCode: string,
  partnerName: string,
  productIndex: number,
  quantity: number,
  operator: string,
  unitCostOverride?: number
): ReportLedgerEntry {
  const product = INITIAL_PRODUCTS[productIndex] ?? INITIAL_PRODUCTS[0];
  const unitCost = unitCostOverride ?? product.costPrice ?? 0;
  return {
    id,
    voucherCode,
    date,
    direction,
    warehouseCode,
    warehouseName: lookupWarehouseName(warehouseCode),
    partnerName,
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    category: product.category,
    unit: product.unit,
    quantity,
    unitCost,
    lineTotal: Math.round(quantity * unitCost),
    status: 'COMPLETED',
    operator,
  };
}

/**
 * Deterministic completed stock movement ledger from 2026-10-16 through 2026-11-10.
 * Every net movement reconciles cleanly against INITIAL_PRODUCTS per-warehouse stock
 * without negative intermediate/opening balances.
 *
 * Product indexes in INITIAL_PRODUCTS:
 * 0: prod-001 (WH-01: 90, WH-02: 30, WH-03: 25)
 * 1: prod-002 (WH-01: 5,  WH-02: 3,  WH-03: 0)
 * 2: prod-003 (WH-01: 12, WH-02: 4,  WH-03: 8)
 * 3: prod-004 (WH-01: 1,  WH-02: 2,  WH-03: 0)
 * 4: prod-005 (WH-01: 0,  WH-02: 0,  WH-03: 0)
 * 5: prod-006 (WH-01: 22, WH-02: 10, WH-03: 10)
 * 6: prod-007 (WH-01: 8,  WH-02: 2,  WH-03: 4)
 * 7: prod-008 (WH-01: 20, WH-02: 5,  WH-03: 10)
 * 8: prod-009 (WH-01: 30, WH-02: 15, WH-03: 15)
 * 9: prod-010 (WH-01: 10, WH-02: 8,  WH-03: 0)
 * 10: prod-011 (WH-01: 5, WH-02: 2,  WH-03: 2)
 */
export const REPORT_LEDGER_ENTRIES: ReportLedgerEntry[] = [
  // October 2026 Completed Receipts (IN)
  makeEntry('lg-01', 'IN-2026-071', '2026-10-16', 'IN', 'WH-01', 'Công ty TNHH Logitech Việt Nam', 0, 40, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-02', 'IN-2026-071', '2026-10-16', 'IN', 'WH-01', 'Công ty TNHH Logitech Việt Nam', 5, 12, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-03', 'IN-2026-072', '2026-10-18', 'IN', 'WH-01', 'Synnex FPT Distribution Partner', 2, 6, 'Trần Thị Thu (Manager)'),
  makeEntry('lg-04', 'IN-2026-072', '2026-10-18', 'IN', 'WH-02', 'Synnex FPT Distribution Partner', 6, 2, 'Trần Thị Thu (Manager)'),
  makeEntry('lg-05', 'IN-2026-073', '2026-10-21', 'IN', 'WH-03', 'An Phát Tech Distribution', 7, 8, 'Lê Hoàng Long (Manager)'),
  makeEntry('lg-06', 'IN-2026-073', '2026-10-21', 'IN', 'WH-01', 'An Phát Tech Distribution', 8, 20, 'Lê Hoàng Long (Manager)'),
  makeEntry('lg-07', 'IN-2026-074', '2026-10-24', 'IN', 'WH-02', 'Nhà Phân Phối Dell Global Trading', 1, 5, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-08', 'IN-2026-075', '2026-10-27', 'IN', 'WH-02', 'Công ty VPP Văn Phòng Hà Nội', 9, 10, 'Phạm Văn Nam (Staff)'),

  // October 2026 Completed Dispatches (OUT)
  makeEntry('lg-09', 'OUT-2026-028', '2026-10-22', 'OUT', 'WH-01', 'Công ty CP FPT Software (SO-771)', 0, 25, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-10', 'OUT-2026-029', '2026-10-25', 'OUT', 'WH-02', 'Chi nhánh Huế · Triển khai hạ tầng', 1, 4, 'Lê Hoàng Long (Manager)'),
  makeEntry('lg-11', 'OUT-2026-030', '2026-10-28', 'OUT', 'WH-03', 'Tập đoàn Hoa Sen (SO-780)', 7, 5, 'Trần Thị Thu (Manager)'),
  makeEntry('lg-12', 'OUT-2026-031', '2026-10-30', 'OUT', 'WH-01', 'Dự án Ngân hàng Á Châu ACB', 8, 12, 'Phạm Văn Nam (Staff)'),

  // November 2026 Completed Receipts (IN)
  makeEntry('lg-13', 'IN-2026-082', '2026-11-02', 'IN', 'WH-03', 'Công ty TNHH Logitech Việt Nam', 0, 15, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-14', 'IN-2026-083', '2026-11-04', 'IN', 'WH-01', 'Synnex FPT Distribution Partner', 10, 4, 'Trần Thị Thu (Manager)'),
  makeEntry('lg-15', 'IN-2026-084', '2026-11-05', 'IN', 'WH-02', 'An Phát Tech Distribution', 8, 10, 'Lê Hoàng Long (Manager)'),
  makeEntry('lg-16', 'IN-2026-087', '2026-11-07', 'IN', 'WH-01', 'An Phát Tech Distribution', 7, 15, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-17', 'IN-2026-087', '2026-11-07', 'IN', 'WH-01', 'Công ty TNHH Logitech Việt Nam', 5, 10, 'Phạm Văn Nam (Staff)'),

  // November 2026 Completed Dispatches (OUT)
  makeEntry('lg-18', 'OUT-2026-036', '2026-11-03', 'OUT', 'WH-02', 'Đại học Duy Tân Đà Nẵng', 9, 6, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-19', 'OUT-2026-037', '2026-11-05', 'OUT', 'WH-01', 'Phòng Giao Dịch Hoàn Kiếm', 3, 4, 'Lê Hoàng Long (Manager)'),
  makeEntry('lg-20', 'OUT-2026-040', '2026-11-06', 'OUT', 'WH-01', 'Dự án Tòa nhà Văn phòng TechHub Hà Nội', 2, 4, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-21', 'OUT-2026-040', '2026-11-06', 'OUT', 'WH-01', 'Dự án Tòa nhà Văn phòng TechHub Hà Nội', 6, 2, 'Phạm Văn Nam (Staff)'),
  makeEntry('lg-22', 'OUT-2026-041B', '2026-11-09', 'OUT', 'WH-03', 'Chi nhánh Bình Dương (SO-8810)', 0, 8, 'Trần Thị Thu (Manager)'),
  makeEntry('lg-23', 'OUT-2026-041C', '2026-11-10', 'OUT', 'WH-02', 'Khách hàng Bảo Việt Miền Trung', 2, 2, 'Phạm Văn Nam (Staff)'),
];

export const REPORT_DEFAULT_START_DATE = '2026-10-15';
export const REPORT_DEFAULT_END_DATE = '2026-11-11';
