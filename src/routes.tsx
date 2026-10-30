import { createBrowserRouter, Navigate } from 'react-router';
import Login from './publicView/Login';
import RouteErrorBoundary from './shared/RouteErrorBoundary';
import { ProtectedRoute } from './Auth/guards/ProtectedRoute';
import { PublicOnlyRoute } from './Auth/guards/PublicOnlyRoute';
import { adminRouter } from './Admin/admin.routes';

export const router = createBrowserRouter([
  // 1. Única ruta pública libre
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // 2. Sección privada protegida modular
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: adminRouter,
  },
  // 3. Fallback: cualquier otra ruta redirige a /admin (si no autenticado, el guard lo mandará a /login)
  {
    path: '*',
    element: <Navigate to="/admin" replace />,
  },
]);