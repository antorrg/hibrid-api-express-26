import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { UserRole } from '../types';
import { httpClient } from '../../shared/api/api';

describe('AuthContext & useAuth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicializa llamando a checkAuth y actualiza el usuario si hay sesión', async () => {
    const mockUser = {
      id: 'usr-1',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    };

    vi.spyOn(httpClient, 'request').mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.authenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.hasMinRole(UserRole.USER)).toBe(true);
    expect(result.current.hasMinRole(UserRole.ADMIN)).toBe(true);
    expect(result.current.hasMinRole(UserRole.OWNER)).toBe(false);
  });

  it('establece isAuthenticated en false si checkAuth falla', async () => {
    vi.spyOn(httpClient, 'request').mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login con credenciales hace POST a /auth/login y actualiza el estado', async () => {
    vi.spyOn(httpClient, 'request').mockRejectedValueOnce(new Error('No session'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await Promise.resolve();
    });

    const loggedUser = {
      id: 'usr-2',
      email: 'user@test.com',
      role: UserRole.USER,
    };

    vi.spyOn(httpClient, 'request').mockResolvedValueOnce(loggedUser);

    await act(async () => {
      await result.current.login({ email: 'user@test.com', password: 'Password123' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(loggedUser);
    expect(result.current.hasRole(UserRole.USER)).toBe(true);
    expect(result.current.hasMinRole(UserRole.ADMIN)).toBe(false);
  });

  it('logout llama a /auth/logout y limpia el estado local', async () => {
    const mockUser = {
      id: 'usr-1',
      email: 'owner@test.com',
      role: UserRole.OWNER,
    };

    vi.spyOn(httpClient, 'request').mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isAuthenticated).toBe(true);

    vi.spyOn(httpClient, 'request').mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
