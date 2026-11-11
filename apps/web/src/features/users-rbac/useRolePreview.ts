import { useContext } from 'react';
import { RolePreviewContext } from './rolePreviewContext';

export function useRolePreview() {
  return useContext(RolePreviewContext);
}
