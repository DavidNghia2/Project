import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '../../design-system';
import { SessionRecovery, type SessionRecoveryVariant } from './SessionRecovery';
import { hasStoredSessionHint } from './sessionHint';
import { useTranslation } from '../../i18n';
import type { RoleCode } from '../users-rbac/types';
import { authenticationUrl } from './invitationRedirect';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: readonly RoleCode[];
  loadingVariant?: SessionRecoveryVariant;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',
  allowedRoles,
  loadingVariant = 'dashboard',
}) => {
  const { isLoading, isAuthenticated, user, isMockMode } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (isLoading) {
    const effectiveVariant: SessionRecoveryVariant =
      loadingVariant === 'dashboard' && hasStoredSessionHint(isMockMode) ? 'dashboard' : 'neutral';
    return <SessionRecovery variant={effectiveVariant} />;
  }

  if (!isAuthenticated) {
    const destination = location.pathname === '/accept-invitation' ? location.pathname + location.search : null;
    return <Navigate to={destination ? authenticationUrl('/login', destination) : redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-semibold text-[#0F172A]">{t('auth.forbiddenTitle')}</h1>
          <p className="text-sm text-[#475569] leading-relaxed">{t('auth.forbiddenDesc')}</p>
          <Link to="/dashboard" className="inline-block">
            <Button variant="primary" size="md">
              {t('notFound.backHome')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children ?? <Outlet />}</>;
};
