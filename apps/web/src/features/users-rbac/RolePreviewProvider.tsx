import React, { useMemo, useState } from 'react';
import { getRoleCapabilities } from './rbacMatrix';
import { RolePreviewContext, DEFAULT_ROLE_PREVIEW_VALUE } from './rolePreviewContext';
import type { RoleCode } from './types';

export interface RolePreviewProviderProps {
  children: React.ReactNode;
  initialRole?: RoleCode;
}

const DevRolePreviewProvider: React.FC<RolePreviewProviderProps> = ({
  children,
  initialRole = 'ADMIN',
}) => {
  const [activeRole, setActiveRole] = useState<RoleCode>(initialRole);

  const value = useMemo(
    () => ({
      activeRole,
      capabilities: getRoleCapabilities(activeRole),
      setActiveRole,
      resetRole: () => setActiveRole('ADMIN'),
      isSimulated: true,
    }),
    [activeRole]
  );

  return <RolePreviewContext.Provider value={value}>{children}</RolePreviewContext.Provider>;
};

export const RolePreviewProvider: React.FC<RolePreviewProviderProps> = ({
  children,
  initialRole = 'ADMIN',
}) => {
  if (!import.meta.env.DEV) {
    return (
      <RolePreviewContext.Provider value={DEFAULT_ROLE_PREVIEW_VALUE}>
        {children}
      </RolePreviewContext.Provider>
    );
  }

  return (
    <DevRolePreviewProvider initialRole={initialRole}>{children}</DevRolePreviewProvider>
  );
};
