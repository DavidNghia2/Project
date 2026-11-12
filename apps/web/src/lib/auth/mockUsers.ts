import type { RoleCode } from '../../features/users-rbac/types';
import { hashMockPassword } from './passwordHash';
import type { AuthUser } from './types';

export interface StoredMockUserRecord {
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  avatarInitials: string;
  assignedWarehouses: string[];
  passwordHash: string;
  createdAt: string;
}

export interface DemoAccountSummary {
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  passwordHint: string;
}

const DEMO_SHARED_PASSWORD = ['Demo', '@1234'].join('');

const DEMO_ACCOUNT_SEEDS: ReadonlyArray<{
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  avatarInitials: string;
  assignedWarehouses: string[];
  salt: string;
}> = [
  {
    id: 'USR-DEMO-001',
    email: 'admin@demo.com',
    fullName: 'Nguyễn Quản Trị',
    role: 'ADMIN',
    avatarInitials: 'AD',
    assignedWarehouses: ['ALL'],
    salt: 'demo01admin9a2f',
  },
  {
    id: 'USR-DEMO-002',
    email: 'manager@demo.com',
    fullName: 'Trần Thị Thu',
    role: 'WAREHOUSE_MANAGER',
    avatarInitials: 'WM',
    assignedWarehouses: ['WH-01', 'WH-02'],
    salt: 'demo02mgr4b1c',
  },
  {
    id: 'USR-DEMO-003',
    email: 'staff@demo.com',
    fullName: 'Phạm Văn Nam',
    role: 'WAREHOUSE_STAFF',
    avatarInitials: 'WS',
    assignedWarehouses: ['WH-01'],
    salt: 'demo03stf8c3d',
  },
  {
    id: 'USR-DEMO-004',
    email: 'viewer@demo.com',
    fullName: 'Đoàn Thị Mai',
    role: 'VIEWER',
    avatarInitials: 'VW',
    assignedWarehouses: ['WH-01', 'WH-02', 'WH-03'],
    salt: 'demo04vwr2e7a',
  },
];

export const SEEDED_MOCK_USERS: readonly StoredMockUserRecord[] = DEMO_ACCOUNT_SEEDS.map((seed) => ({
  id: seed.id,
  email: seed.email,
  fullName: seed.fullName,
  role: seed.role,
  avatarInitials: seed.avatarInitials,
  assignedWarehouses: seed.assignedWarehouses,
  passwordHash: hashMockPassword(DEMO_SHARED_PASSWORD, seed.salt),
  createdAt: '2026-01-01T00:00:00Z',
}));

export const DEMO_ACCOUNTS: readonly DemoAccountSummary[] = DEMO_ACCOUNT_SEEDS.map((seed) => ({
  id: seed.id,
  email: seed.email,
  fullName: seed.fullName,
  role: seed.role,
  passwordHint: DEMO_SHARED_PASSWORD,
}));

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export interface PasswordPolicyEvaluation {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
  passedCount: number;
}

export function evaluatePasswordPolicy(password: string): PasswordPolicyEvaluation {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passedCount = Number(hasMinLength) + Number(hasUppercase) + Number(hasNumber);
  return {
    hasMinLength,
    hasUppercase,
    hasNumber,
    isValid: hasMinLength && hasUppercase && hasNumber,
    passedCount,
  };
}

export function computeAvatarInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function toPublicAuthUser(record: StoredMockUserRecord): AuthUser {
  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    role: record.role,
    avatarInitials: record.avatarInitials,
    assignedWarehouses: [...record.assignedWarehouses],
  };
}
