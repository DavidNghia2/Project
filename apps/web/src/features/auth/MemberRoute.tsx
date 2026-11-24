import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

export const MemberRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user?.company || !user.role) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
};
