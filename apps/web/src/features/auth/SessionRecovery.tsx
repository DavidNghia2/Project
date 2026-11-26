import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, Spinner } from '../../design-system';
import { useTranslation } from '../../i18n';
import { useAuth } from './useAuth';
import { DashboardSkeleton } from '../../pages/DashboardSkeleton';
import { Sidebar } from '../../layouts/Sidebar';
import { Topbar } from '../../layouts/Topbar';

export type SessionRecoveryVariant = 'dashboard' | 'neutral';

export interface SessionRecoveryProps {
  variant?: SessionRecoveryVariant;
}

export function SessionRecovery({ variant = 'dashboard' }: SessionRecoveryProps) {
  const { recoveryStatus, retrySession } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [, setMobileOpen] = useState(false);
  const unavailable = recoveryStatus === 'unavailable';

  if (variant === 'neutral') {
    return (
      <div
        data-testid="auth-loading"
        data-variant="neutral"
        className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6 text-[#0F172A] font-sans antialiased"
      >
        <div role="status" className="max-w-sm w-full text-center space-y-4">
          {unavailable ? (
            <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-rose-950">{t('auth.connectionUnavailable')}</p>
                <p className="text-xs text-rose-800/90 leading-relaxed">{t('auth.errors.networkError')}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={retrySession}
                iconLeft={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
              >
                {t('auth.retrySession')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="md" className="text-[#2563EB]" />
              <p className="text-sm font-medium text-[#475569]">
                {recoveryStatus === 'slow' ? t('auth.connectionSlow') : t('auth.checkingSession')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="auth-loading"
      data-variant="dashboard"
      className="fixed inset-0 flex bg-[#F8FAFC] overflow-hidden text-[#0F172A] font-sans antialiased pb-[env(safe-area-inset-bottom)]"
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          activeWarehouse="ALL"
          onSelectWarehouse={() => {}}
        />

        {/* Scrollable Main Area with Status Banner & Dashboard Skeleton */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] outline-none"
        >
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Session Telemetry Status Banner */}
            {unavailable ? (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm shadow-xs animate-in fade-in duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{t('auth.connectionUnavailable')}</p>
                    <p className="text-xs text-rose-700 mt-0.5">
                      {t('auth.errors.networkError')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={retrySession}
                  iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
                  className="bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
                >
                  {t('auth.retrySession')}
                </Button>
              </div>
            ) : recoveryStatus === 'slow' ? (
              <div
                role="status"
                className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Spinner size="sm" className="text-amber-600" />
                  <span className="font-medium">{t('auth.connectionSlow')}</span>
                </div>
                <span className="text-[11px] text-amber-700">{t('auth.retryingSession')}</span>
              </div>
            ) : (
              <div
                role="status"
                className="flex items-center justify-between gap-3 px-4 py-2 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Spinner size="sm" className="text-blue-600" />
                  <span className="font-medium">{t('auth.checkingSession')}</span>
                </div>
                <span className="text-[11px] font-mono text-blue-600/80">{t('auth.initializingWorkspace')}</span>
              </div>
            )}

            {/* Full Dashboard Skeleton */}
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
