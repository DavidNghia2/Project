export type OrderStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

export type OrderDirection = 'IN' | 'OUT';

export interface StatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actor: string;
  timestamp: string;
  note: string;
}

export interface StockInLineItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface StockInOrder {
  id: string;
  code: string;
  warehouseCode: string;
  warehouseName: string;
  supplierCode: string;
  supplierName: string;
  referenceNote: string;
  items: StockInLineItem[];
  totalQty: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export interface StockOutLineItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  availableStock: number;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface StockOutOrder {
  id: string;
  code: string;
  warehouseCode: string;
  warehouseName: string;
  destination: string;
  reason: string;
  items: StockOutLineItem[];
  totalQty: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

/* ---------------- Form DTOs ---------------- */
export interface StockInLineForm {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface StockInFormData {
  warehouseCode: string;
  supplierCode: string;
  referenceNote: string;
  items: StockInLineForm[];
}

export interface StockOutLineForm {
  id: string;
  productId: string;
  quantity: number;
}

export interface StockOutFormData {
  warehouseCode: string;
  destination: string;
  reason: string;
  items: StockOutLineForm[];
}

export interface LineValidationError {
  productId?: string;
  quantity?: string;
  unitCost?: string;
}

export interface StockOrderValidationErrors {
  warehouseCode?: string;
  supplierCode?: string;
  destination?: string;
  reason?: string;
  itemsGeneral?: string;
  lineErrors?: Record<string, LineValidationError>;
}
