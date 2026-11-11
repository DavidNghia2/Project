import { INITIAL_PRODUCTS } from '../products/mockData';
import { INITIAL_SUPPLIERS, INITIAL_WAREHOUSES } from '../master-data/mockData';
import type {
  StatusHistoryEntry,
  StockInLineItem,
  StockInOrder,
  StockOutLineItem,
  StockOutOrder,
} from './types';
import { calcLineTotal, calcOrderTotals, getWarehouseAvailableStock } from './workflow';

export const SIMULATED_ACTORS = [
  'Nguyễn Quản Trị (Admin)',
  'Trần Thị Thu (Manager)',
  'Lê Hoàng Long (Manager)',
  'Phạm Văn Nam (Staff)',
] as const;

export const STOCK_OUT_REASONS = [
  { value: 'SALES_ORDER', labelVi: 'Xuất bán theo đơn khách hàng', labelEn: 'Customer Sales Order' },
  { value: 'BRANCH_TRANSFER', labelVi: 'Điều chuyển nội bộ chi nhánh', labelEn: 'Internal Branch Transfer' },
  { value: 'PROJECT_DEPLOY', labelVi: 'Xuất triển khai dự án / lắp đặt', labelEn: 'Project Deployment / Install' },
  { value: 'WARRANTY_SWAP', labelVi: 'Xuất đổi trả bảo hành', labelEn: 'Warranty Replacement' },
  { value: 'SUPPLIER_RETURN', labelVi: 'Xuất trả nhà cung cấp', labelEn: 'Return to Supplier' },
] as const;

export function lookupWarehouseName(warehouseCode: string): string {
  const wh = INITIAL_WAREHOUSES.find((w) => w.code === warehouseCode);
  return wh ? wh.name : warehouseCode;
}

export function lookupSupplierName(supplierCode: string): string {
  const sup = INITIAL_SUPPLIERS.find((s) => s.code === supplierCode);
  return sup ? sup.name : supplierCode;
}

function buildInLine(
  id: string,
  productIndex: number,
  quantity: number,
  unitCostOverride?: number
): StockInLineItem {
  const product = INITIAL_PRODUCTS[productIndex] ?? INITIAL_PRODUCTS[0];
  const unitCost = unitCostOverride ?? product.costPrice ?? 250000;
  return {
    id,
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    unit: product.unit,
    quantity,
    unitCost,
    lineTotal: calcLineTotal(quantity, unitCost),
  };
}

function findStockedProductForWarehouse(
  warehouseCode: string,
  preferredOffset: number,
  desiredQty: number
): { productIndex: number; qty: number; available: number } {
  const candidates = INITIAL_PRODUCTS.map((p, idx) => ({
    productIndex: idx,
    available: getWarehouseAvailableStock(p.id, warehouseCode, INITIAL_PRODUCTS),
  })).filter((c) => c.available > 0);

  if (candidates.length === 0) {
    return { productIndex: 0, qty: 1, available: 1 };
  }

  const chosen = candidates[preferredOffset % candidates.length];
  return {
    productIndex: chosen.productIndex,
    available: chosen.available,
    qty: Math.min(desiredQty, chosen.available),
  };
}

function buildOutLine(
  id: string,
  warehouseCode: string,
  preferredOffset: number,
  desiredQty: number
): StockOutLineItem {
  const picked = findStockedProductForWarehouse(warehouseCode, preferredOffset, desiredQty);
  const product = INITIAL_PRODUCTS[picked.productIndex] ?? INITIAL_PRODUCTS[0];
  const unitCost = product.costPrice ?? 250000;
  return {
    id,
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    unit: product.unit,
    availableStock: picked.available,
    quantity: picked.qty,
    unitCost,
    lineTotal: calcLineTotal(picked.qty, unitCost),
  };
}

function buildOrderFromInLines(
  base: Omit<StockInOrder, 'warehouseName' | 'supplierName' | 'items' | 'totalQty' | 'totalAmount'>,
  items: StockInLineItem[]
): StockInOrder {
  const totals = calcOrderTotals(items);
  return {
    ...base,
    warehouseName: lookupWarehouseName(base.warehouseCode),
    supplierName: lookupSupplierName(base.supplierCode),
    items,
    totalQty: totals.totalQty,
    totalAmount: totals.totalAmount,
  };
}

