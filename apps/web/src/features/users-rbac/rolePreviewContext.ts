import { createContext } from 'react';
import { getRoleCapabilities } from './rbacMatrix';
import type { RoleCapabilities, RoleCode } from './types';

export interface RolePreviewContextValue {
  activeRole: RoleCode;
  capabilities: RoleCapabilities;
  setActiveRole: (role: RoleCode) => void;
  resetRole: () => void;
  isSimulated: boolean;
}

export const DEFAULT_ROLE_PREVIEW_VALUE: RolePreviewContextValue = {
  activeRole: 'ADMIN',
  capabilities: getRoleCapabilities('ADMIN'),
  setActiveRole: () => {},
  resetRole: () => {},
  isSimulated: false,
};

export const RolePreviewContext = createContext<RolePreviewContextValue>(
  DEFAULT_ROLE_PREVIEW_VALUE
);
