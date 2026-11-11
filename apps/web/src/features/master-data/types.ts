export type MasterStatus = 'active' | 'inactive';

export type WarehouseType = 'main' | 'regional' | 'transit' | 'reserve';

export type MeasureType = 'discrete' | 'packaging' | 'length' | 'weight';

export interface ProductReferenceSummary {
  id: string;
  sku: string;
  name: string;
  detailText?: string;
  status: MasterStatus;
}

/* ---------------- 1. Warehouses ---------------- */
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  region: string;
  type: WarehouseType;
  address: string;
  manager: string;
  staffCount: number;
  capacityPercent: number;
  description?: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseFormData {
  code: string;
  name: string;
  region: string;
  type: WarehouseType;
  address: string;
  manager: string;
  staffCount: number;
  capacityPercent: number;
  description: string;
  status: MasterStatus;
}

/* ---------------- 2. Categories ---------------- */
export interface Category {
  id: string;
  code: string;
  name: string;
  parentGroup: string;
  description: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  code: string;
  name: string;
  parentGroup: string;
  description: string;
  status: MasterStatus;
}

/* ---------------- 3. Units of Measurement ---------------- */
export interface UnitOfMeasure {
  id: string;
  code: string;
  name: string;
  symbol: string;
  measureType: MeasureType;
  conversionNote: string;
  description: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UnitFormData {
  code: string;
  name: string;
  symbol: string;
  measureType: MeasureType;
  conversionNote: string;
  description: string;
  status: MasterStatus;
}

/* ---------------- 4. Suppliers ---------------- */
export interface Supplier {
  id: string;
  code: string;
  name: string;
  categoryFocus: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  notes: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormData {
  code: string;
  name: string;
  categoryFocus: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  notes: string;
  status: MasterStatus;
}

export type ValidationErrors = Record<string, string | undefined>;
