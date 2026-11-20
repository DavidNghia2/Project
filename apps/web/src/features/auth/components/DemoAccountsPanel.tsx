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
      className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
      data-testid="demo-accounts-panel"
    >
      <button
        type="button"
        id="btn-toggle-demo-accounts"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-[#FAFBFD] hover:bg-[#F1F5F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB] cursor-pointer"
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
        <div className="p-4 space-y-3 border-t border-slate-200/80">
          <p className="text-xs text-[#475569] leading-relaxed">{t('auth.demoNote')}</p>

          {/* Compact 2x2 Grid so all 4 roles sit visibly above the fold on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account: DemoAccountSummary) => {
              const roleMeta = ROLE_META[account.role];
              return (
                <button
                  key={account.id}
                  type="button"
                  data-testid={`demo-account-${account.role}`}
                  onClick={() => onSelectDemoAccount(account.email, account.passwordHint)}
                  className="w-full min-h-[44px] p-3 rounded-xl border border-slate-200/90 bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]/45 text-left flex flex-col justify-between gap-1.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <Badge variant={roleMeta.badgeVariant} size="sm">
                      {t(`topbar.roleShort.${account.role}`)}
                    </Badge>
                    <span className="text-[11px] font-semibold text-[#2563EB] group-hover:underline">
                      {t('auth.fillAccount')}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB] truncate">
                      {account.email}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 truncate">
                      <span className="font-mono text-[#334155]">{account.passwordHint}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-2 pt-0.5 text-[11px] text-[#64748B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
            <span>{t('auth.mockStorageNotice')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
