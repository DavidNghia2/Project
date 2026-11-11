export * from './types';
export * from './rbacMatrix';
export * from './mockUsers';
export * from './useUsers';
export * from './rolePreviewContext';
export * from './RolePreviewProvider';
export * from './useRolePreview';
export { UserFiltersBar } from './components/UserFiltersBar';
export { UserFormModal } from './components/UserFormModal';
export { RoleMatrixSummaryCard } from './components/RoleMatrixSummaryCard';
export { RoleScopeNotice } from './components/RoleScopeNotice';
// Note: DevRolePreviewBar is intentionally NOT exported from this barrel module
// so Vite/Rollup can completely tree-shake it out of production builds.
