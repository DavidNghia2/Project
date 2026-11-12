import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Spinner } from '../../design-system';
import { useTranslation } from '../../i18n';

export interface GuestRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();

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

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};
