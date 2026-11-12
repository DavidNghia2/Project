import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button, Spinner } from '../../design-system';
import { useTranslation } from '../../i18n';
import type { RoleCode } from '../users-rbac/types';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: readonly RoleCode[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',
  allowedRoles,
}) => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] gap-3"
        data-testid="auth-loading"
        aria-busy="true"
      >
        <Spinner size="lg" className="text-[#2563EB]" />
        <span className="text-xs font-medium text-[#64748B]">{t('auth.checkingSession')}</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
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
