import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  BarChart3,
  Bell,
  Boxes,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Menu,
  Minus,
  Package,
  ShieldCheck,
  Warehouse,
  X,
} from 'lucide-react';
import { LanguageSelect, useTranslation } from '../i18n';
import { Badge, MOTION_SPRING } from '../design-system';
import { useAuth } from '../features/auth';
import { RBAC_ROLE_MATRIX, ROLE_META, ROLE_ORDER } from '../features/users-rbac/rbacMatrix';
import type { RoleCode } from '../features/users-rbac/types';
import {
  AnimatedStatCounter,
  HeroAmbientDepth,
  MotionCtaWrapper,
  ScrollRevealBlock,
  StaggerGrid,
  StaggerItem,
} from './LandingMotion';
import {
  heroContainerVariants,
  heroFrameVariants,
  heroItemVariants,
  LANDING_EASE_OUT,
  LANDING_EASE_UI,
  splitLeadingMetric,
} from './landingMotionPrimitives';

type HeroWarehouseKey = 'ALL' | 'WH-01' | 'WH-02' | 'WH-03';

interface HeroWarehouseSnapshot {
  totalSkus: number;
  lowStock: number;
  pendingIn: number;
  cadenceBars: { inPct: number; outPct: number }[];
}

const HERO_WAREHOUSE_SNAPSHOTS: Record<HeroWarehouseKey, HeroWarehouseSnapshot> = {
  ALL: {
    totalSkus: 1420,
    lowStock: 5,
    pendingIn: 3,
    cadenceBars: [
      { inPct: 68, outPct: 44 },
      { inPct: 52, outPct: 60 },
      { inPct: 84, outPct: 48 },
      { inPct: 62, outPct: 52 },
      { inPct: 92, outPct: 64 },
      { inPct: 74, outPct: 56 },
      { inPct: 88, outPct: 42 },
    ],
  },
  'WH-01': {
    totalSkus: 640,
    lowStock: 2,
    pendingIn: 1,
    cadenceBars: [
      { inPct: 78, outPct: 38 },
      { inPct: 60, outPct: 54 },
      { inPct: 90, outPct: 46 },
      { inPct: 54, outPct: 48 },
      { inPct: 86, outPct: 58 },
      { inPct: 70, outPct: 52 },
      { inPct: 94, outPct: 40 },
    ],
  },
  'WH-02': {
    totalSkus: 480,
    lowStock: 2,
    pendingIn: 1,
    cadenceBars: [
      { inPct: 54, outPct: 46 },
      { inPct: 42, outPct: 66 },
      { inPct: 72, outPct: 52 },
      { inPct: 68, outPct: 58 },
      { inPct: 78, outPct: 62 },
      { inPct: 64, outPct: 48 },
      { inPct: 74, outPct: 44 },
    ],
  },
  'WH-03': {
    totalSkus: 300,
    lowStock: 1,
    pendingIn: 1,
    cadenceBars: [
      { inPct: 48, outPct: 32 },
      { inPct: 44, outPct: 40 },
      { inPct: 62, outPct: 36 },
      { inPct: 58, outPct: 42 },
      { inPct: 72, outPct: 48 },
      { inPct: 56, outPct: 38 },
      { inPct: 68, outPct: 30 },
    ],
  },
};

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { isMockMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewRole, setPreviewRole] = useState<RoleCode>('WAREHOUSE_MANAGER');
  const [heroWarehouse, setHeroWarehouse] = useState<HeroWarehouseKey>('ALL');

  useEffect(() => {
    document.title = `${t('layout.brandName')} — ${t('landing.footer.tagline')}`;
  }, [t]);

  const activeMatrix = RBAC_ROLE_MATRIX[previewRole];
  const activeSnapshot = HERO_WAREHOUSE_SNAPSHOTS[heroWarehouse];

  const heroMovements = [
    {
      trx: 'TRX-9481',
      sku: 'SKU-LOGI-M331',
      wh: 'WH-01' as const,
      delta: '+150',
      badge: t('landing.hero.badgeInbound'),
      variant: 'success' as const,
    },
    {
      trx: 'TRX-9480',
      sku: 'SKU-DELL-P2419',
      wh: 'WH-02' as const,
      delta: '-25',
      badge: t('landing.hero.badgeDispatch'),
      variant: 'info' as const,
    },
    {
      trx: 'TRX-9478',
      sku: 'SKU-SAMS-T7-1TB',
      wh: 'WH-01' as const,
      delta: '+2',
      badge: t('landing.hero.badgeAdjust'),
      variant: 'warning' as const,
    },
    {
      trx: 'TRX-9475',
      sku: 'SKU-SONY-WH1000',
      wh: 'WH-03' as const,
      delta: '+80',
      badge: t('landing.hero.badgeInbound'),
      variant: 'success' as const,
    },
  ];

  const visibleMovements =
    heroWarehouse === 'ALL'
      ? heroMovements.slice(0, 3)
      : heroMovements.filter((item) => item.wh === heroWarehouse);

  const secondaryFeatures = [
    {
      icon: Package,
      titleKey: 'landing.features.f3Title',
      descKey: 'landing.features.f3Desc',
      tint: 'bg-blue-50 text-[#2563EB]',
    },
    {
      icon: Bell,
      titleKey: 'landing.features.f4Title',
      descKey: 'landing.features.f4Desc',
      tint: 'bg-amber-50 text-[#D97706]',
    },
    {
      icon: ClipboardCheck,
      titleKey: 'landing.features.f5Title',
      descKey: 'landing.features.f5Desc',
      tint: 'bg-emerald-50 text-[#16A34A]',
    },
    {
      icon: BarChart3,
      titleKey: 'landing.features.f6Title',
      descKey: 'landing.features.f6Desc',
      tint: 'bg-slate-100 text-[#0F172A]',
    },
  ];

  const benefitPoints = [
    'landing.benefits.b1',
    'landing.benefits.b2',
    'landing.benefits.b3',
    'landing.benefits.b4',
    'landing.benefits.b5',
  ];

  const stat1Raw = t('landing.benefits.stat1');
  const stat2Raw = t('landing.benefits.stat2');
  const stat1Parts = splitLeadingMetric(stat1Raw);
  const stat2Parts = splitLeadingMetric(stat2Raw);

  const warehouseDistribution = [
    { code: 'WH-01', nameKey: 'landing.preview.wh1Name', pct: 45, skus: 640 },
    { code: 'WH-02', nameKey: 'landing.preview.wh2Name', pct: 34, skus: 480 },
    { code: 'WH-03', nameKey: 'landing.preview.wh3Name', pct: 21, skus: 300 },
  ];

  return (
      <div id="top" className="min-h-screen flex flex-col bg-[#F6F8FB] text-[#0F172A] font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] font-medium text-sm"
        >
          {t('layout.skipToContent')}
        </a>

        {/* Sticky Obsidian Header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#060911]/90 backdrop-blur-md text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
            <a
              href="#top"
              className="flex items-center gap-2 sm:gap-2.5 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] text-white flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
                <Boxes className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span translate="no" className="font-display font-bold text-sm text-white tracking-tight truncate">
                  {t('layout.brandName')}
                </span>
                <span className="hidden min-[360px]:block text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
                  {t('layout.brandSub')}
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
              aria-label={t('landing.nav.ariaLabel')}
            >
              <a href="#preview" className="landing-nav-link hover:text-white transition-colors duration-150 py-2">
                {t('landing.nav.preview')}
              </a>
              <a href="#features" className="landing-nav-link hover:text-white transition-colors duration-150 py-2">
                {t('landing.nav.features')}
              </a>
              <a href="#benefits" className="landing-nav-link hover:text-white transition-colors duration-150 py-2">
                {t('landing.nav.benefits')}
              </a>
              <a href="#roles" className="landing-nav-link hover:text-white transition-colors duration-150 py-2">
                {t('landing.nav.roles')}
              </a>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              <LanguageSelect id="landing-language" variant="dark" />

              <Link
                id="landing-nav-login"
                to="/login"
                className="inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] active:scale-[0.985] transition-[color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {t('landing.nav.signIn')}
              </Link>

              <Link
                id="landing-nav-register"
                to="/register"
                className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] hover:-translate-y-px active:translate-y-0 active:scale-[0.985] text-sm font-semibold text-white transition-[background-color,transform,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_20px_-6px_rgba(37,99,235,0.7)]"
              >
                {t('landing.nav.getStarted')}
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              <LanguageSelect id="landing-mobile-language" className="min-h-11 max-w-[118px] text-base sm:text-sm" variant="dark" />

              <button
                type="button"
                id="landing-mobile-menu-btn"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={t('topbar.openMenuAria')}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg border border-white/15 bg-white/[0.04] text-slate-200 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          <AnimatePresence initial={false}>
            {mobileMenuOpen && (
              <m.div
                key="landing-mobile-drawer"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: LANDING_EASE_UI }}
                className="md:hidden border-t border-white/10 bg-[#060911] px-4 py-4 space-y-2"
              >
                <nav className="flex flex-col space-y-1" aria-label={t('landing.nav.ariaLabel')}>
                  <a
                    href="#preview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.06] transition-colors"
                  >
                    {t('landing.nav.preview')}
                  </a>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.06] transition-colors"
                  >
                    {t('landing.nav.features')}
                  </a>
                  <a
                    href="#benefits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.06] transition-colors"
                  >
                    {t('landing.nav.benefits')}
                  </a>
                  <a
                    href="#roles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/[0.06] transition-colors"
                  >
                    {t('landing.nav.roles')}
                  </a>
                </nav>

                <div className="pt-3 border-t border-white/10 grid grid-cols-1 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center rounded-lg border border-white/15 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
                  >
                    {t('landing.nav.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-semibold text-white transition-colors"
                  >
                    {t('landing.nav.getStarted')}
                  </Link>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {/* SECTION 1: FULL-VIEWPORT OBSIDIAN STAGE HERO + INTERACTIVE WAREHOUSE CONSOLE */}
          <section className="relative overflow-hidden bg-[#060911] text-white min-h-[calc(100svh-4rem)] flex items-center">
            {/* Subtle Architectural Coordinate Dot Horizon */}
            <div
              className="pointer-events-none absolute inset-0 obsidian-dot-grid opacity-45"
              aria-hidden="true"
              style={{
                maskImage: 'radial-gradient(ellipse 80% 70% at 55% 40%, black 20%, transparent 100%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 80% 70% at 55% 40%, black 20%, transparent 100%)',
              }}
            />

            {/* Atmospheric Ocean-Blue & Sky Shader Glow (zero violet) */}
            <div
              className="pointer-events-none absolute inset-0 ambient-shader-glow"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(58% 52% at 76% 32%, rgba(37, 99, 235, 0.28), transparent 72%), radial-gradient(42% 45% at 14% 84%, rgba(14, 165, 233, 0.14), transparent 70%)',
              }}
            />

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Editorial Copy Column */}
                <m.div
                  className="lg:col-span-6 space-y-6"
                  variants={heroContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <m.h1
                    variants={heroItemVariants}
                    className="font-display text-4xl sm:text-5xl xl:text-[3.35rem] font-extrabold text-white tracking-[-0.03em] leading-[1.08] text-balance"
                  >
                    {t('landing.hero.headline')}
                  </m.h1>

                  <m.p
                    variants={heroItemVariants}
                    className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl"
                  >
                    {t('landing.hero.subCopy')}
                  </m.p>

                  <m.div
                    variants={heroItemVariants}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
                  >
                    <MotionCtaWrapper className="w-full sm:w-auto">
                      <Link
                        id="landing-hero-register"
                        to="/register"
                        className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto h-12 px-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-sm sm:text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_-8px_rgba(37,99,235,0.72)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB] group"
                      >
                        <span>{t('landing.hero.ctaPrimary')}</span>
                        <ArrowRight
                          className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </MotionCtaWrapper>

                    <MotionCtaWrapper className="w-full sm:w-auto">
                      <Link
                        id="landing-hero-login"
                        to="/login"
                        className="inline-flex items-center justify-center w-full sm:w-auto h-12 px-6 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/25 text-sm sm:text-base font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      >
                        {t('landing.hero.ctaSecondary')}
                      </Link>
                    </MotionCtaWrapper>
                  </m.div>

                  {/* Hairline Hard Facts Baseline */}
                  <m.dl
                    variants={heroItemVariants}
                    className="grid grid-cols-3 divide-x divide-white/10 pt-7 border-t border-white/10 max-w-lg"
                  >
                    <div className="pr-3">
                      <dt className="text-xs text-slate-400">{t('landing.hero.fact1Label')}</dt>
                      <dd className="font-display text-sm sm:text-base font-bold text-white mt-1 tabular-nums">
                        {t('landing.hero.fact1Value')}
                      </dd>
                    </div>
                    <div className="px-3 sm:px-5">
                      <dt className="text-xs text-slate-400">{t('landing.hero.fact2Label')}</dt>
                      <dd className="font-display text-sm sm:text-base font-bold text-white mt-1 tabular-nums">
                        {t('landing.hero.fact2Value')}
                      </dd>
                    </div>
                    <div className="pl-3 sm:pl-5">
                      <dt className="text-xs text-slate-400">{t('landing.hero.fact3Label')}</dt>
                      <dd className="font-display text-sm sm:text-base font-bold text-white mt-1 tabular-nums">
                        {t('landing.hero.fact3Value')}
                      </dd>
                    </div>
                  </m.dl>
                </m.div>

                {/* Right Interactive Warehouse Console */}
                <div className="lg:col-span-6 relative">
                  <HeroAmbientDepth />

                  <m.div
                    variants={heroFrameVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 rounded-2xl border border-white/15 bg-[#0B1220]/95 shadow-[0_32px_72px_-18px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden"
                  >
                    {/* Interactive Console Window Chrome & Warehouse Selector */}
                    <div className="px-4 py-3 bg-[#090E1A] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="relative flex w-2.5 h-2.5 shrink-0 items-center justify-center">
                          <span
                            className="absolute inset-0 rounded-full bg-emerald-400/75 live-beacon-ring"
                            aria-hidden="true"
                          />
                          <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-xs font-mono text-slate-300 truncate">
                          {t('landing.hero.frameTitle')}
                        </span>
                      </div>

                      <div
                        className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-900/90 border border-white/10"
                        role="group"
                        aria-label={t('landing.hero.fact2Label')}
                      >
                        {(['ALL', 'WH-01', 'WH-02', 'WH-03'] as HeroWarehouseKey[]).map((whKey) => {
                          const active = heroWarehouse === whKey;
                          return (
                            <button
                              key={whKey}
                              type="button"
                              onClick={() => setHeroWarehouse(whKey)}
                              aria-pressed={active}
                              className={`relative z-0 min-h-[32px] px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                                active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {active && (
                                <m.span
                                  layoutId="hero-warehouse-pill"
                                  className="absolute inset-0 rounded-md bg-[#2563EB] shadow-xs -z-10"
                                  transition={MOTION_SPRING.overshoot}
                                />
                              )}
                              <span translate={whKey === 'ALL' ? undefined : 'no'} className="relative z-10">
                                {whKey === 'ALL' ? t('landing.hero.allWarehouses') : whKey}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Animated Metrics Strip */}
                    <div className="grid grid-cols-3 divide-x divide-white/[0.08] border-b border-white/[0.08] bg-white/[0.02]">
                      <div className="p-3 sm:p-4">
                        <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                          {t('dashboard.kpi.totalSkusTitle')}
                        </p>
                        <p className="font-display text-lg sm:text-2xl font-bold text-white tabular-nums mt-1">
                          <AnimatedStatCounter
                            target={activeSnapshot.totalSkus}
                            trigger="mount"
                            duration={0.95}
                          />
                        </p>
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                          {t('dashboard.kpi.lowStockTitle')}
                        </p>
                        <p className="font-display text-lg sm:text-2xl font-bold text-amber-400 tabular-nums mt-1">
                          <AnimatedStatCounter
                            target={activeSnapshot.lowStock}
                            trigger="mount"
                            duration={0.65}
                            useLocaleGrouping={false}
                          />
                        </p>
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                          {t('dashboard.kpi.pendingInTitle')}
                        </p>
                        <p className="font-display text-lg sm:text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                          <AnimatedStatCounter
                            target={activeSnapshot.pendingIn}
                            trigger="mount"
                            duration={0.65}
                            useLocaleGrouping={false}
                          />
                        </p>
                      </div>
                    </div>

                    {/* 7-Day Inbound / Dispatch Cadence Spark Chart */}
                    <div className="px-4 py-3 border-b border-white/[0.08] bg-[#080D18]/80">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {t('landing.hero.throughputLabel')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {t('landing.hero.throughputMeta')}
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 items-end h-11" aria-hidden="true">
                        {activeSnapshot.cadenceBars.map((bar, idx) => (
                          <div key={idx} className="flex items-end justify-center gap-1 h-full">
                            <m.span
                              className="w-2 rounded-t-xs bg-[#2563EB]/90"
                              animate={{ height: `${bar.inPct}%` }}
                              transition={{ duration: 0.35, ease: LANDING_EASE_OUT }}
                            />
                            <m.span
                              className="w-2 rounded-t-xs bg-emerald-400/80"
                              animate={{ height: `${bar.outPct}%` }}
                              transition={{ duration: 0.35, delay: 0.03 * idx, ease: LANDING_EASE_OUT }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Ledger Preview Rows */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                        <span>{t('landing.hero.ledgerColTrx')}</span>
                        <span>{t('landing.hero.ledgerColQty')}</span>
                      </div>

                      {visibleMovements.map((row, idx) => (
                        <m.div
                          key={`${heroWarehouse}-${row.trx}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.32,
                            delay: 0.1 + idx * 0.06,
                            ease: LANDING_EASE_OUT,
                          }}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-colors duration-150"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-white">
                                {row.trx}
                              </span>
                              <Badge variant={row.variant} size="sm">
                                {row.badge}
                              </Badge>
                            </div>
                            <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                              {row.sku} · {row.wh}
                            </p>
                          </div>

                          <span
                            className={`font-mono text-sm font-semibold tabular-nums shrink-0 ${
                              row.delta.startsWith('+') ? 'text-emerald-400' : 'text-sky-400'
                            }`}
                          >
                            {row.delta}
                          </span>
                        </m.div>
                      ))}
                    </div>
                  </m.div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: PRECISION APP-FRAME PREVIEW (Porcelain Ground) */}
          <section id="preview" className="scroll-mt-16 bg-white py-20 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <ScrollRevealBlock className="max-w-2xl space-y-3">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-[-0.025em] text-balance">
                  {t('landing.preview.title')}
                </h2>
                <p className="text-base text-[#475569] leading-relaxed">
                  {t('landing.preview.subtitle')}
                </p>
              </ScrollRevealBlock>

              {/* Elevated SaaS Product Frame */}
              <ScrollRevealBlock delay={0.05}>
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_64px_-22px_rgba(15,23,42,0.14)] overflow-hidden">
                  {/* Window Top Control Strip */}
                  <div className="px-4 sm:px-6 py-3.5 bg-[#F8FAFC] border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0" aria-hidden="true">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                        <span className="text-xs font-semibold text-[#0F172A] truncate">
                          {t('landing.preview.roleSwitchLabel')}
                        </span>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 w-full sm:w-auto"
                      role="tablist"
                    >
                      {ROLE_ORDER.map((roleCode) => {
                        const isSelected = previewRole === roleCode;
                        return (
                          <button
                            key={roleCode}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => setPreviewRole(roleCode)}
                            className={`relative z-0 min-h-[40px] px-3.5 py-1 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                              isSelected ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]'
                            }`}
                          >
                            {isSelected && (
                              <m.span
                                layoutId="landing-role-active-pill"
                                className="absolute inset-0 rounded-lg bg-[#2563EB] shadow-xs -z-10"
                                transition={MOTION_SPRING.tab}
                              />
                            )}
                            <span className="relative z-10">{t(`topbar.roleShort.${roleCode}`)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Workspace Split */}
                  <m.div
                    key={previewRole}
                    initial={{ opacity: 0.65, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: LANDING_EASE_OUT }}
                    className="grid grid-cols-1 lg:grid-cols-12"
                  >
                    {/* Left Permissions Inspector Rail */}
                    <div className="lg:col-span-4 bg-[#FAFBFD] border-b lg:border-b-0 lg:border-r border-slate-200/80 p-6 space-y-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                          {t('landing.preview.permissionsLabel')}
                        </span>
                        <Badge variant={ROLE_META[previewRole].badgeVariant} size="sm">
                          {activeMatrix.allowedNavKeys.length} {t('landing.preview.modulesUnit')}
                        </Badge>
                      </div>

                      <p className="text-xs text-[#475569] leading-relaxed">
                        {t(ROLE_META[previewRole].scopeNoteKey)}
                      </p>

                      <div className="divide-y divide-slate-200/70">
                        {[
                          {
                            label: t('landing.preview.capCreateStock'),
                            allowed: activeMatrix.canCreateStockOrder,
                          },
                          {
                            label: t('landing.preview.capApproveStock'),
                            allowed: activeMatrix.canApproveStockOrder,
                          },
                          {
                            label: t('landing.preview.capManageCatalog'),
                            allowed: activeMatrix.canManageCatalog,
                          },
                          {
                            label: t('landing.preview.capManageUsers'),
                            allowed: activeMatrix.canManageUsers,
                          },
                        ].map((cap) => (
                          <div
                            key={cap.label}
                            className="flex items-center justify-between gap-2 text-xs py-2.5"
                          >
                            <span className="text-[#334155] font-medium">{cap.label}</span>
                            <Badge variant={cap.allowed ? 'success' : 'neutral'} size="sm">
                              {cap.allowed
                                ? t('landing.preview.allowed')
                                : t('landing.preview.restricted')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Warehouse Voucher Queue */}
                    <div className="lg:col-span-8 p-6 sm:p-7 space-y-5 bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-display text-base font-bold text-[#0F172A]">
                            {t('landing.preview.ledgerTitle')}
                          </h3>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {t('landing.preview.ledgerSub')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {activeMatrix.canCreateStockOrder && (
                            <Link
                              to="/register"
                              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" aria-hidden="true" />
                              {t('landing.preview.createVoucherBtn')}
                            </Link>
                          )}
                          {activeMatrix.isReadOnly && (
                            <Badge variant="neutral" size="sm">
                              {t('common.readOnly')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#475569] uppercase tracking-wider text-[11px]">
                              <th className="py-3 px-4 font-semibold">{t('landing.preview.colVoucher')}</th>
                              <th className="py-3 px-4 font-semibold">{t('landing.preview.colWarehouse')}</th>
                              <th className="py-3 px-4 font-semibold">{t('landing.preview.colState')}</th>
                              <th className="py-3 px-4 font-semibold text-right">
                                {t('landing.preview.colAction')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A]">
                                IN-2026-089
                              </td>
                              <td className="py-3.5 px-4 text-[#334155]">
                                WH-01 · {t('landing.preview.wh1Name')}
                              </td>
                              <td className="py-3.5 px-4">
                                <Badge variant="warning" size="sm">
                                  {t('status.submitted')}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {activeMatrix.canApproveStockOrder ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                    {t('landing.preview.canApprove')}
                                  </span>
                                ) : (
                                  <span className="text-[#64748B]">{t('landing.preview.viewOnly')}</span>
                                )}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A]">
                                OUT-2026-042
                              </td>
                              <td className="py-3.5 px-4 text-[#334155]">
                                WH-02 · {t('landing.preview.wh2Name')}
                              </td>
                              <td className="py-3.5 px-4">
                                <Badge variant="success" size="sm">
                                  {t('status.approved')}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="text-[#64748B]">{t('landing.preview.viewOnly')}</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A]">
                                STK-2026-Q4-01
                              </td>
                              <td className="py-3.5 px-4 text-[#334155]">
                                WH-03 · {t('landing.preview.wh3Name')}
                              </td>
                              <td className="py-3.5 px-4">
                                <Badge variant="info" size="sm">
                                  {t('status.completed')}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="text-[#64748B]">{t('landing.preview.viewOnly')}</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </m.div>
                </div>
              </ScrollRevealBlock>
            </div>
          </section>

          {/* SECTION 3: ASYMMETRIC BENTO + ARCHITECTURAL DIAGRAM GRID (Soft Porcelain Ground) */}
          <section id="features" className="scroll-mt-16 bg-[#F6F8FB] py-20 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <ScrollRevealBlock className="max-w-2xl space-y-3">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-[-0.025em] text-balance">
                  {t('landing.features.title')}
                </h2>
                <p className="text-base text-[#475569] leading-relaxed">
                  {t('landing.features.subtitle')}
                </p>
              </ScrollRevealBlock>

              {/* Asymmetric 7+5 Highlight Row (Light Workflow Diagram + Obsidian Warehouse Panel) */}
              <StaggerGrid className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <StaggerItem className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 landing-card-hover group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                        <ArrowUpFromLine className="w-5 h-5" />
                      </div>
                      <Badge variant="info" size="sm">
                        {t('landing.features.pillar1Badge')}
                      </Badge>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A]">
                      {t('landing.features.f1Title')}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {t('landing.features.f1Desc')}
                    </p>
                  </div>

                  {/* Architectural State Pipeline & Guard Matrix */}
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[#334155] font-semibold text-center">
                        01 · {t('landing.features.stepDraft')}
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[#B45309] font-semibold text-center">
                        02 · {t('landing.features.stepSubmitted')}
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[#15803D] font-semibold text-center">
                        03 · {t('landing.features.stepApproved')}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#475569]">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white border border-slate-200/70">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span>{t('landing.features.guardRule1')}</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white border border-slate-200/70">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span>{t('landing.features.guardRule2')}</span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem className="lg:col-span-5 bg-[#0B1220] text-white border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-lg landing-card-hover group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {t('landing.features.pillar2Badge')}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {t('landing.features.f2Title')}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {t('landing.features.f2Desc')}
                    </p>
                  </div>

                  {/* Facility Balance Allocation Meter */}
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {t('landing.features.whDistLabel')}
                    </div>
                    {warehouseDistribution.map((wh) => (
                      <div key={wh.code} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-200">
                            {wh.code} · {t(wh.nameKey)}
                          </span>
                          <span className="font-mono text-sky-400 tabular-nums">{wh.skus} SKUs</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-sky-400"
                            style={{ width: `${wh.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </StaggerItem>
              </StaggerGrid>

              {/* Unified 4-Column Architectural Rail (hairline dividers instead of floating cards) */}
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200/90 bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden shadow-xs">
                {secondaryFeatures.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <StaggerItem
                      key={item.titleKey}
                      className="p-6 space-y-3 hover:bg-[#FAFBFD] transition-colors duration-150 group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-105 ${item.tint}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-base font-bold text-[#0F172A]">
                        {t(item.titleKey)}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                        {t(item.descKey)}
                      </p>
                    </StaggerItem>
                  );
                })}
              </StaggerGrid>
            </div>
          </section>

          {/* SECTION 4: EDITORIAL BENEFITS & ANIMATED TELEMETRY METRICS (Porcelain Ground) */}
          <section id="benefits" className="scroll-mt-16 bg-white py-20 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <ScrollRevealBlock className="lg:col-span-5 space-y-5">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-[-0.025em] text-balance">
                    {t('landing.benefits.title')}
                  </h2>
                  <p className="text-base text-[#475569] leading-relaxed">
                    {t('landing.benefits.subtitle')}
                  </p>

                  <dl className="grid grid-cols-2 gap-4 pt-3">
                    <div className="p-5 rounded-2xl bg-[#0B1220] text-white border border-slate-800">
                      <dt className="text-xs text-slate-400">{t('landing.benefits.stat1Label')}</dt>
                      <dd className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
                        {stat1Parts ? (
                          <AnimatedStatCounter
                            target={stat1Parts.target}
                            suffix={stat1Parts.suffix}
                            trigger="inView"
                            useLocaleGrouping={false}
                          />
                        ) : (
                          stat1Raw
                        )}
                      </dd>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#F6F8FB] border border-slate-200/90">
                      <dt className="text-xs text-[#475569]">{t('landing.benefits.stat2Label')}</dt>
                      <dd className="font-display text-2xl sm:text-3xl font-extrabold text-[#2563EB] mt-1.5">
                        {stat2Parts ? (
                          <AnimatedStatCounter
                            target={stat2Parts.target}
                            suffix={stat2Parts.suffix}
                            trigger="inView"
                            useLocaleGrouping={false}
                          />
                        ) : (
                          stat2Raw
                        )}
                      </dd>
                    </div>
                  </dl>
                </ScrollRevealBlock>

                {/* Clean Horizontal Hairline Ledger */}
                <StaggerGrid className="lg:col-span-7 divide-y divide-slate-200 border-y border-slate-200">
                  {benefitPoints.map((pointKey, idx) => (
                    <StaggerItem
                      key={pointKey}
                      className="flex items-start gap-4 py-4 px-2 sm:px-3 hover:bg-[#F8FAFC] transition-colors duration-150"
                    >
                      <span className="font-mono text-xs font-semibold text-[#64748B] pt-1 shrink-0 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-sm sm:text-base text-[#0F172A] font-medium leading-relaxed">
                        {t(pointKey)}
                      </p>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </div>
            </div>
          </section>

          {/* SECTION 5: RBAC ACCESS MATRIX CARDS (Soft Porcelain Ground, no kicker above H2) */}
          <section id="roles" className="scroll-mt-16 bg-[#F6F8FB] py-20 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <ScrollRevealBlock className="max-w-2xl space-y-3">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-[-0.025em] text-balance">
                  {t('landing.roles.title')}
                </h2>
                <p className="text-base text-[#475569] leading-relaxed">
                  {t('landing.roles.subtitle')}
                </p>
              </ScrollRevealBlock>

              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {ROLE_ORDER.map((roleCode) => {
                  const roleMeta = ROLE_META[roleCode];
                  const matrix = RBAC_ROLE_MATRIX[roleCode];
                  const coveragePct = Math.round((matrix.allowedNavKeys.length / 14) * 100);
                  const capabilities = [
                    { label: t('landing.roles.capCreate'), ok: matrix.canCreateStockOrder },
                    { label: t('landing.roles.capApprove'), ok: matrix.canApproveStockOrder },
                    { label: t('landing.roles.capCatalog'), ok: matrix.canManageCatalog },
                    { label: t('landing.roles.capAdmin'), ok: matrix.canManageUsers },
                  ];

                  return (
                    <StaggerItem
                      key={roleCode}
                      className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-5 landing-card-hover group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={roleMeta.badgeVariant} size="sm">
                            {t(`topbar.roleShort.${roleCode}`)}
                          </Badge>
                          <span className="text-xs font-mono font-semibold text-[#475569] tabular-nums">
                            {matrix.allowedNavKeys.length} {t('landing.preview.modulesUnit')}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-display text-lg font-bold text-[#0F172A]">
                            {t(roleMeta.labelKey)}
                          </h3>
                          <p className="text-xs text-[#475569] leading-relaxed mt-1.5">
                            {t(roleMeta.scopeNoteKey)}
                          </p>
                        </div>

                        {/* Visual Coverage Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                            <span>{t('landing.roles.coverageLabel')}</span>
                            <span className="font-mono tabular-nums">{coveragePct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#2563EB]"
                              style={{ width: `${coveragePct}%` }}
                            />
                          </div>
                        </div>

                        {/* Compact Capability Matrix */}
                        <ul className="space-y-1.5 pt-1">
                          {capabilities.map((cap) => (
                            <li
                              key={cap.label}
                              className={`flex items-center gap-2 text-xs ${
                                cap.ok ? 'text-[#0F172A] font-medium' : 'text-[#64748B]'
                              }`}
                            >
                              {cap.ok ? (
                                <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" aria-hidden="true" />
                              ) : (
                                <Minus className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" aria-hidden="true" />
                              )}
                              <span>{cap.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        to={isMockMode ? '/login' : '/register'}
                        className="inline-flex items-center gap-1.5 min-h-[36px] text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] pt-3 border-t border-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded group/link"
                      >
                        <span className="landing-nav-link">
                          {t(isMockMode ? 'landing.roles.tryAccount' : 'landing.roles.startWithRole')}
                        </span>
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerGrid>
            </div>
          </section>

          {/* SECTION 6: UNIFIED OBSIDIAN CLOSING STAGE & FOOTER */}
          <section className="relative overflow-hidden bg-[#060911] text-white py-20 sm:py-24">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(55% 65% at 50% 0%, rgba(37, 99, 235, 0.2), transparent 72%)',
              }}
            />
            <ScrollRevealBlock className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-[-0.025em] text-balance">
                {t('landing.cta.title')}
              </h2>
              <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                {t(isMockMode ? 'landing.cta.subtitle' : 'landing.cta.subtitleProd')}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
                <MotionCtaWrapper className="w-full sm:w-auto">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto h-12 px-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-sm sm:text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_-8px_rgba(37,99,235,0.72)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB] group"
                  >
                    <span>{t('landing.cta.button')}</span>
                    <ArrowRight
                      className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </MotionCtaWrapper>
                <MotionCtaWrapper className="w-full sm:w-auto">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full sm:w-auto h-12 px-6 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/25 text-sm sm:text-base font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    {t('landing.nav.signIn')}
                  </Link>
                </MotionCtaWrapper>
              </div>
            </ScrollRevealBlock>
          </section>
        </main>

        {/* Unified Obsidian Footer */}
        <footer className="bg-[#060911] text-slate-400 border-t border-white/[0.08] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-display font-semibold text-sm">
                <Boxes className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                <span>{t('landing.footer.tagline')}</span>
              </div>
              <p className="text-xs text-slate-400">
                {t(isMockMode ? 'landing.footer.copyright' : 'landing.footer.copyrightProd')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
              <a href="#preview" className="landing-nav-link hover:text-white transition-colors py-1">
                {t('landing.nav.preview')}
              </a>
              <a href="#features" className="landing-nav-link hover:text-white transition-colors py-1">
                {t('landing.footer.links.features')}
              </a>
              <Link to="/login" className="landing-nav-link hover:text-white transition-colors py-1">
                {t('landing.footer.links.signIn')}
              </Link>
              <Link to="/register" className="landing-nav-link hover:text-white transition-colors py-1">
                {t('landing.footer.links.register')}
              </Link>
            </div>
          </div>
        </footer>
      </div>
  );
};
