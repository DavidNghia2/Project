import {
  INITIAL_WAREHOUSES,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_SUPPLIERS,
  getWarehouseReferences,
  getCategoryReferences,
  getUnitReferences,
  getSupplierReferences,
} from './mockData';
import {
  validateWarehouse,
  validateCategory,
  validateUnit,
  validateSupplier,
} from './validators';
import { useMasterData } from './useMasterData';
import type {
  Warehouse,
  WarehouseFormData,
  Category,
  CategoryFormData,
  UnitOfMeasure,
  UnitFormData,
  Supplier,
  SupplierFormData,
} from './types';

/* ---------------- Warehouses Hook ---------------- */
const matchWarehouseSearch = (w: Warehouse, q: string) =>
  w.code.toLowerCase().includes(q) ||
  w.name.toLowerCase().includes(q) ||
  w.manager.toLowerCase().includes(q) ||
  w.address.toLowerCase().includes(q);

const matchWarehouseSecondary = (w: Warehouse, filter: string) =>
  w.region === filter || w.type === filter;

const createWarehouseRecord = (f: WarehouseFormData, id: string, now: string): Warehouse => ({
  id,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  region: f.region,
  type: f.type,
  address: f.address.trim(),
  manager: f.manager.trim(),
  staffCount: Number(f.staffCount),
  capacityPercent: Number(f.capacityPercent),
  description: f.description.trim() || undefined,
  status: f.status,
  createdAt: now,
  updatedAt: now,
});

const updateWarehouseRecord = (e: Warehouse, f: WarehouseFormData, now: string): Warehouse => ({
  ...e,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  region: f.region,
  type: f.type,
  address: f.address.trim(),
  manager: f.manager.trim(),
  staffCount: Number(f.staffCount),
  capacityPercent: Number(f.capacityPercent),
  description: f.description.trim() || undefined,
  status: f.status,
  updatedAt: now,
});

const warehouseRefs = (w: Warehouse) => getWarehouseReferences(w.code);

export function useWarehouses(initialItems: Warehouse[] = INITIAL_WAREHOUSES) {
  return useMasterData<Warehouse, WarehouseFormData>({
    initialItems,
    idPrefix: 'wh',
    validate: validateWarehouse,
    mapFormToCreate: createWarehouseRecord,
    mapFormToUpdate: updateWarehouseRecord,
    matchesSearch: matchWarehouseSearch,
    matchesSecondaryFilter: matchWarehouseSecondary,
    getReferences: warehouseRefs,
  });
}

/* ---------------- Categories Hook ---------------- */
const matchCategorySearch = (c: Category, q: string) =>
  c.code.toLowerCase().includes(q) ||
  c.name.toLowerCase().includes(q) ||
  c.parentGroup.toLowerCase().includes(q) ||
  c.description.toLowerCase().includes(q);

const matchCategorySecondary = (c: Category, filter: string) => c.parentGroup === filter;

const createCategoryRecord = (f: CategoryFormData, id: string, now: string): Category => ({
  id,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  parentGroup: f.parentGroup,
  description: f.description.trim(),
  status: f.status,
  createdAt: now,
  updatedAt: now,
});

const updateCategoryRecord = (e: Category, f: CategoryFormData, now: string): Category => ({
  ...e,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  parentGroup: f.parentGroup,
  description: f.description.trim(),
  status: f.status,
  updatedAt: now,
});

const categoryRefs = (c: Category) => getCategoryReferences(c.name);

export function useCategories(initialItems: Category[] = INITIAL_CATEGORIES) {
  return useMasterData<Category, CategoryFormData>({
    initialItems,
    idPrefix: 'cat',
    validate: validateCategory,
    mapFormToCreate: createCategoryRecord,
    mapFormToUpdate: updateCategoryRecord,
    matchesSearch: matchCategorySearch,
    matchesSecondaryFilter: matchCategorySecondary,
    getReferences: categoryRefs,
  });
}

/* ---------------- Units Hook ---------------- */
const matchUnitSearch = (u: UnitOfMeasure, q: string) =>
  u.code.toLowerCase().includes(q) ||
  u.name.toLowerCase().includes(q) ||
  u.symbol.toLowerCase().includes(q) ||
  u.description.toLowerCase().includes(q);

const matchUnitSecondary = (u: UnitOfMeasure, filter: string) => u.measureType === filter;

const createUnitRecord = (f: UnitFormData, id: string, now: string): UnitOfMeasure => ({
  id,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  symbol: f.symbol.trim(),
  measureType: f.measureType,
  conversionNote: f.conversionNote.trim(),
  description: f.description.trim(),
  status: f.status,
  createdAt: now,
  updatedAt: now,
});

const updateUnitRecord = (e: UnitOfMeasure, f: UnitFormData, now: string): UnitOfMeasure => ({
  ...e,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  symbol: f.symbol.trim(),
  measureType: f.measureType,
  conversionNote: f.conversionNote.trim(),
  description: f.description.trim(),
  status: f.status,
  updatedAt: now,
});

const unitRefs = (u: UnitOfMeasure) => getUnitReferences(u.name);

export function useUnits(initialItems: UnitOfMeasure[] = INITIAL_UNITS) {
  return useMasterData<UnitOfMeasure, UnitFormData>({
    initialItems,
    idPrefix: 'uom',
    validate: validateUnit,
    mapFormToCreate: createUnitRecord,
    mapFormToUpdate: updateUnitRecord,
    matchesSearch: matchUnitSearch,
    matchesSecondaryFilter: matchUnitSecondary,
    getReferences: unitRefs,
  });
}

/* ---------------- Suppliers Hook ---------------- */
const matchSupplierSearch = (s: Supplier, q: string) =>
  s.code.toLowerCase().includes(q) ||
  s.name.toLowerCase().includes(q) ||
  s.contactPerson.toLowerCase().includes(q) ||
  s.email.toLowerCase().includes(q) ||
  s.address.toLowerCase().includes(q);

const matchSupplierSecondary = (s: Supplier, filter: string) => s.paymentTerms === filter;

const createSupplierRecord = (f: SupplierFormData, id: string, now: string): Supplier => ({
  id,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  categoryFocus: f.categoryFocus.trim(),
  contactPerson: f.contactPerson.trim(),
  phone: f.phone.trim(),
  email: f.email.trim().toLowerCase(),
  address: f.address.trim(),
  paymentTerms: f.paymentTerms,
  notes: f.notes.trim(),
  status: f.status,
  createdAt: now,
  updatedAt: now,
});

const updateSupplierRecord = (e: Supplier, f: SupplierFormData, now: string): Supplier => ({
  ...e,
  code: f.code.trim().toUpperCase(),
  name: f.name.trim(),
  categoryFocus: f.categoryFocus.trim(),
  contactPerson: f.contactPerson.trim(),
  phone: f.phone.trim(),
  email: f.email.trim().toLowerCase(),
  address: f.address.trim(),
  paymentTerms: f.paymentTerms,
  notes: f.notes.trim(),
  status: f.status,
  updatedAt: now,
});

const supplierRefs = (s: Supplier) => getSupplierReferences(s.code);

export function useSuppliers(initialItems: Supplier[] = INITIAL_SUPPLIERS) {
  return useMasterData<Supplier, SupplierFormData>({
    initialItems,
    idPrefix: 'sup',
    validate: validateSupplier,
    mapFormToCreate: createSupplierRecord,
    mapFormToUpdate: updateSupplierRecord,
    matchesSearch: matchSupplierSearch,
    matchesSecondaryFilter: matchSupplierSecondary,
    getReferences: supplierRefs,
  });
}
