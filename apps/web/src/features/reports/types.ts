export type ReportType =
  | 'current_stock'
  | 'stock_in'
  | 'stock_out'
  | 'stock_movement'
  | 'low_stock';

export type LedgerDirection = 'IN' | 'OUT';

export interface ReportLedgerEntry {
  id: string;
  voucherCode: string;
  date: string; // YYYY-MM-DD
  direction: LedgerDirection;
  warehouseCode: string;
  warehouseName: string;
  partnerName: string; // Supplier for IN, Destination for OUT
  productId: string;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  status: 'COMPLETED';
  operator: string;
}

export interface ReportFilterState {
  reportType: ReportType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  warehouseCode: string; // 'ALL' | 'WH-01' | ...
  category: string; // 'ALL' | category name
}

export interface DateRangeValidationResult {
  valid: boolean;
  error?: string;
}

/* ---------------- Report Row Models ---------------- */

export interface CurrentStockRow {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  warehouseLabel: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  totalValue: number;
  status: 'active' | 'inactive';
}

export interface StockTransactionReportRow {
  id: string;
  date: string;
  voucherCode: string;
  direction: LedgerDirection;
  warehouseCode: string;
  warehouseName: string;
  partnerName: string;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  operator: string;
}

export interface StockMovementRow {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  openingQty: number;
  inQty: number;
  outQty: number;
  closingQty: number;
  inValue: number;
  outValue: number;
  closingValue: number;
}

export interface LowStockRow {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  warehouseLabel: string;
  currentQty: number;
  reorderLevel: number;
  deficitQty: number;
  unitCost: number;
  estimatedRestockValue: number;
  severity: 'out' | 'critical' | 'low';
}

export interface ReportChartSeriesItem {
  key: string;
  label: string;
  primaryQty: number;
  secondaryQty?: number; // Used for Outbound in Stock Movement or Reorder Level in Low Stock
  primaryValue: number; // Monetary value or closing value
  secondaryValue?: number;
}

export interface ReportTotalsSummary {
  rowCount: number;
  totalPrimaryQty: number;
  totalSecondaryQty?: number;
  totalClosingQty?: number;
  totalPrimaryValue: number;
  totalSecondaryValue?: number;
}

export interface ComputedReportResult {
  reportType: ReportType;
  rows:
    | CurrentStockRow[]
    | StockTransactionReportRow[]
    | StockMovementRow[]
    | LowStockRow[];
  chartTitle: string;
  chartSeries: ReportChartSeriesItem[];
  totals: ReportTotalsSummary;
}
