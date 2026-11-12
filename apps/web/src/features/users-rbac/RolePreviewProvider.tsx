import React, { useMemo, useState } from 'react';
import { getRoleCapabilities } from './rbacMatrix';
import { RolePreviewContext } from './rolePreviewContext';
import type { RoleCode } from './types';

export interface RolePreviewProviderProps {
  children: React.ReactNode;
  initialRole?: RoleCode;
}

export const RolePreviewProvider: React.FC<RolePreviewProviderProps> = ({
  children,
  initialRole = 'ADMIN',
}) => {
  const [activeRole, setActiveRole] = useState<RoleCode>(initialRole);

  const value = useMemo(
    () => ({
      activeRole,
      capabilities: getRoleCapabilities(activeRole),
      setActiveRole,
      resetRole: () => setActiveRole(initialRole),
      isSimulated: Boolean(import.meta.env.DEV),
    }),
    [activeRole, initialRole]
  );

  return <RolePreviewContext.Provider value={value}>{children}</RolePreviewContext.Provider>;
};
