import React from 'react';
import { Badge, Card } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { SPEC_PERMISSION_ROWS } from '../rbacMatrix';
import type { RoleCode } from '../types';

function renderPermissionCell(
  level: 'FULL' | 'SCOPED' | 'CREATE' | 'READ' | 'LIMITED' | 'NONE',
  t: (key: string) => string
) {
  switch (level) {
    case 'FULL':
      return (
        <Badge variant="success" size="sm">
          {t('usersRbac.matrix.levels.FULL')}
        </Badge>
      );
    case 'SCOPED':
      return (
        <Badge variant="info" size="sm">
          {t('usersRbac.matrix.levels.SCOPED')}
        </Badge>
      );
    case 'CREATE':
      return (
        <Badge variant="warning" size="sm">
          {t('usersRbac.matrix.levels.CREATE')}
        </Badge>
      );
    case 'READ':
      return (
        <Badge variant="neutral" size="sm">
          {t('usersRbac.matrix.levels.READ')}
        </Badge>
      );
    case 'LIMITED':
      return (
        <Badge variant="neutral" size="sm">
          {t('usersRbac.matrix.levels.LIMITED')}
        </Badge>
      );
    default:
      return <span className="text-xs font-mono text-[#94A3B8]">—</span>;
  }
}

export interface RoleMatrixSummaryCardProps {
  highlightedRole?: RoleCode;
}

export const RoleMatrixSummaryCard: React.FC<RoleMatrixSummaryCardProps> = ({
  highlightedRole,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      title={t('usersRbac.matrix.title')}
      description={t('usersRbac.matrix.subtitle')}
      padding="md"
    >
      <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-semibold">
              <th className="py-2.5 px-3">{t('usersRbac.matrix.moduleHeader')}</th>
              <th
                className={`py-2.5 px-3 text-center ${
                  highlightedRole === 'ADMIN' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : ''
                }`}
              >
                ADMIN
              </th>
              <th
                className={`py-2.5 px-3 text-center ${
                  highlightedRole === 'WAREHOUSE_MANAGER' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : ''
                }`}
              >
                MANAGER
              </th>
              <th
                className={`py-2.5 px-3 text-center ${
                  highlightedRole === 'WAREHOUSE_STAFF' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : ''
                }`}
              >
                STAFF
              </th>
              <th
                className={`py-2.5 px-3 text-center ${
                  highlightedRole === 'VIEWER' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : ''
                }`}
              >
                VIEWER
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] bg-white">
            {SPEC_PERMISSION_ROWS.map((row) => (
              <tr key={row.moduleKey} className="hover:bg-[#F8FAFC]">
                <td className="py-2.5 px-3 font-medium text-[#0F172A]">
                  {t(row.moduleLabelKey)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.admin, t)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.manager, t)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.staff, t)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.viewer, t)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
