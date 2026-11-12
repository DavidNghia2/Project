import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'motion/react';
import {
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  ClipboardCheck,
  Globe,
  Menu,
  PackageCheck,
  ShieldCheck,
  Warehouse,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { RBAC_ROLE_MATRIX, ROLE_META, ROLE_ORDER } from '../features/users-rbac/rbacMatrix';
import type { RoleCode } from '../features/users-rbac/types';
import { LandingMotionRoot } from './LandingMotion';

type LandingIcon = typeof Warehouse;

const sectionLinkClass =
  'landing-nav-link rounded-md px-1 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400';

const primaryLinkClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:-translate-y-px hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-0 active:scale-[0.985]';

export const LandingPage: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewRole, setPreviewRole] = useState<RoleCode>('WAREHOUSE_MANAGER');
  const tabListId = useId();
  const previewPanelId = useId();
  const activeMatrix = RBAC_ROLE_MATRIX[previewRole];

  const valueCards: Array<{ icon: LandingIcon; title: string; body: string }> = [
    { icon: Warehouse, title: t('landing.value.visibilityTitle'), body: t('landing.value.visibilityBody') },
    { icon: ShieldCheck, title: t('landing.value.controlTitle'), body: t('landing.value.controlBody') },
    { icon: Boxes, title: t('landing.value.multiWarehouseTitle'), body: t('landing.value.multiWarehouseBody') },
    { icon: ClipboardCheck, title: t('landing.value.traceabilityTitle'), body: t('landing.value.traceabilityBody') },
  ];

  const operationalFeatures: Array<{ icon: LandingIcon; title: string; body: string }> = [
    { icon: PackageCheck, title: t('landing.features.f3Title'), body: t('landing.features.f3Desc') },
    { icon: Bell, title: t('landing.features.f4Title'), body: t('landing.features.f4Desc') },
    { icon: ClipboardCheck, title: t('landing.features.f5Title'), body: t('landing.features.f5Desc') },
    { icon: Globe, title: t('landing.features.f6Title'), body: t('landing.features.f6Desc') },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const handleRoleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, role: RoleCode) => {
    const currentIndex = ROLE_ORDER.indexOf(role);
    const lastIndex = ROLE_ORDER.length - 1;
    const nextIndex =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? currentIndex === lastIndex ? 0 : currentIndex + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? currentIndex === 0 ? lastIndex : currentIndex - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? lastIndex
              : null;

    if (nextIndex === null) return;
    event.preventDefault();
    const nextRole = ROLE_ORDER[nextIndex];
    setPreviewRole(nextRole);
    requestAnimationFrame(() => document.getElementById(`role-tab-${nextRole}`)?.focus());
  };

  return (
    <LandingMotionRoot>
      <div id="top" className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
        <a className="landing-skip-link" href="#main-content">
          {t('landing.nav.skipToContent')}
        </a>

        <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-950/95 text-white backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <a href="#top" className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm" aria-hidden="true">
                <Boxes className="size-5" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold tracking-tight">{t('layout.brandName')}</span>
                <span className="block truncate text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">{t('landing.nav.productLabel')}</span>
              </span>
            </a>

            <nav className="hidden items-center gap-6 md:flex" aria-label={t('landing.nav.ariaLabel')}>
              <a href="#workflow" className={sectionLinkClass}>{t('landing.nav.workflow')}</a>
              <a href="#preview" className={sectionLinkClass}>{t('landing.nav.preview')}</a>
              <a href="#capabilities" className={sectionLinkClass}>{t('landing.nav.features')}</a>
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <button id="landing-lang-toggle" type="button" onClick={toggleLanguage} title={t('demo.switch_lang')} aria-label={t('demo.switch_lang')} className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <Globe className="size-4 text-blue-400" aria-hidden="true" />
                <span className="uppercase">{language}</span>
              </button>
              <Link id="landing-nav-login" to="/login" className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                {t('landing.nav.signIn')}
              </Link>
              <Link id="landing-nav-register" to="/register" className="inline-flex min-h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                {t('landing.nav.getStarted')}
              </Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button id="landing-mobile-lang-toggle" type="button" onClick={toggleLanguage} aria-label={t('demo.switch_lang')} className="inline-flex size-11 items-center justify-center rounded-md border border-slate-700 text-xs font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <Globe className="size-4 text-blue-400" aria-hidden="true" />
                <span className="ml-1 uppercase">{language}</span>
              </button>
              <button id="landing-mobile-menu-btn" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen} aria-controls="landing-mobile-menu" aria-label={mobileMenuOpen ? t('landing.nav.closeMenu') : t('topbar.openMenuAria')} className="inline-flex size-11 items-center justify-center rounded-md border border-slate-700 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav id="landing-mobile-menu" className="border-t border-slate-800 bg-slate-950 px-4 py-4 md:hidden" aria-label={t('landing.nav.ariaLabel')}>
              <div className="mx-auto grid max-w-7xl gap-1">
                <a href="#workflow" onClick={closeMobileMenu} className="min-h-11 rounded-md px-3 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800">{t('landing.nav.workflow')}</a>
                <a href="#preview" onClick={closeMobileMenu} className="min-h-11 rounded-md px-3 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800">{t('landing.nav.preview')}</a>
                <a href="#capabilities" onClick={closeMobileMenu} className="min-h-11 rounded-md px-3 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800">{t('landing.nav.features')}</a>
                <div className="mt-2 grid gap-2 border-t border-slate-800 pt-3">
                  <Link to="/login" onClick={closeMobileMenu} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-700 text-sm font-semibold text-white">{t('landing.nav.signIn')}</Link>
                  <Link to="/register" onClick={closeMobileMenu} className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white">{t('landing.nav.getStarted')}</Link>
                </div>
              </div>
            </nav>
          )}
        </header>

        <main id="main-content">
          <section className="landing-hero relative isolate overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0 landing-hero-grid opacity-50" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-28 top-8 size-[32rem] rounded-full bg-blue-600/20 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-14">
              <m.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="lg:col-span-5">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-100"><span className="size-1.5 rounded-full bg-blue-300" aria-hidden="true" /> {t('landing.hero.eyebrow')}</p>
                <h1 className="max-w-xl text-4xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-5xl lg:text-[3.45rem]">{t('landing.hero.redesignHeadline')}</h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">{t('landing.hero.redesignSubCopy')}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link id="landing-hero-register" to="/register" className={primaryLinkClass}>{t('landing.hero.redesignCtaPrimary')} <ArrowRight className="size-4" aria-hidden="true" /></Link><a href="#preview" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-5 text-sm font-semibold text-white transition hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">{t('landing.hero.redesignCtaSecondary')} <ArrowRight className="size-4" aria-hidden="true" /></a></div>
                <p className="mt-5 text-sm text-slate-400">{t('landing.hero.disclosure')}</p>
              </m.div>

              <m.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }} className="landing-product-frame lg:col-span-7">
                <div className="flex items-center justify-between border-b border-slate-700/80 bg-slate-900 px-4 py-3"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-100">{t('landing.hero.frameTitle')}</span><span className="hidden rounded border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">{t('landing.hero.illustrative')}</span></div><span className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200" aria-label={t('landing.hero.facilityAria')}>{t('landing.hero.facilityValue')} <ChevronDown className="size-3" aria-hidden="true" /></span></div>
                <div className="grid gap-3 p-3 sm:grid-cols-[1.25fr_0.9fr] sm:p-4"><div className="space-y-3"><div className="grid grid-cols-3 gap-2"><Metric label={t('landing.hero.metricSkus')} value="1,420" /><Metric label={t('landing.hero.metricAttention')} value="05" tone="amber" /><Metric label={t('landing.hero.metricPending')} value="03" tone="blue" /></div><div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-semibold text-white">{t('landing.hero.activityTitle')}</p><p className="mt-0.5 text-[11px] text-slate-400">{t('landing.hero.activitySubtitle')}</p></div><span className="rounded bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-300">{t('landing.hero.illustrative')}</span></div><div className="space-y-2"><MovementRow icon={ArrowDownToLine} title={t('landing.hero.inboundTitle')} detail="WH-01 · SKU-LOGI-M331" value="+150" tone="green" /><MovementRow icon={ArrowUpFromLine} title={t('landing.hero.outboundTitle')} detail="WH-02 · SKU-DELL-P2419" value="−25" tone="blue" /><MovementRow icon={ClipboardCheck} title={t('landing.hero.reviewTitle')} detail="WH-01 · OUT-2408" value={t('landing.hero.awaiting')} tone="amber" /></div></div></div><div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3"><p className="text-xs font-semibold text-white">{t('landing.hero.approvalTitle')}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-400">{t('landing.hero.approvalSubtitle')}</p><div className="mt-4 space-y-3"><ApprovalState label={t('landing.hero.approvalDraft')} active /><ApprovalState label={t('landing.hero.approvalReview')} active /><ApprovalState label={t('landing.hero.approvalApproved')} /></div><div className="mt-5 rounded-md border border-slate-700 bg-slate-800/70 p-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t('landing.hero.scopeLabel')}</p><p className="mt-1 text-xs font-medium text-white">WH-01 · WH-02 · WH-03</p></div></div></div>
              </m.div>
            </div>
          </section>

          <section id="value" className="bg-white py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow={t('landing.value.eyebrow')} title={t('landing.value.title')} body={t('landing.value.subtitle')} /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{valueCards.map(({ icon: Icon, title, body }) => <article key={title} className="landing-card-hover rounded-xl border border-slate-200 bg-white p-6"><span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></article>)}</div></div></section>

          <section id="workflow" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow={t('landing.workflow.eyebrow')} title={t('landing.workflow.title')} body={t('landing.workflow.subtitle')} /><ol className="mt-12 grid gap-4 lg:grid-cols-3">{[1, 2, 3].map((step) => <li key={step} className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><span className="text-sm font-semibold text-blue-700">0{step}</span><div className="mt-8 flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white">{step === 1 ? <Boxes className="size-5" /> : step === 2 ? <ArrowDownToLine className="size-5" /> : <ClipboardCheck className="size-5" />}</div><h3 className="mt-5 text-xl font-semibold tracking-tight">{t(`landing.workflow.step${step}Title`)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t(`landing.workflow.step${step}Body`)}</p></li>)}</ol></div></section>

          <section id="preview" className="bg-white py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow={t('landing.preview.eyebrow')} title={t('landing.preview.title')} body={t('landing.preview.subtitle')} /><div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm"><div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-5"><div id={tabListId} role="tablist" aria-label={t('landing.preview.roleSwitchLabel')} className="flex gap-1 overflow-x-auto pb-1">{ROLE_ORDER.map((role) => { const selected = previewRole === role; return <button key={role} id={`role-tab-${role}`} type="button" role="tab" aria-selected={selected} aria-controls={previewPanelId} tabIndex={selected ? 0 : -1} onClick={() => setPreviewRole(role)} onKeyDown={(event) => handleRoleTabKeyDown(event, role)} className={`min-h-11 shrink-0 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${selected ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{t(ROLE_META[role].labelKey)}</button>; })}</div></div><div id={previewPanelId} role="tabpanel" aria-labelledby={`role-tab-${previewRole}`} className="grid gap-5 p-5 lg:grid-cols-[0.8fr_1.2fr] lg:p-8"><div className="rounded-xl bg-slate-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">{t('landing.preview.permissionsLabel')}</p><h3 className="mt-3 text-2xl font-semibold tracking-tight">{t(ROLE_META[previewRole].labelKey)}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{t(ROLE_META[previewRole].scopeNoteKey)}</p><div className="mt-6 border-t border-slate-700 pt-5"><p className="text-xs text-slate-400">{t('landing.preview.modulesUnit')}</p><p className="mt-1 text-3xl font-semibold">{activeMatrix.allowedNavKeys.length}</p></div><p className="mt-6 text-xs leading-5 text-slate-400">{t('landing.preview.disclaimer')}</p></div><div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-950">{t('landing.preview.ledgerTitle')}</p><p className="mt-1 text-sm text-slate-500">{t('landing.preview.ledgerSub')}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{t('landing.preview.illustrative')}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><PermissionLine label={t('landing.preview.capCreateStock')} allowed={activeMatrix.canCreateStockOrder} /><PermissionLine label={t('landing.preview.capApproveStock')} allowed={activeMatrix.canApproveStockOrder} /><PermissionLine label={t('landing.preview.capManageCatalog')} allowed={activeMatrix.canManageCatalog} /><PermissionLine label={t('landing.preview.capManageUsers')} allowed={activeMatrix.canManageUsers} /></div><div className="mt-5 border-t border-slate-100 pt-4"><div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">OUT-2408 · WH-01</span>{activeMatrix.canApproveStockOrder ? <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{t('landing.preview.canApprove')}</span> : <span className="text-xs text-slate-500">{t('landing.preview.viewOnly')}</span>}</div></div></div></div></div></div></section>

          <section id="capabilities" className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionHeading eyebrow={t('landing.features.eyebrow')} title={t('landing.features.title')} body={t('landing.features.subtitle')} /><div className="mt-12 grid gap-4 md:grid-cols-2">{operationalFeatures.map(({ icon: Icon, title, body }) => <article key={title} className="landing-card-hover flex gap-4 rounded-xl border border-slate-200 bg-white p-6"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon className="size-5" /></span><div><h3 className="font-semibold text-slate-950">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{body}</p></div></article>)}</div></div></section>

          <section className="bg-slate-950 py-20 text-white sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid gap-8 rounded-2xl border border-slate-700 bg-slate-900/60 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-sm font-semibold text-blue-300">{t('landing.cta.eyebrow')}</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{t('landing.cta.title')}</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{t('landing.cta.subtitle')}</p></div><Link to="/register" className={primaryLinkClass}>{t('landing.cta.button')} <ArrowRight className="size-4" /></Link></div></div></section>
        </main>

        <footer className="bg-slate-950 pb-8 text-slate-400"><div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-slate-800 px-4 pt-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div><p className="text-sm font-semibold text-white">{t('landing.footer.tagline')}</p><p className="mt-1 text-xs">{t('landing.footer.copyright')}</p></div><nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm" aria-label={t('landing.footer.navAria')}><a href="#workflow" className="landing-nav-link hover:text-white">{t('landing.nav.workflow')}</a><a href="#preview" className="landing-nav-link hover:text-white">{t('landing.nav.preview')}</a><Link to="/login" className="landing-nav-link hover:text-white">{t('landing.footer.links.signIn')}</Link><Link to="/register" className="landing-nav-link hover:text-white">{t('landing.footer.links.register')}</Link></nav></div></footer>
      </div>
    </LandingMotionRoot>
  );
};

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <div className="max-w-2xl"><p className="text-sm font-semibold text-blue-700">{eyebrow}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-4xl">{title}</h2><p className="mt-4 text-base leading-7 text-slate-600">{body}</p></div>;
}

