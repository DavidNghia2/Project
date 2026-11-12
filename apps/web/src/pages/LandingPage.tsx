import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  Menu,
  Package,
  ShieldCheck,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { Badge, Button } from '../design-system';
import { RBAC_ROLE_MATRIX, ROLE_META, ROLE_ORDER } from '../features/users-rbac/rbacMatrix';
import type { RoleCode } from '../features/users-rbac/types';
import {
  AnimatedStatCounter,
  HeroAmbientDepth,
  LandingMotionRoot,
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

export const LandingPage: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewRole, setPreviewRole] = useState<RoleCode>('WAREHOUSE_MANAGER');

  const activeMatrix = RBAC_ROLE_MATRIX[previewRole];

  const heroMovements = [
    {
      trx: 'TRX-9481',
      sku: 'SKU-LOGI-M331',
      wh: 'WH-01',
      delta: '+150',
      badge: t('landing.hero.badgeInbound'),
      variant: 'success' as const,
    },
    {
      trx: 'TRX-9480',
      sku: 'SKU-DELL-P2419',
      wh: 'WH-02',
      delta: '-25',
      badge: t('landing.hero.badgeDispatch'),
      variant: 'info' as const,
    },
    {
      trx: 'TRX-9478',
      sku: 'SKU-SAMS-T7-1TB',
      wh: 'WH-01',
      delta: '+2',
      badge: t('landing.hero.badgeAdjust'),
      variant: 'warning' as const,
    },
  ];

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

  return (
    <LandingMotionRoot>
      <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0F172A]/95 backdrop-blur-sm text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <a
              href="#top"
              className="flex items-center gap-2.5 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-semibold text-sm text-white tracking-tight truncate">
                  {t('layout.brandName')}
                </span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
                  {t('layout.brandSub')}
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
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
              <button
                type="button"
                id="landing-lang-toggle"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-md border border-slate-700 bg-slate-900/80 hover:bg-slate-800 active:scale-[0.985] text-xs font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-150 cursor-pointer"
                title={t('demo.switch_lang')}
                aria-label={t('demo.switch_lang')}
              >
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="uppercase">{language}</span>
              </button>

              <Link
                id="landing-nav-login"
                to="/login"
                className="inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 active:scale-[0.985] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {t('landing.nav.signIn')}
              </Link>

              <Link
                id="landing-nav-register"
                to="/register"
                className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] hover:-translate-y-px active:translate-y-0 active:scale-[0.985] text-sm font-medium text-white transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-sm"
              >
                {t('landing.nav.getStarted')}
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <button
                type="button"
                id="landing-mobile-lang-toggle"
                onClick={toggleLanguage}
                className="inline-flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-2.5 rounded-md border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
                aria-label={t('demo.switch_lang')}
              >
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="uppercase">{language}</span>
              </button>

              <button
                type="button"
                id="landing-mobile-menu-btn"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={t('topbar.openMenuAria')}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer with smooth height/opacity entrance & exit */}
          <AnimatePresence initial={false}>
            {mobileMenuOpen && (
              <m.div
                key="landing-mobile-drawer"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: LANDING_EASE_UI }}
                className="md:hidden border-t border-slate-800 bg-[#0F172A] px-4 py-4 space-y-2"
              >
                <nav className="flex flex-col space-y-1" aria-label={t('landing.nav.ariaLabel')}>
                  <a
                    href="#preview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    {t('landing.nav.preview')}
                  </a>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    {t('landing.nav.features')}
                  </a>
                  <a
                    href="#benefits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    {t('landing.nav.benefits')}
                  </a>
                  <a
                    href="#roles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center px-3 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    {t('landing.nav.roles')}
                  </a>
                </nav>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-1 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center rounded-md border border-slate-700 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                  >
                    {t('landing.nav.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-medium text-white transition-colors"
                  >
                    {t('landing.nav.getStarted')}
                  </Link>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </header>

        <main className="flex-1">
          {/* SECTION 1: HERO (Software SaaS Dark Stage) */}
          <section className="relative overflow-hidden bg-[#0F172A] text-white border-b border-slate-800">
            {/* Atmospheric shader-inspired CSS radial glow */}
            <div
              className="pointer-events-none absolute inset-0 ambient-shader-glow"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(60% 55% at 74% 28%, rgba(37, 99, 235, 0.24), transparent 72%), radial-gradient(40% 40% at 15% 85%, rgba(14, 165, 233, 0.13), transparent 70%)',
              }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Copy Column with purposeful staggered fade-in & slide-up */}
                <m.div
                  className="lg:col-span-6 space-y-6"
                  variants={heroContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <m.h1
                    variants={heroItemVariants}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-[-0.03em] leading-[1.12]"
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
                      <Link id="landing-hero-register" to="/register" className="block w-full sm:w-auto group">
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          iconRight={
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                          }
                        >
                          {t('landing.hero.ctaPrimary')}
                        </Button>
                      </Link>
                    </MotionCtaWrapper>

                    <MotionCtaWrapper className="w-full sm:w-auto">
                      <Link id="landing-hero-login" to="/login" className="block w-full sm:w-auto">
                        <button
                          type="button"
                          className="w-full sm:w-auto h-11 px-5 rounded-md border border-slate-600 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-500 text-sm sm:text-base font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
                        >
                          {t('landing.hero.ctaSecondary')}
                        </button>
                      </Link>
                    </MotionCtaWrapper>
                  </m.div>

                  {/* Hard Facts Bar */}
                  <m.dl
                    variants={heroItemVariants}
                    className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 max-w-lg"
                  >
                    <div>
                      <dt className="text-xs text-slate-400">{t('landing.hero.fact1Label')}</dt>
                      <dd className="text-sm sm:text-base font-semibold text-white mt-0.5 tabular-nums">
                        {t('landing.hero.fact1Value')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">{t('landing.hero.fact2Label')}</dt>
                      <dd className="text-sm sm:text-base font-semibold text-white mt-0.5 tabular-nums">
                        {t('landing.hero.fact2Value')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">{t('landing.hero.fact3Label')}</dt>
                      <dd className="text-sm sm:text-base font-semibold text-white mt-0.5 tabular-nums">
                        {t('landing.hero.fact3Value')}
                      </dd>
                    </div>
                  </m.dl>
                </m.div>

                {/* Right Live System Frame Column with subtle floating architectural depth */}
                <div className="lg:col-span-6 relative">
                  <HeroAmbientDepth />

                  <m.div
                    variants={heroFrameVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 rounded-xl border border-slate-700/90 bg-[#0B1220] shadow-2xl overflow-hidden"
                  >
                    {/* Window Header */}
                    <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2">
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
                      <span className="text-[11px] font-mono text-blue-400 bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 rounded shrink-0">
                        WH-01 · WH-02 · WH-03
                      </span>
                    </div>

                    {/* Frame Metrics Strip with smooth count-up */}
                    <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 bg-slate-900/50">
                      <div className="p-3.5 sm:p-4">
                        <p className="text-[11px] text-slate-400 truncate">
                          {t('dashboard.kpi.totalSkusTitle')}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-white tabular-nums mt-1">
                          <AnimatedStatCounter target={1420} trigger="mount" duration={0.95} />
                        </p>
                      </div>
                      <div className="p-3.5 sm:p-4">
                        <p className="text-[11px] text-slate-400 truncate">
                          {t('dashboard.kpi.lowStockTitle')}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-amber-400 tabular-nums mt-1">
                          <AnimatedStatCounter
                            target={5}
                            trigger="mount"
                            duration={0.65}
                            useLocaleGrouping={false}
                          />
                        </p>
                      </div>
                      <div className="p-3.5 sm:p-4">
                        <p className="text-[11px] text-slate-400 truncate">
                          {t('dashboard.kpi.pendingInTitle')}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums mt-1">
                          <AnimatedStatCounter
                            target={3}
                            trigger="mount"
                            duration={0.65}
                            useLocaleGrouping={false}
                          />
                        </p>
                      </div>
                    </div>

                    {/* Live Ledger Preview Rows */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                        <span>{t('landing.hero.ledgerColTrx')}</span>
                        <span>{t('landing.hero.ledgerColQty')}</span>
                      </div>

                      {heroMovements.map((row, idx) => (
                        <m.div
                          key={row.trx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.24 + idx * 0.08,
                            ease: LANDING_EASE_OUT,
                          }}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-colors duration-150"
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
                              row.delta.startsWith('+') ? 'text-emerald-400' : 'text-blue-400'
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

          {/* SECTION 2: INTERACTIVE APP-FRAME PREVIEW (Persuade: Show the real product) */}
          <section id="preview" className="bg-white border-b border-[#E2E8F0] py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <ScrollRevealBlock className="max-w-2xl space-y-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  {t('landing.preview.title')}
                </h2>
                <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                  {t('landing.preview.subtitle')}
                </p>
              </ScrollRevealBlock>

              {/* Interactive Application Frame */}
              <ScrollRevealBlock delay={0.06}>
                <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] shadow-lg overflow-hidden">
                  {/* Role Switcher Bar inside Preview with shared-element sliding indicator */}
                  <div className="px-4 sm:px-6 py-3 bg-white border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {t('landing.preview.roleSwitchLabel')}
                      </span>
                    </div>

                    <div
                      className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]"
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
                            className={`relative z-0 min-h-[34px] px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                              isSelected ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]'
                            }`}
                          >
                            {isSelected && (
                              <m.span
                                layoutId="landing-role-active-pill"
                                className="absolute inset-0 rounded-md bg-[#2563EB] shadow-xs -z-10"
                                transition={{ duration: 0.22, ease: LANDING_EASE_UI }}
                              />
                            )}
                            <span className="relative z-10">{t(`topbar.roleShort.${roleCode}`)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Split Workspace Mock with crisp state transition */}
                  <m.div
                    key={previewRole}
                    initial={{ opacity: 0.55, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: LANDING_EASE_OUT }}
                    className="grid grid-cols-1 lg:grid-cols-12"
                  >
                    {/* Simulated Sidebar Summary */}
                    <div className="lg:col-span-4 bg-white border-b lg:border-b-0 lg:border-r border-[#E2E8F0] p-5 space-y-4">
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

                      <div className="space-y-2 pt-1">
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
                            className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-[#F1F5F9] last:border-0"
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

                    {/* Simulated Warehouse Voucher Ledger */}
                    <div className="lg:col-span-8 p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-[#0F172A]">
                            {t('landing.preview.ledgerTitle')}
                          </h3>
                          <p className="text-xs text-[#64748B]">{t('landing.preview.ledgerSub')}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeMatrix.canCreateStockOrder && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2563EB] text-white text-xs font-medium shadow-xs">
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                              {t('landing.preview.createVoucherBtn')}
                            </span>
                          )}
                          {activeMatrix.isReadOnly && (
                            <Badge variant="neutral" size="sm">
                              {t('common.readOnly')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase tracking-wider text-[11px]">
                              <th className="py-2.5 px-3 font-semibold">{t('landing.preview.colVoucher')}</th>
                              <th className="py-2.5 px-3 font-semibold">{t('landing.preview.colWarehouse')}</th>
                              <th className="py-2.5 px-3 font-semibold">{t('landing.preview.colState')}</th>
                              <th className="py-2.5 px-3 font-semibold text-right">
                                {t('landing.preview.colAction')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F1F5F9]">
                            <tr>
                              <td className="py-3 px-3 font-mono font-semibold text-[#0F172A]">
                                IN-2026-089
                              </td>
                              <td className="py-3 px-3 text-[#334155]">WH-01 · {t('landing.preview.wh1Name')}</td>
                              <td className="py-3 px-3">
                                <Badge variant="warning" size="sm">
                                  {t('status.submitted')}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                {activeMatrix.canApproveStockOrder ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                    {t('landing.preview.canApprove')}
                                  </span>
                                ) : (
                                  <span className="text-[#64748B]">{t('landing.preview.viewOnly')}</span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-3 font-mono font-semibold text-[#0F172A]">
                                OUT-2026-042
                              </td>
                              <td className="py-3 px-3 text-[#334155]">WH-02 · {t('landing.preview.wh2Name')}</td>
                              <td className="py-3 px-3">
                                <Badge variant="success" size="sm">
                                  {t('status.approved')}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className="text-[#64748B]">{t('landing.preview.viewOnly')}</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-3 font-mono font-semibold text-[#0F172A]">
                                STK-2026-Q4-01
                              </td>
                              <td className="py-3 px-3 text-[#334155]">WH-03 · {t('landing.preview.wh3Name')}</td>
                              <td className="py-3 px-3">
                                <Badge variant="info" size="sm">
                                  {t('status.completed')}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-right">
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

          {/* SECTION 3: CORE CAPABILITIES (Staggered Feature Cards) */}
          <section id="features" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <ScrollRevealBlock className="max-w-2xl space-y-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  {t('landing.features.title')}
                </h2>
                <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                  {t('landing.features.subtitle')}
                </p>
              </ScrollRevealBlock>

              {/* Row 1: Two primary workflow pillars */}
              <StaggerGrid className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StaggerItem className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-7 space-y-4 landing-card-hover group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                      <ArrowUpFromLine className="w-5 h-5" />
                    </div>
                    <Badge variant="info" size="sm">
                      {t('landing.features.pillar1Badge')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">
                    {t('landing.features.f1Title')}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {t('landing.features.f1Desc')}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-[#334155]">
                    <span className="px-2.5 py-1 rounded bg-[#F1F5F9]">
                      {t('landing.features.stepDraft')}
                    </span>
                    <span className="text-[#94A3B8]">-&gt;</span>
                    <span className="px-2.5 py-1 rounded bg-amber-50 text-[#D97706]">
                      {t('landing.features.stepSubmitted')}
                    </span>
                    <span className="text-[#94A3B8]">-&gt;</span>
                    <span className="px-2.5 py-1 rounded bg-emerald-50 text-[#16A34A]">
                      {t('landing.features.stepApproved')}
                    </span>
                  </div>
                </StaggerItem>

                <StaggerItem className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-7 space-y-4 landing-card-hover group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <Badge variant="success" size="sm">
                      {t('landing.features.pillar2Badge')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">
                    {t('landing.features.f2Title')}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {t('landing.features.f2Desc')}
                  </p>
                  <div className="pt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="px-2.5 py-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] font-mono">
                      WH-01
                    </div>
                    <div className="px-2.5 py-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] font-mono">
                      WH-02
                    </div>
                    <div className="px-2.5 py-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] font-mono">
                      WH-03
                    </div>
                  </div>
                </StaggerItem>
              </StaggerGrid>

              {/* Row 2: Four supporting operational modules staggered cleanly */}
              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {secondaryFeatures.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <StaggerItem
                      key={item.titleKey}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 landing-card-hover group"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-150 group-hover:scale-105 ${item.tint}`}
                      >
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-base font-semibold text-[#0F172A]">{t(item.titleKey)}</h3>
                      <p className="text-xs text-[#475569] leading-relaxed">{t(item.descKey)}</p>
                    </StaggerItem>
                  );
                })}
              </StaggerGrid>
            </div>
          </section>

          {/* SECTION 4: OPERATIONAL BENEFITS with Animated Proof Counters */}
          <section id="benefits" className="bg-white border-b border-[#E2E8F0] py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <ScrollRevealBlock className="lg:col-span-5 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                    {t('landing.benefits.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                    {t('landing.benefits.subtitle')}
                  </p>

                  <dl className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <dt className="text-xs text-[#64748B]">{t('landing.benefits.stat1Label')}</dt>
                      <dd className="text-xl font-bold text-[#0F172A] mt-1">
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
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <dt className="text-xs text-[#64748B]">{t('landing.benefits.stat2Label')}</dt>
                      <dd className="text-xl font-bold text-[#0F172A] mt-1">
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

                <StaggerGrid className="lg:col-span-7 space-y-3">
                  {benefitPoints.map((pointKey) => (
                    <StaggerItem
                      key={pointKey}
                      className="flex items-start gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] landing-card-hover"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#0F172A] font-medium leading-relaxed">
                        {t(pointKey)}
                      </p>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </div>
            </div>
          </section>

          {/* SECTION 5: ROLE-BASED ACCESS CONTROL OVERVIEW */}
          <section id="roles" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <ScrollRevealBlock className="max-w-2xl space-y-2.5">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
                  <Users className="w-4 h-4" />
                  <span>{t('landing.roles.kicker')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  {t('landing.roles.title')}
                </h2>
                <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                  {t('landing.roles.subtitle')}
                </p>
              </ScrollRevealBlock>

              <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {ROLE_ORDER.map((roleCode) => {
                  const roleMeta = ROLE_META[roleCode];
                  const matrix = RBAC_ROLE_MATRIX[roleCode];
                  return (
                    <StaggerItem
                      key={roleCode}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between gap-4 landing-card-hover group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={roleMeta.badgeVariant} size="sm">
                            {t(`topbar.roleShort.${roleCode}`)}
                          </Badge>
                          <span className="text-[11px] font-mono text-[#64748B] tabular-nums">
                            {matrix.allowedNavKeys.length} {t('landing.preview.modulesUnit')}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-[#0F172A]">
                          {t(roleMeta.labelKey)}
                        </h3>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          {t(roleMeta.scopeNoteKey)}
                        </p>
                      </div>

                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] pt-2 border-t border-[#F1F5F9] group/link"
                      >
                        <span className="landing-nav-link">{t('landing.roles.tryAccount')}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5" />
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerGrid>
            </div>
          </section>

          {/* SECTION 6: CLOSING CALL TO ACTION */}
          <section className="relative overflow-hidden bg-[#0F172A] text-white py-16 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(50% 60% at 50% 0%, rgba(37, 99, 235, 0.16), transparent 72%)',
              }}
            />
            <ScrollRevealBlock className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t('landing.cta.title')}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                {t('landing.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
                <MotionCtaWrapper className="w-full sm:w-auto">
                  <Link to="/register" className="block w-full sm:w-auto group">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      iconRight={
                        <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                      }
                    >
                      {t('landing.cta.button')}
                    </Button>
                  </Link>
                </MotionCtaWrapper>
                <MotionCtaWrapper className="w-full sm:w-auto">
                  <Link to="/login" className="block w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto h-11 px-5 rounded-md border border-slate-600 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-500 text-sm sm:text-base font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
                    >
                      {t('landing.nav.signIn')}
                    </button>
                  </Link>
                </MotionCtaWrapper>
              </div>
            </ScrollRevealBlock>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Boxes className="w-4 h-4 text-[#2563EB]" />
                <span>{t('landing.footer.tagline')}</span>
              </div>
              <p className="text-xs text-slate-400">{t('landing.footer.copyright')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
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
    </LandingMotionRoot>
  );
};
