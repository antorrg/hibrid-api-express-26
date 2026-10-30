import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { httpClient, subscribeUnauthorized } from '../../shared/api/api';
import {
  UserRole,
  RoleHierarchy,
  type UserSession,
  type LoginCredentials,
  type AuthContextType,
} from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Comprueba la sesión activa consultando al servidor (GET /api/v1/auth/me)
  const checkAuth = useCallback(async (): Promise<UserSession | null> => {
    setIsLoading(true);
    try {
      const sessionUser = await httpClient.request<UserSession>({
        url: '/auth/me',
        method: 'GET',
      });

      if (sessionUser && sessionUser.id) {
        setUser(sessionUser);
        setIsAuthenticated(true);
        return sessionUser;
      }

      setUser(null);
      setIsAuthenticated(false);
      return null;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Al montar, verificamos la sesión y nos suscribimos a desautorizaciones (401)
  useEffect(() => {
    checkAuth();

    const unsubscribe = subscribeUnauthorized(() => {
      setUser(null);
      setIsAuthenticated(false);
    });

    return () => {
      unsubscribe();
    };
  }, [checkAuth]);

  // Login: soporta credenciales { email, password } o usuario directo
  const login = useCallback(async (data: LoginCredentials | UserSession): Promise<UserSession> => {
    if ('password' in data) {
      const response = await httpClient.request<UserSession>({
        url: '/auth/login',
        method: 'POST',
        payload: data,
      });
      setUser(response);
      setIsAuthenticated(true);
      return response;
    } else {
      setUser(data);
      setIsAuthenticated(true);
      return data;
    }
  }, []);

  // Logout: destruye la sesión en el servidor y limpia el estado local
  const logout = useCallback(async (): Promise<void> => {
    try {
      await httpClient.request({
        url: '/auth/logout',
        method: 'POST',
      });
    } catch (err) {
      console.warn('Error al cerrar sesión en el servidor:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Helpers de permisos y roles
  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.role === role;
  }, [user]);

  const hasMinRole = useCallback((minRole: UserRole): boolean => {
    if (!user?.role) return false;
    const userLevel = RoleHierarchy[user.role] ?? 0;
    const requiredLevel = RoleHierarchy[minRole] ?? 0;
    return userLevel >= requiredLevel;
  }, [user]);

  const canAccess = useCallback((allowedRoles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    authenticated: isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    hasRole,
    hasMinRole,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
