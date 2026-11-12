import React, { useState } from 'react';
import { ChevronDown, ChevronUp, KeyRound, ShieldCheck } from 'lucide-react';
import { DEMO_ACCOUNTS, type DemoAccountSummary } from '../../../lib/auth';
import { ROLE_META } from '../../users-rbac/rbacMatrix';
import { Badge } from '../../../design-system';
import { useTranslation } from '../../../i18n';

export interface DemoAccountsPanelProps {
  onSelectDemoAccount: (email: string, password: string) => void;
}

export const DemoAccountsPanel: React.FC<DemoAccountsPanelProps> = ({
  onSelectDemoAccount,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden"
      data-testid="demo-accounts-panel"
    >
      <button
        type="button"
        id="btn-toggle-demo-accounts"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB] cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <KeyRound className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span className="text-xs font-semibold text-[#0F172A] truncate">
            {t('auth.demoAccounts')}
          </span>
          <Badge variant="info" size="sm">
            {t('auth.demoMode')}
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#64748B] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-3 border-t border-[#E2E8F0]">
          <p className="text-xs text-[#475569] leading-relaxed">{t('auth.demoNote')}</p>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((account: DemoAccountSummary) => {
              const roleMeta = ROLE_META[account.role];
              return (
                <button
                  key={account.id}
                  type="button"
                  data-testid={`demo-account-${account.role}`}
                  onClick={() => onSelectDemoAccount(account.email, account.passwordHint)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB]">
                        {account.email}
                      </span>
                      <Badge variant={roleMeta.badgeVariant} size="sm">
                        {t(`topbar.roleShort.${account.role}`)}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                      {t('auth.password')}:{' '}
                      <span className="font-mono text-[#334155]">{account.passwordHint}</span>
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2563EB] shrink-0 group-hover:underline">
                    {t('auth.fillAccount')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-[#64748B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
            <span>{t('auth.mockStorageNotice')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
