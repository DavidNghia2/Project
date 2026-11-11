import React from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { ROLE_META, ROLE_ORDER } from '../rbacMatrix';
import { useRolePreview } from '../useRolePreview';

export const DevRolePreviewBar: React.FC = () => {
  const { t } = useTranslation();
  const { activeRole, capabilities, setActiveRole, resetRole } = useRolePreview();
  const meta = ROLE_META[activeRole];

  return (
    <div
      data-testid="dev-role-preview-bar"
      role="region"
      aria-label={t('usersRbac.previewBar.ariaLabel')}
      className="bg-[#FFFBEB] border-b border-[#FDE68A] px-3 sm:px-6 py-2 text-xs text-[#78350F] shrink-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#F59E0B]/40 font-mono text-[11px] font-bold text-[#92400E] whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{t('usersRbac.previewBar.badge')}</span>
          </span>

          <div
            role="group"
            aria-label={t('usersRbac.previewBar.roleGroupAriaLabel')}
            className="inline-flex flex-wrap items-center gap-1"
          >
            {ROLE_ORDER.map((roleCode) => {
              const isSelected = activeRole === roleCode;
              return (
                <button
                  key={roleCode}
                  id={`btn-preview-role-${roleCode}`}
                  type="button"
                  onClick={() => setActiveRole(roleCode)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  {t(`usersRbac.roles.${roleCode}.short`)}
                </button>
              );
            })}
          </div>

          {activeRole !== 'ADMIN' && (
            <button
              id="btn-reset-preview-role"
              type="button"
              onClick={resetRole}
              aria-label={t('usersRbac.previewBar.resetAriaLabel')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[#92400E] hover:bg-[#FEF3C7] border border-[#FDE68A] font-medium cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('usersRbac.previewBar.resetBtn')}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#92400E]">
          <span className="font-semibold" data-testid="preview-role-summary">
            {t('usersRbac.previewBar.activeMenusSummary', {
              role: t(meta.labelKey),
              count: capabilities.allowedNavKeys.length,
            })}
            {capabilities.isReadOnly ? ` ${t('usersRbac.previewBar.readOnlySuffix')}` : ''}
          </span>
          <span className="hidden xl:inline text-[#B45309]">|</span>
          <span className="hidden xl:inline text-[#92400E]">
            {t('usersRbac.previewBar.notice')}
          </span>
        </div>
      </div>
    </div>
  );
};
