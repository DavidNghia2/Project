import type { BadgeVariant } from '../../design-system';

export type RoleCode =
  | 'ADMIN'
  | 'WAREHOUSE_MANAGER'
  | 'WAREHOUSE_STAFF'
  | 'VIEWER';

export type UserStatus = 'active' | 'inactive';

export type NavMenuKey =
  | 'dashboard'
  | 'stock-in'
  | 'stock-out'
  | 'stocktaking'
  | 'products'
  | 'warehouses'
  | 'categories'
  | 'units'
  | 'suppliers'
  | 'alerts'
  | 'reports'
  | 'users'
  | 'settings'
  | 'design-system';

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  department: string;
  role: RoleCode;
  /** Warehouse codes (`WH-01`, etc.) or `['ALL']` for system-wide Admin */
  assignedWarehouses: string[];
  status: UserStatus;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  fullName: string;
  email: string;
  department: string;
  role: RoleCode;
  assignedWarehouses: string[];
  status: UserStatus;
}

export interface UserValidationErrors {
  fullName?: string;
  email?: string;
  department?: string;
  assignedWarehouses?: string;
}

export interface RoleCapabilities {
  role: RoleCode;
  allowedNavKeys: readonly NavMenuKey[];
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageWarehouses: boolean;
  canManageCatalog: boolean;
  canCreateStockOrder: boolean;
  canApproveStockOrder: boolean;
  canConductStocktaking: boolean;
  canApproveStocktaking: boolean;
  canConfigureAlerts: boolean;
  canExportReports: boolean;
  isReadOnly: boolean;
}

export interface RoleMeta {
  code: RoleCode;
  labelKey: string;
  badgeVariant: BadgeVariant;
  scopeNoteKey: string;
}

export interface PermissionMatrixRow {
  moduleKey: string;
  moduleLabelKey: string;
  admin: 'FULL' | 'READ' | 'NONE' | 'LIMITED';
  manager: 'FULL' | 'SCOPED' | 'READ' | 'NONE';
  staff: 'CREATE' | 'READ' | 'LIMITED' | 'NONE';
  viewer: 'READ' | 'NONE';
}
