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
  const { t } = useTranslation();
  const meta = ROLE_META[role];

  if (context === 'restricted') {
    return (
      <div data-testid="role-restricted-notice">
        <Card padding="md" className="border-[#FECACA] bg-[#FEF2F2]/60">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <h3 className="font-semibold text-[#991B1B]">
                {t('usersRbac.scopeNotice.restrictedTitle')}
              </h3>
              <p className="text-[#7F1D1D]">
                {t('usersRbac.scopeNotice.restrictedDesc', { role: t(meta.labelKey) })}
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
          ? t('usersRbac.scopeNotice.readOnlyViewerDesc')
          : t('usersRbac.scopeNotice.readOnlyStaffDesc')}
      </span>
    </div>
  );
};
