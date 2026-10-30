import React, { type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../AuthContext/AuthContext';
import { UserRole } from '../types';
import Loader from '../../shared/components/Loader';

interface ProtectedRouteProps {
  children?: ReactNode;
  minRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  minRole,
  allowedRoles,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, isLoading, hasMinRole, canAccess } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen={true} scale={0.7} text="Validando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  if (minRole && !hasMinRole(minRole)) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
        <div className="card shadow-sm p-4" style={{ maxWidth: '480px', borderRadius: '12px' }}>
          <h2 className="text-danger mb-3">Acceso Restringido</h2>
          <p className="text-secondary">
            No tienes los permisos necesarios ({minRole}) para visualizar este módulo.
          </p>
          <a href="/admin" className="btn btn-outline-primary mt-2">
            Volver al Panel
          </a>
        </div>
      </div>
    );
  }

  if (allowedRoles && !canAccess(allowedRoles)) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
        <div className="card shadow-sm p-4" style={{ maxWidth: '480px', borderRadius: '12px' }}>
          <h2 className="text-danger mb-3">Acceso Restringido</h2>
          <p className="text-secondary">Tu rol actual no tiene acceso a esta sección.</p>
          <a href="/admin" className="btn btn-outline-primary mt-2">
            Volver al Panel
          </a>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
