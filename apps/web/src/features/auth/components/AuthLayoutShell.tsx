import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Boxes, Globe } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { Badge } from '../../../design-system';
import { useAuth } from '../useAuth';

export interface AuthLayoutShellProps {
  children: React.ReactNode;
}

export const AuthLayoutShell: React.FC<AuthLayoutShellProps> = ({ children }) => {
  const { t, language, toggleLanguage } = useTranslation();
  const { isMockMode } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* Subtle architectural radial glow top wash */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 min-w-0 rounded-md py-1.5 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform duration-150 group-hover:scale-105">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-semibold text-sm text-[#0F172A] tracking-tight truncate">
                  {t('layout.brandName')}
                </span>
                <span className="text-[11px] font-medium text-[#475569] uppercase tracking-wider truncate">
                  {t('layout.brandSub')}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isMockMode && (
              <span className="hidden sm:inline-flex">
                <Badge variant="warning" size="sm" dot>
                  {t('auth.demoMode')}
                </Badge>
              </span>
            )}

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors cursor-pointer"
              title={t('demo.switch_lang')}
              aria-label={t('demo.switch_lang')}
            >
              <Globe className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span className="uppercase">{language}</span>
            </button>

            <Link
              to="/"
              aria-label={t('auth.backToHome')}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] min-w-[40px] px-2.5 sm:px-3 rounded-md text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t('auth.backToHome')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-[440px] space-y-5">{children}</div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 py-4 px-4 text-center text-xs text-[#64748B] border-t border-[#E2E8F0] bg-white/70">
        <p>{t('auth.prototypeDisclaimer')}</p>
      </footer>
    </div>
  );
};