function Metric({ label, value, tone = 'white' }: { label: string; value: string; tone?: 'white' | 'amber' | 'blue' }) {
  const toneClass = tone === 'amber' ? 'text-amber-300' : tone === 'blue' ? 'text-blue-300' : 'text-white';
  return <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2.5"><p className="truncate text-[10px] font-medium text-slate-400">{label}</p><p className={`mt-1 text-lg font-semibold tabular-nums ${toneClass}`}>{value}</p></div>;
}

function MovementRow({ icon: Icon, title, detail, value, tone }: { icon: LandingIcon; title: string; detail: string; value: string; tone: 'green' | 'blue' | 'amber' }) {
  const colors = { green: 'bg-emerald-500/15 text-emerald-300', blue: 'bg-blue-500/15 text-blue-300', amber: 'bg-amber-500/15 text-amber-300' };
  return <div className="flex items-center gap-2 rounded-md bg-slate-800/65 p-2"><span className={`flex size-7 shrink-0 items-center justify-center rounded ${colors[tone]}`}><Icon className="size-3.5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-slate-100">{title}</span><span className="block truncate text-[10px] text-slate-400">{detail}</span></span><span className={`text-xs font-semibold ${tone === 'green' ? 'text-emerald-300' : tone === 'blue' ? 'text-blue-300' : 'text-amber-300'}`}>{value}</span></div>;
}

function ApprovalState({ label, active = false }: { label: string; active?: boolean }) {
  return <div className="flex items-center gap-2"><span className={`flex size-5 items-center justify-center rounded-full border ${active ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600 text-slate-500'}`}>{active && <Check className="size-3" />}</span><span className={active ? 'text-xs font-medium text-slate-200' : 'text-xs text-slate-500'}>{label}</span></div>;
}

function PermissionLine({ label, allowed }: { label: string; allowed: boolean }) {
  return <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"><span className="text-sm leading-5 text-slate-700">{label}</span><span className={`shrink-0 rounded px-2 py-1 text-[11px] font-semibold ${allowed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{allowed ? '✓' : '—'}</span></div>;
}
