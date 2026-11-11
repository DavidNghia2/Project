export type ProductStatus = 'active' | 'inactive';

export interface WarehouseStock {
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  barcode: string;
  imageUrl?: string;
  description?: string;
  reorderLevel: number;
  onHand: number;
  status: ProductStatus;
  warehouses: WarehouseStock[];
  supplierCode?: string;
  supplierName?: string;
  costPrice?: number;
  sellingPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  category: string;
  unit: string;
  barcode: string;
  imageUrl: string;
  description: string;
  reorderLevel: number;
  initialStock: number;
  primaryWarehouse: string;
  status: ProductStatus;
}

export interface ProductFilterState {
  search: string;
  category: string;
  status: string;
  warehouse: string;
  sortBy: 'name' | 'sku' | 'onHand';
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ValidationErrors {
  sku?: string;
  name?: string;
  category?: string;
  unit?: string;
  reorderLevel?: string;
  initialStock?: string;
  primaryWarehouse?: string;
  barcode?: string;
}
