import React, { type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../AuthContext/AuthContext';
import Loader from '../../shared/components/Loader';

interface PublicOnlyRouteProps {
  children?: ReactNode;
  redirectPath?: string;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({
  children,
  redirectPath = '/admin',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen={true} scale={0.7} text="Aguarde un momento..." />;
  }

  if (isAuthenticated) {
    const targetPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || redirectPath;
    return <Navigate to={targetPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicOnlyRoute;
