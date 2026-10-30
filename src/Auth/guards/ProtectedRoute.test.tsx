import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { UserRole } from '../types';
import { useAuth } from '../AuthContext/AuthContext';

vi.mock('../AuthContext/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Route Guards: ProtectedRoute & PublicOnlyRoute', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const setupRouter = (
    element: React.ReactNode,
    initialEntry: string,
    additionalRoutes: Array<{ path: string; element: React.ReactNode }> = []
  ) => {
    const router = createMemoryRouter(
      [
        {
          path: initialEntry,
          element,
        },
        ...additionalRoutes,
      ],
      { initialEntries: [initialEntry] }
    );

    return render(<RouterProvider router={router} />);
  };

  describe('ProtectedRoute', () => {
    it('muestra el loader cuando isLoading es true', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        authenticated: false,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        hasRole: vi.fn(),
        hasMinRole: vi.fn(),
        canAccess: vi.fn(),
      });

      setupRouter(
        <ProtectedRoute>
          <div>Contenido Privado</div>
        </ProtectedRoute>,
        '/admin'
      );

      expect(screen.getByText('Validando sesión...')).not.toBeNull();
      expect(screen.queryByText('Contenido Privado')).toBeNull();
    });

    it('redirige a /login cuando no está autenticado', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        authenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        hasRole: vi.fn(),
        hasMinRole: vi.fn(),
        canAccess: vi.fn(),
      });

      setupRouter(
        <ProtectedRoute>
          <div>Contenido Privado</div>
        </ProtectedRoute>,
        '/admin',
        [{ path: '/login', element: <div>Vista de Login</div> }]
      );

      expect(screen.getByText('Vista de Login')).not.toBeNull();
      expect(screen.queryByText('Contenido Privado')).toBeNull();
    });

    it('renderiza el contenido privado cuando está autenticado', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'usr-1', email: 'admin@test.com', role: UserRole.ADMIN },
        isAuthenticated: true,
        authenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        hasRole: vi.fn(),
        hasMinRole: vi.fn().mockReturnValue(true),
        canAccess: vi.fn().mockReturnValue(true),
      });

      setupRouter(
        <ProtectedRoute>
          <div>Contenido Privado</div>
        </ProtectedRoute>,
        '/admin'
      );

      expect(screen.getByText('Contenido Privado')).not.toBeNull();
    });

    it('muestra mensaje de acceso denegado si no cumple con minRole', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'usr-1', email: 'user@test.com', role: UserRole.USER },
        isAuthenticated: true,
        authenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        hasRole: vi.fn(),
        hasMinRole: vi.fn().mockReturnValue(false),
        canAccess: vi.fn(),
      });

      setupRouter(
        <ProtectedRoute minRole={UserRole.ADMIN}>
          <div>Panel Exclusivo Admin</div>
        </ProtectedRoute>,
        '/admin/secure'
      );

      expect(screen.getByText('Acceso Restringido')).not.toBeNull();
      expect(screen.queryByText('Panel Exclusivo Admin')).toBeNull();
    });
  });

  describe('PublicOnlyRoute', () => {
    it('renderiza la vista libre (login) cuando el usuario no está autenticado', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        authenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        hasRole: vi.fn(),
        hasMinRole: vi.fn(),
        canAccess: vi.fn(),
      });

      setupRouter(
        <PublicOnlyRoute>
          <div>Formulario Login</div>
        </PublicOnlyRoute>,
        '/login'
      );

      expect(screen.getByText('Formulario Login')).not.toBeNull();
    });

    it('redirige a /admin si el usuario ya está autenticado', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'usr-1', email: 'user@test.com', role: UserRole.USER },
        isAuthenticated: true,
        authenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        hasRole: vi.fn(),
        hasMinRole: vi.fn(),
        canAccess: vi.fn(),
      });

      setupRouter(
        <PublicOnlyRoute>
          <div>Formulario Login</div>
        </PublicOnlyRoute>,
        '/login',
        [{ path: '/admin', element: <div>Panel Admin Destino</div> }]
      );

      expect(screen.getByText('Panel Admin Destino')).not.toBeNull();
      expect(screen.queryByText('Formulario Login')).toBeNull();
    });
  });
});
