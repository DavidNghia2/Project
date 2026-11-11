import { INITIAL_WAREHOUSES } from '../master-data/mockData';
import type { SystemUser } from './types';

export interface WarehouseScopeOption {
  code: string;
  name: string;
  status: 'active' | 'inactive';
}

export const AVAILABLE_WAREHOUSE_OPTIONS: WarehouseScopeOption[] = INITIAL_WAREHOUSES.map((w) => ({
  code: w.code,
  name: w.name,
  status: w.status,
}));

export const USER_DEPARTMENTS: readonly string[] = [
  'Ban Điều hành CNTT (IT Operations)',
  'Vận hành Kho Miền Bắc',
  'Vận hành Kho Miền Trung',
  'Vận hành Kho Miền Nam',
  'Tài chính & Kiểm toán Nội bộ',
];

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'USR-001',
    fullName: 'Nguyễn Quản Trị (Admin)',
    email: 'admin@smartinventory.local',
    department: 'Ban Điều hành CNTT (IT Operations)',
    role: 'ADMIN',
    assignedWarehouses: ['ALL'],
    status: 'active',
    lastActive: '11/11/2026 09:45',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-11-10T09:00:00Z',
  },
  {
    id: 'USR-002',
    fullName: 'Trần Thị Thu (Manager)',
    email: 'thu.tran@smartinventory.local',
    department: 'Vận hành Kho Miền Trung',
    role: 'WAREHOUSE_MANAGER',
    assignedWarehouses: ['WH-02'],
    status: 'active',
    lastActive: '11/11/2026 09:12',
    createdAt: '2026-02-14T08:30:00Z',
    updatedAt: '2026-11-08T14:20:00Z',
  },
  {
    id: 'USR-003',
    fullName: 'Lê Hoàng Long (Manager)',
    email: 'long.le@smartinventory.local',
    department: 'Vận hành Kho Miền Nam',
    role: 'WAREHOUSE_MANAGER',
    assignedWarehouses: ['WH-03'],
    status: 'active',
    lastActive: '10/11/2026 17:40',
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-11-09T16:15:00Z',
  },
  {
    id: 'USR-004',
    fullName: 'Phạm Văn Nam (Staff)',
    email: 'nam.pham@smartinventory.local',
    department: 'Vận hành Kho Miền Bắc',
    role: 'WAREHOUSE_STAFF',
    assignedWarehouses: ['WH-01', 'WH-02'],
    status: 'active',
    lastActive: '11/11/2026 08:30',
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-11-06T10:45:00Z',
  },
  {
    id: 'USR-005',
    fullName: 'Đoàn Thị Mai (Viewer)',
    email: 'mai.doan@smartinventory.local',
    department: 'Tài chính & Kiểm toán Nội bộ',
    role: 'VIEWER',
    assignedWarehouses: ['WH-01', 'WH-02', 'WH-03'],
    status: 'inactive',
    lastActive: '02/11/2026 11:05',
    createdAt: '2026-04-18T10:00:00Z',
    updatedAt: '2026-11-02T11:05:00Z',
  },
];

export function formatWarehouseScopeLabel(
  assignedWarehouses: string[],
  language: 'vi' | 'en'
): string {
  if (assignedWarehouses.includes('ALL')) {
    return language === 'vi' ? 'Toàn hệ thống (All)' : 'All Warehouses (System)';
  }
  if (assignedWarehouses.length === 0) {
    return language === 'vi' ? 'Chưa gán kho' : 'Unassigned';
  }
  return assignedWarehouses
    .map((code) => {
      const match = AVAILABLE_WAREHOUSE_OPTIONS.find((w) => w.code === code);
      return match ? `${match.name} (${match.code})` : code;
    })
    .join(', ');
}
