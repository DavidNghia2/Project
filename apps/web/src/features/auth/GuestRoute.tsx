import React from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { SessionRecovery } from './SessionRecovery';
import { invitationDestination } from './invitationRedirect';
import { hasStoredSessionHint } from './sessionHint';

export interface GuestRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isLoading, isAuthenticated, user, isMockMode } = useAuth();
  const [params] = useSearchParams();

  if (isLoading) {
    if (hasStoredSessionHint(isMockMode)) {
      return <SessionRecovery variant="dashboard" />;
    }
    return <>{children ?? <Outlet />}</>;
  }

  if (isAuthenticated) {
    const invitation = invitationDestination(params.get('next'));
    return <Navigate to={invitation ?? (isMockMode || user?.company ? redirectTo : '/account')} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};