function buildOrderFromOutLines(
  base: Omit<StockOutOrder, 'warehouseName' | 'items' | 'totalQty' | 'totalAmount'>,
  items: StockOutLineItem[]
): StockOutOrder {
  const totals = calcOrderTotals(items);
  return {
    ...base,
    warehouseName: lookupWarehouseName(base.warehouseCode),
    items,
    totalQty: totals.totalQty,
    totalAmount: totals.totalAmount,
  };
}

function hist(
  id: string,
  fromStatus: StatusHistoryEntry['fromStatus'],
  toStatus: StatusHistoryEntry['toStatus'],
  actor: string,
  timestamp: string,
  note: string
): StatusHistoryEntry {
  return { id, fromStatus, toStatus, actor, timestamp, note };
}

export const INITIAL_STOCK_IN_ORDERS: StockInOrder[] = [
  buildOrderFromInLines(
    {
      id: 'in-089',
      code: 'IN-2026-089',
      warehouseCode: 'WH-01',
      supplierCode: 'SUP-LOGI-VN',
      referenceNote: 'PO-2026-441 · Nhập bổ sung lô chuột không dây & thiết bị văn phòng quý IV',
      status: 'SUBMITTED',
      createdBy: 'Phạm Văn Nam (Staff)',
      createdAt: '2026-11-10T08:15:00Z',
      updatedAt: '2026-11-10T09:05:00Z',
      statusHistory: [
        hist('h-89-1', null, 'DRAFT', 'Phạm Văn Nam (Staff)', '2026-11-10T08:15:00Z', 'Khởi tạo phiếu nhập kho'),
        hist('h-89-2', 'DRAFT', 'SUBMITTED', 'Phạm Văn Nam (Staff)', '2026-11-10T09:05:00Z', 'Đã kiểm đếm chứng từ, gửi quản lý phê duyệt'),
      ],
    },
    [
      buildInLine('in-89-l1', 0, 45),
      buildInLine('in-89-l2', 3, 20),
    ]
  ),
  buildOrderFromInLines(
    {
      id: 'in-088',
      code: 'IN-2026-088',
      warehouseCode: 'WH-02',
      supplierCode: 'SUP-DELL-DIST',
      referenceNote: 'PO-2026-438 · Nhập màn hình Dell 24 inch và phụ kiện hiển thị cho chi nhánh Miền Nam',
      status: 'APPROVED',
      createdBy: 'Phạm Văn Nam (Staff)',
      createdAt: '2026-11-09T10:20:00Z',
      updatedAt: '2026-11-09T14:40:00Z',
      statusHistory: [
        hist('h-88-1', null, 'DRAFT', 'Phạm Văn Nam (Staff)', '2026-11-09T10:20:00Z', 'Tạo phiếu nhập theo PO-2026-438'),
        hist('h-88-2', 'DRAFT', 'SUBMITTED', 'Phạm Văn Nam (Staff)', '2026-11-09T11:00:00Z', 'Trình duyệt nhập kho WH-02'),
        hist('h-88-3', 'SUBMITTED', 'APPROVED', 'Trần Thị Thu (Manager)', '2026-11-09T14:40:00Z', 'Đã đối chiếu hóa đơn VAT, cho phép nhập kho'),
      ],
    },
    [
      buildInLine('in-88-l1', 1, 12),
      buildInLine('in-88-l2', 2, 15),
    ]
  ),
  buildOrderFromInLines(
    {
      id: 'in-087',
      code: 'IN-2026-087',
      warehouseCode: 'WH-01',
      supplierCode: 'SUP-SYN-APL',
      referenceNote: 'PO-2026-430 · Nhập lô linh kiện lưu trữ & ổ cứng SSD doanh nghiệp',
      status: 'COMPLETED',
      createdBy: 'Lê Hoàng Long (Manager)',
      createdAt: '2026-11-07T08:00:00Z',
      updatedAt: '2026-11-07T16:30:00Z',
      statusHistory: [
        hist('h-87-1', null, 'DRAFT', 'Lê Hoàng Long (Manager)', '2026-11-07T08:00:00Z', 'Khởi tạo chứng từ nhập kho'),
        hist('h-87-2', 'DRAFT', 'SUBMITTED', 'Lê Hoàng Long (Manager)', '2026-11-07T09:10:00Z', 'Gửi ban quản trị kiểm tra'),
        hist('h-87-3', 'SUBMITTED', 'APPROVED', 'Nguyễn Quản Trị (Admin)', '2026-11-07T11:25:00Z', 'Phê duyệt nhập hàng vào kệ A2'),
        hist('h-87-4', 'APPROVED', 'COMPLETED', 'Phạm Văn Nam (Staff)', '2026-11-07T16:30:00Z', 'Hoàn tất nhập hàng lên kệ lưu trữ'),
      ],
    },
    [
      buildInLine('in-87-l1', 4, 30),
      buildInLine('in-87-l2', 5, 25),
    ]
  ),
  buildOrderFromInLines(
    {
      id: 'in-086',
      code: 'IN-2026-086',
      warehouseCode: 'WH-03',
      supplierCode: 'SUP-FAST-CAB',
      referenceNote: 'PO-2026-445 · Dự trù cáp mạng Cat6A và vật tư hạ tầng kho Đà Nẵng',
      status: 'DRAFT',
      createdBy: 'Trần Thị Thu (Manager)',
      createdAt: '2026-11-10T11:45:00Z',
      updatedAt: '2026-11-10T11:45:00Z',
      statusHistory: [
        hist('h-86-1', null, 'DRAFT', 'Trần Thị Thu (Manager)', '2026-11-10T11:45:00Z', 'Lưu nháp kế hoạch nhập vật tư'),
      ],
    },
    [
      buildInLine('in-86-l1', 0, 18),
      buildInLine('in-86-l2', 6, 40),
    ]
  ),
  buildOrderFromInLines(
    {
      id: 'in-085',
      code: 'IN-2026-085',
      warehouseCode: 'WH-01',
      supplierCode: 'SUP-VPP-HN',
      referenceNote: 'PO-2026-421 · Nhập vật tư tiêu hao phòng in ấn',
      status: 'REJECTED',
      createdBy: 'Phạm Văn Nam (Staff)',
      createdAt: '2026-11-05T13:10:00Z',
      updatedAt: '2026-11-05T15:50:00Z',
      statusHistory: [
        hist('h-85-1', null, 'DRAFT', 'Phạm Văn Nam (Staff)', '2026-11-05T13:10:00Z', 'Tạo phiếu nháp'),
        hist('h-85-2', 'DRAFT', 'SUBMITTED', 'Phạm Văn Nam (Staff)', '2026-11-05T13:35:00Z', 'Gửi duyệt nhập vật tư'),
        hist('h-85-3', 'SUBMITTED', 'REJECTED', 'Trần Thị Thu (Manager)', '2026-11-05T15:50:00Z', 'Đơn giá chưa khớp bảng báo giá tháng 11, đề nghị kiểm tra lại'),
      ],
    },
    [buildInLine('in-85-l1', 4, 10)]
  ),
];

