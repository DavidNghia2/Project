import React from 'react';
import { Lock } from 'lucide-react';
import { Card } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import { ROLE_META } from '../rbacMatrix';
import type { RoleCode } from '../types';

export interface ReadOnlyBannerProps {
  role: RoleCode;
  context?: 'catalog' | 'operations' | 'restricted';
}

export const RoleScopeNotice: React.FC<ReadOnlyBannerProps> = ({
  role,
  context = 'catalog',
}) => {
  const { language } = useTranslation();
  const meta = ROLE_META[role];

  if (context === 'restricted') {
    return (
      <div data-testid="role-restricted-notice">
        <Card padding="md" className="border-[#FECACA] bg-[#FEF2F2]/60">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h3 className="font-semibold text-[#991B1B]">
                {language === 'vi'
                  ? 'Không có quyền truy cập trang quản trị này'
                  : 'Access restricted for current role'}
              </h3>
              <p className="text-[#7F1D1D]">
                {language === 'vi'
                  ? `Vai trò hiện tại (${meta.labelVi}) không được cấp quyền sử dụng phân hệ này theo ma trận phân quyền.`
                  : `The active role (${meta.labelEn}) does not have permission to access this administration module.`}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      data-testid="role-readonly-notice"
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#475569]"
    >
      <Lock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
      <span>
        {role === 'VIEWER'
          ? language === 'vi'
            ? 'Chế độ chỉ xem (Viewer): Các thao tác thêm mới, chỉnh sửa, xóa và phê duyệt đã được ẩn trên giao diện.'
            : 'Read-only Viewer mode: Create, edit, delete, and approval controls are hidden.'
          : language === 'vi'
            ? 'Quyền chỉ xem danh mục (Staff): Chỉ Admin hoặc Warehouse Manager mới có quyền thêm, sửa hoặc xóa dữ liệu này.'
            : 'Read-only catalog scope (Staff): Only Admin or Warehouse Manager can create, edit, or delete records.'}
      </span>
    </div>
  );
};
