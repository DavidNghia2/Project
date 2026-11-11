import React from 'react';
import { Badge, Card } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { SPEC_PERMISSION_ROWS } from '../rbacMatrix';
import type { RoleCode } from '../types';

function renderPermissionCell(
  level: 'FULL' | 'SCOPED' | 'CREATE' | 'READ' | 'LIMITED' | 'NONE',
  language: 'vi' | 'en'
) {
  switch (level) {
    case 'FULL':
      return (
        <Badge variant="success" size="sm">
          {language === 'vi' ? 'Toàn quyền' : 'Full'}
        </Badge>
      );
    case 'SCOPED':
      return (
        <Badge variant="info" size="sm">
          {language === 'vi' ? 'Theo kho gán' : 'Assigned scope'}
        </Badge>
      );
    case 'CREATE':
      return (
        <Badge variant="warning" size="sm">
          {language === 'vi' ? 'Lập & gửi' : 'Create / Submit'}
        </Badge>
      );
    case 'READ':
      return (
        <Badge variant="neutral" size="sm">
          {language === 'vi' ? 'Chỉ xem' : 'Read-only'}
        </Badge>
      );
    case 'LIMITED':
      return (
        <Badge variant="neutral" size="sm">
          {language === 'vi' ? 'Giới hạn' : 'Limited'}
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
  const { language } = useTranslation();

  return (
    <Card
      title={
        language === 'vi'
          ? 'Ma trận phân quyền 4 vai trò (RBAC Reference)'
          : '4-Role RBAC Permission Matrix'
      }
      description={
        language === 'vi'
          ? 'Đối chiếu quyền truy cập menu và thao tác nghiệp vụ theo đặc tả thiết kế hệ thống.'
          : 'Module visibility and action permissions mapped across the four system roles.'
      }
      padding="md"
    >
      <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-semibold">
              <th className="py-2.5 px-3">
                {language === 'vi' ? 'Phân hệ / Chức năng' : 'Module / Capability'}
              </th>
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
                  {language === 'vi' ? row.moduleVi : row.moduleEn}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.admin, language)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.manager, language)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.staff, language)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {renderPermissionCell(row.viewer, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