export const INITIAL_STOCK_OUT_ORDERS: StockOutOrder[] = [
  buildOrderFromOutLines(
    {
      id: 'out-042',
      code: 'OUT-2026-042',
      warehouseCode: 'WH-01',
      destination: 'Công ty Cổ phần Công nghệ Ánh Dương (SO-8821)',
      reason: 'SALES_ORDER',
      status: 'SUBMITTED',
      createdBy: 'Phạm Văn Nam (Staff)',
      createdAt: '2026-11-10T08:40:00Z',
      updatedAt: '2026-11-10T09:18:00Z',
      statusHistory: [
        hist('ho-42-1', null, 'DRAFT', 'Phạm Văn Nam (Staff)', '2026-11-10T08:40:00Z', 'Tạo phiếu xuất giao đơn SO-8821'),
        hist('ho-42-2', 'DRAFT', 'SUBMITTED', 'Phạm Văn Nam (Staff)', '2026-11-10T09:18:00Z', 'Đã kiểm tra tồn kho khả dụng tại WH-01, trình duyệt'),
      ],
    },
    [
      buildOutLine('out-42-l1', 'WH-01', 0, 10),
      buildOutLine('out-42-l2', 'WH-01', 1, 2),
    ]
  ),
  buildOrderFromOutLines(
    {
      id: 'out-041',
      code: 'OUT-2026-041',
      warehouseCode: 'WH-02',
      destination: 'Chi nhánh Cần Thơ · Kho trung chuyển',
      reason: 'BRANCH_TRANSFER',
      status: 'APPROVED',
      createdBy: 'Phạm Văn Nam (Staff)',
      createdAt: '2026-11-09T09:30:00Z',
      updatedAt: '2026-11-09T13:15:00Z',
      statusHistory: [
        hist('ho-41-1', null, 'DRAFT', 'Phạm Văn Nam (Staff)', '2026-11-09T09:30:00Z', 'Lập phiếu điều chuyển sang Cần Thơ'),
        hist('ho-41-2', 'DRAFT', 'SUBMITTED', 'Phạm Văn Nam (Staff)', '2026-11-09T10:05:00Z', 'Gửi quản lý kho duyệt xuất'),
        hist('ho-41-3', 'SUBMITTED', 'APPROVED', 'Lê Hoàng Long (Manager)', '2026-11-09T13:15:00Z', 'Đã duyệt điều phối xe tải xuất lúc 15h00'),
      ],
    },
    [
      buildOutLine('out-41-l1', 'WH-02', 0, 6),
      buildOutLine('out-41-l2', 'WH-02', 1, 3),
    ]
  ),
  buildOrderFromOutLines(
    {
      id: 'out-040',
      code: 'OUT-2026-040',
      warehouseCode: 'WH-01',
      destination: 'Dự án Tòa nhà Văn phòng TechHub Hà Nội',
      reason: 'PROJECT_DEPLOY',
      status: 'COMPLETED',
      createdBy: 'Trần Thị Thu (Manager)',
      createdAt: '2026-11-06T07:50:00Z',
      updatedAt: '2026-11-06T16:10:00Z',
      statusHistory: [
        hist('ho-40-1', null, 'DRAFT', 'Trần Thị Thu (Manager)', '2026-11-06T07:50:00Z', 'Chuẩn bị vật tư bàn giao dự án TechHub'),
        hist('ho-40-2', 'DRAFT', 'SUBMITTED', 'Trần Thị Thu (Manager)', '2026-11-06T08:30:00Z', 'Chuyển Ban giám đốc duyệt xuất'),
        hist('ho-40-3', 'SUBMITTED', 'APPROVED', 'Nguyễn Quản Trị (Admin)', '2026-11-06T10:00:00Z', 'Chấp thuận xuất thiết bị theo biên bản nghiệm thu'),
        hist('ho-40-4', 'APPROVED', 'COMPLETED', 'Phạm Văn Nam (Staff)', '2026-11-06T16:10:00Z', 'Đã ký biên bản bàn giao tại công trình'),
      ],
    },
    [buildOutLine('out-40-l1', 'WH-01', 2, 4)]
  ),
  buildOrderFromOutLines(
    {
      id: 'out-039',
      code: 'OUT-2026-039',
      warehouseCode: 'WH-03',
      destination: 'Trung tâm Bảo hành Khu vực Miền Trung',
      reason: 'WARRANTY_SWAP',
      status: 'DRAFT',
      createdBy: 'Lê Hoàng Long (Manager)',
      createdAt: '2026-11-10T10:15:00Z',
      updatedAt: '2026-11-10T10:15:00Z',
      statusHistory: [
        hist('ho-39-1', null, 'DRAFT', 'Lê Hoàng Long (Manager)', '2026-11-10T10:15:00Z', 'Lưu nháp phiếu xuất đổi trả bảo hành'),
      ],
    },
    [buildOutLine('out-39-l1', 'WH-03', 0, 5)]
  ),
  buildOrderFromOutLines(
    {
      id: 'out-038',
      code: 'OUT-2026-038',
      warehouseCode: 'WH-02',
      destination: 'Khách hàng Doanh nghiệp NovaRetail',
      reason: 'SALES_ORDER',
      status: 'REJECTED',
      createdBy: 'Phạm Văn Nam (Staff)',
      createdAt: '2026-11-04T09:00:00Z',
      updatedAt: '2026-11-04T11:20:00Z',
      statusHistory: [
        hist('ho-38-1', null, 'DRAFT', 'Phạm Văn Nam (Staff)', '2026-11-04T09:00:00Z', 'Tạo phiếu xuất giao NovaRetail'),
        hist('ho-38-2', 'DRAFT', 'SUBMITTED', 'Phạm Văn Nam (Staff)', '2026-11-04T09:30:00Z', 'Gửi quản lý phê duyệt'),
        hist('ho-38-3', 'SUBMITTED', 'REJECTED', 'Lê Hoàng Long (Manager)', '2026-11-04T11:20:00Z', 'Khách hàng tạm hoãn lịch nhận hàng sang tuần sau'),
      ],
    },
    [buildOutLine('out-38-l1', 'WH-02', 0, 4)]
  ),
];
