import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { m } from 'motion/react';
import { ArrowLeft, Boxes, CheckCircle2, ShieldCheck } from 'lucide-react';
import { LanguageSelect, useTranslation } from '../../../i18n';
import { Badge, MOTION_SPRING, useSafeReducedMotion } from '../../../design-system';
import { useAuth } from '../useAuth';

export interface AuthLayoutShellProps {
  children: React.ReactNode;
}

export const AuthLayoutShell: React.FC<AuthLayoutShellProps> = ({ children }) => {
  const { t } = useTranslation();
  const { isMockMode } = useAuth();
  const { pathname } = useLocation();
  const shouldReduceMotion = useSafeReducedMotion();
  const isRegister = pathname === '/register';

  const showcasePoints = [
    t('auth.showcasePoints.p1'),
    t('auth.showcasePoints.p2'),
    t('auth.showcasePoints.p3'),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] text-[#0F172A] font-sans antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] font-medium text-sm"
      >
        {t('layout.skipToContent')}
      </a>

      {/* Top Navigation Utility Bar */}
      <header className="sticky top-0 z-20 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 min-w-0 rounded-md py-1.5 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-150 group-hover:scale-105">
                <Boxes className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span translate="no" className="font-display font-bold text-sm text-[#0F172A] tracking-tight truncate">
                  {t('layout.brandName')}
                </span>
                <span className="hidden min-[360px]:block text-[11px] font-medium text-[#475569] uppercase tracking-wider truncate">
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

            <LanguageSelect id="auth-language" />

            <Link
              to="/"
              aria-label={t('auth.backToHome')}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-2.5 sm:px-3 rounded-lg text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{t('auth.backToHome')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Split-Screen Main Workspace */}
      <main id="main-content" tabIndex={-1} className="flex-1 grid grid-cols-1 lg:grid-cols-12 outline-none">
        {/* Left Obsidian Brand Showcase Column (Desktop lg+) */}
        <aside
          aria-label={t('layout.brandName')}
          className="hidden lg:flex lg:col-span-6 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] relative overflow-hidden bg-[#060911] text-white flex-col justify-between px-10 py-8 xl:px-14 xl:py-10 border-r border-white/10"
        >
          {/* Coordinate Dot Grid & Atmospheric Ocean-Blue Glow */}
          <div
            className="pointer-events-none absolute inset-0 obsidian-dot-grid opacity-40"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(65% 50% at 25% 22%, rgba(37, 99, 235, 0.25), transparent 72%), radial-gradient(45% 45% at 85% 82%, rgba(14, 165, 233, 0.14), transparent 70%)',
            }}
          />

          <div className="relative z-10 w-full max-w-[500px] mx-auto my-auto space-y-7 py-2">
            <div className="space-y-3">
              <h2 className="font-display text-3xl xl:text-[2.15rem] font-extrabold tracking-[-0.025em] leading-[1.16] text-white text-balance">
                {t('auth.showcaseHeadline')}
              </h2>
              <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
                {t('auth.showcaseCopy')}
              </p>
            </div>

            {/* Live Guard Pipeline Showcase Card */}
            <div className="rounded-2xl border border-white/12 bg-[#0B1220]/90 p-5 space-y-4 shadow-[0_24px_56px_-18px_rgba(0,0,0,0.75)]">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex w-2.5 h-2.5 shrink-0 items-center justify-center">
                    <span
                      className="absolute inset-0 rounded-full bg-emerald-400/75 live-beacon-ring"
                      aria-hidden="true"
                    />
                    <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-300 tracking-wider uppercase truncate">
                    {t('auth.showcaseLedgerLabel')}
                  </span>
                </div>
                <span translate="no" className="text-[11px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded shrink-0">
                  WH-01 · WH-02 · WH-03
                </span>
              </div>

              {/* Maker-Checker 3-Stage Track */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-slate-200 text-center font-medium">
                  {t('landing.features.stepDraft')}
                </div>
                <div className="px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-400/25 text-amber-300 text-center font-medium">
                  {t('landing.features.stepSubmitted')}
                </div>
                <div className="px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-center font-medium">
                  {t('landing.features.stepApproved')}
                </div>
              </div>

              <ul className="space-y-2.5 pt-1">
                {showcasePoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-[500px] mx-auto pt-5 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
            <span>{t(isMockMode ? 'auth.prototypeDisclaimer' : 'auth.productionTrustNote')}</span>
          </div>
        </aside>

        {/* Right Form Workspace Column */}
        <div className="lg:col-span-6 flex items-start justify-center px-4 py-7 sm:px-8 lg:pt-10 lg:pb-12">
          <div className="w-full max-w-[490px] space-y-4">
            {/* Compact Route Switcher Segmented Control with Sliding Pill */}
            <nav
              aria-label={t('auth.signIn')}
              className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/75 border border-slate-200/90 relative"
            >
              <Link
                to="/login"
                className={`relative min-h-[44px] flex items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  !isRegister
                    ? 'text-[#0F172A]'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {!isRegister && (
                  <m.span
                    layoutId="auth-route-sliding-pill"
                    aria-hidden="true"
                    transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_SPRING.tab}
                    className="pointer-events-none absolute inset-0 rounded-lg bg-white shadow-xs"
                  />
                )}
                <span className="relative z-10">{t('auth.signIn')}</span>
              </Link>
              <Link
                to="/register"
                className={`relative min-h-[44px] flex items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  isRegister
                    ? 'text-[#0F172A]'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {isRegister && (
                  <m.span
                    layoutId="auth-route-sliding-pill"
                    aria-hidden="true"
                    transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_SPRING.tab}
                    className="pointer-events-none absolute inset-0 rounded-lg bg-white shadow-xs"
                  />
                )}
                <span className="relative z-10">{t('auth.signUp')}</span>
              </Link>
            </nav>

            {children}
          </div>
        </div>
      </main>

      {/* Mobile / Tablet Footer Note (hidden on desktop where left showcase shows it) */}
      <footer className="lg:hidden relative z-10 py-4 px-4 text-center text-xs text-[#64748B] border-t border-[#E2E8F0] bg-white">
        <p>{t(isMockMode ? 'auth.prototypeDisclaimer' : 'auth.productionTrustNote')}</p>
      </footer>
    </div>
  );
};
