import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { DevRolePreviewBar } from '../features/users-rbac/components/DevRolePreviewBar';

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeWarehouse, setActiveWarehouse] = useState('ALL');

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-[#0F172A] font-sans antialiased">
      {/* Desktop Sidebar (visible on lg+) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile / Tablet Drawer Sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label={t('layout.mobileDrawerAria')}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Close button on drawer */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 p-1 text-[#64748B] hover:text-[#0F172A] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 z-50"
              aria-label={t('layout.closeNavAria')}
            >
              <X className="w-5 h-5" />
            </button>

            <Sidebar
              collapsed={false}
              onToggleCollapse={() => setMobileOpen(false)}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {import.meta.env.DEV && <DevRolePreviewBar />}
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          activeWarehouse={activeWarehouse}
          onSelectWarehouse={(code) => setActiveWarehouse(code)}
        />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ activeWarehouse }} />
          </div>

          {/* Footer */}
          <footer className="max-w-7xl mx-auto mt-12 pt-6 pb-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-2">
            <span>
              &copy; 2026 {t('layout.brandName')} Management System. {t('layout.copyright')}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {t('layout.whScope')}: {activeWarehouse === 'ALL' ? t('common.all') : activeWarehouse}
              </span>
              <Link to="/design-system" className="hover:text-blue-600 transition-colors">
                {t('nav.designSystem')}
              </Link>
              <span>{t('layout.version')}</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
