import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { useTranslation } from '../i18n';
import { DevRolePreviewBar } from '../features/users-rbac/components/DevRolePreviewBar';
import { useAuth } from '../features/auth/useAuth';
import { DashboardSkeleton } from '../pages/DashboardSkeleton';
import { MOTION_EASE, MOTION_OVERLAY, MOTION_SPRING, PageTransition, useSafeReducedMotion } from '../design-system';

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isMockMode } = useAuth();
  const { pathname } = useLocation();
  const shouldReduceMotion = useSafeReducedMotion();
  const mainRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeWarehouse, setActiveWarehouse] = useState('ALL');

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="fixed inset-0 flex bg-[#F8FAFC] text-[#0F172A] font-sans antialiased pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Skip to main content link for keyboard & screen reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 font-medium text-sm transition-transform"
      >
        {t('layout.skipToContent')}
      </a>

      {/* Desktop Sidebar (visible on lg+) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile / Tablet Drawer Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div
            key="mobile-drawer"
            className="fixed inset-0 z-40 lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label={t('layout.mobileDrawerAria')}
          >
            {/* Backdrop */}
            <m.div
              initial={MOTION_OVERLAY.backdrop.initial}
              animate={MOTION_OVERLAY.backdrop.animate}
              exit={MOTION_OVERLAY.backdrop.exit}
              transition={MOTION_OVERLAY.backdrop.transition}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Content (spring slide + swipe-to-dismiss on touch) */}
            <m.div
              initial={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0.08 } }
                  : { x: '-100%', transition: { duration: 0.16, ease: MOTION_EASE.exit } }
              }
              transition={shouldReduceMotion ? { duration: 0.1 } : MOTION_SPRING.overlay}
              drag={shouldReduceMotion ? false : 'x'}
              dragConstraints={{ left: -240, right: 0 }}
              dragElastic={{ left: 0.12, right: 0 }}
              onDragEnd={(_e, info) => {
                if (info.offset.x < -72 || info.velocity.x < -300) {
                  setMobileOpen(false);
                }
              }}
              className="relative flex flex-col w-[min(85vw,18rem)] max-w-[18rem] h-full bg-white z-50 shadow-2xl pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)]"
            >
              <Sidebar
                collapsed={false}
                isMobileDrawer
                onToggleCollapse={() => setMobileOpen(false)}
                onCloseMobile={() => setMobileOpen(false)}
              />
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {import.meta.env.DEV && isMockMode && <DevRolePreviewBar />}
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          activeWarehouse={activeWarehouse}
          onSelectWarehouse={(code) => setActiveWarehouse(code)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Scrollable Page Outlet */}
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-[#F8FAFC] outline-none"
        >
          <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-5 sm:space-y-6 min-w-0">
            <Suspense fallback={<DashboardSkeleton />}>
              <PageTransition transitionKey={pathname}>
                <Outlet context={{ activeWarehouse }} />
              </PageTransition>
            </Suspense>
          </div>

          {/* Footer */}
          <footer className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto mt-10 sm:mt-12 pt-6 pb-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row flex-wrap items-center justify-between text-xs text-[#94A3B8] gap-3 text-center sm:text-left">
            <span>
              &copy; 2026 {t('layout.brandName')} Management System. {t('layout.copyright')}
            </span>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
              <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {t('layout.whScope')}: {activeWarehouse === 'ALL' ? t('common.all') : activeWarehouse}
              </span>
              <Link to="/design-system" className="hover:text-blue-600 transition-colors py-1">
                {t('nav.designSystem')}
              </Link>
              <span>{t('layout.version')}</span>
            </div>
          </footer>
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        activeWarehouse={activeWarehouse}
        onSelectWarehouse={(code) => setActiveWarehouse(code)}
      />
    </div>
  );
};
