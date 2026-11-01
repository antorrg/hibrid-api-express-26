// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import User from './User';
import { useUserStore } from './userStore';
import * as AuthContextModule from '../../../Auth/AuthContext/AuthContext';
import { UserRole } from '../../../Auth/types';

describe('User Component (Detalle de Usuario)', () => {
  const currentAdmin = {
    id: 'admin-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    nickname: 'admin',
    given_name: 'Super Admin',
  };

  const otherUser = {
    id: 'user-999',
    email: 'otro@test.com',
    role: UserRole.USER,
    name: 'Carlos Gomez',
    nickname: 'carlosg',
    picture: 'https://test.com/carlos.jpg',
    enabled: true,
  };

  const renderWithRouter = (initialUrl = '/admin/user/user-999') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/user/:id',
          element: <User />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: currentAdmin,
      isAuthenticated: true,
      authenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      hasRole: vi.fn(),
      hasMinRole: vi.fn().mockReturnValue(true),
      canAccess: vi.fn(),
    });

    useUserStore.setState({
      selectedUser: otherUser,
      isLoading: false,
      error: null,
      fetchUserById: vi.fn(),
      deleteUser: vi.fn(),
    });
  });

  it('renderiza la ficha técnica del usuario seleccionado', () => {
    renderWithRouter();

    expect(screen.getByText('Detalle de Usuario')).not.toBeNull();
    expect(screen.getAllByText('Carlos Gomez').length).toBeGreaterThan(0);
    expect(screen.getByText('otro@test.com')).not.toBeNull();
    expect(screen.getByText('Usuario')).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();
  });

  it('permite a un admin abrir el modal de cambio de rol y estado sobre un usuario ajeno', () => {
    renderWithRouter();

    const upgradeBtn = screen.getByRole('button', { name: /Cambiar rol y estado/i });
    fireEvent.click(upgradeBtn);

    expect(screen.getByText('Gestionar Rol y Estado')).not.toBeNull();
  });

  it('permite a un admin abrir el modal de confirmación y eliminar al usuario ajeno', async () => {
    const deleteSpy = vi.fn().mockResolvedValue(true);
    useUserStore.setState({
      deleteUser: deleteSpy,
    });

    renderWithRouter();

    const deleteBtn = screen.getByRole('button', { name: 'Eliminar usuario' });
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/¿Estás seguro de que deseas eliminar permanentemente al usuario "otro@test.com"\?/i)).not.toBeNull();

    const confirmBtn = screen.getByRole('button', { name: 'Sí, eliminar usuario' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('user-999');
    });
  });

  it('muestra botones de edición de perfil y contraseña cuando se visualiza a sí mismo', () => {
    useUserStore.setState({
      selectedUser: {
        id: 'admin-1',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        name: 'Super Admin',
        nickname: 'admin',
        picture: '',
        enabled: true,
      },
    });

    renderWithRouter('/admin/user/admin-1');

    expect(screen.getByRole('button', { name: /Editar mi perfil/i })).not.toBeNull();
    expect(screen.getByRole('button', { name: /Cambiar contraseña/i })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Cambiar rol y estado/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Eliminar usuario/i })).toBeNull();
  });

  it('no muestra botones de cambiar rol o eliminar a usuarios sin rol ADMIN o superior', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { ...currentAdmin, id: 'regular-user', role: UserRole.USER },
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

    renderWithRouter('/admin/user/user-999');

    expect(screen.queryByRole('button', { name: /Cambiar rol y estado/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Eliminar usuario/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Editar mi perfil/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Cambiar contraseña/i })).toBeNull();
  });
});
