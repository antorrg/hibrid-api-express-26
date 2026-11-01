// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminNav from './AdminNav';
import * as AuthContextModule from '../../Auth/AuthContext/AuthContext';
import { useUserStore } from '../features/user/userStore';
import { UserRole } from '../../Auth/types';

describe('AdminNav Component', () => {
  const mockUser = {
    id: 'user-admin-1',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    nickname: 'adminito',
    given_name: 'Administrador Principal',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
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
      profile: {
        id: 'user-admin-1',
        email: 'admin@company.com',
        role: UserRole.ADMIN,
        name: 'Administrador Principal',
        nickname: 'adminito',
        picture: 'https://test.com/avatar.jpg',
        enabled: true,
      },
    });
  });

  it('renderiza la barra de navegación con la información del usuario autenticado', () => {
    render(<AdminNav />);

    expect(screen.getByText('Panel Administrador')).not.toBeNull();
    expect(screen.getByText('Administrador Principal')).not.toBeNull();
    expect(screen.getByText('Ir a página principal')).not.toBeNull();
  });

  it('abre el modal de previsualización de perfil (lectura) al hacer clic en Mi Perfil', () => {
    render(<AdminNav />);

    const dropdownToggle = screen.getByRole('button', { id: 'user-nav-dropdown' });
    fireEvent.click(dropdownToggle);

    const perfilOption = screen.getByText(/👤 Mi Perfil/i);
    fireEvent.click(perfilOption);

    // Debe mostrarse el modal de sólo lectura de perfil
    expect(screen.getByText('Mi Perfil', { selector: '.modal-title' })).not.toBeNull();
    expect(screen.getAllByText('admin@company.com').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /✏️ Editar datos/i })).not.toBeNull();
    expect(screen.getAllByRole('button', { name: /🔑 Cambiar contraseña/i }).length).toBeGreaterThan(0);
  });

  it('permite abrir el modal de edición de datos desde el modal de previsualización', () => {
    render(<AdminNav />);

    const dropdownToggle = screen.getByRole('button', { id: 'user-nav-dropdown' });
    fireEvent.click(dropdownToggle);

    fireEvent.click(screen.getByText(/👤 Mi Perfil/i));

    const editDataBtn = screen.getByRole('button', { name: /✏️ Editar datos/i });
    fireEvent.click(editDataBtn);

    // Debe abrirse UpdateProfileModal
    expect(screen.getByText('Actualizar Mi Perfil', { selector: '.modal-title' })).not.toBeNull();
  });

  it('permite abrir directamente el modal de cambio de contraseña desde el dropdown', () => {
    render(<AdminNav />);

    const dropdownToggle = screen.getByRole('button', { id: 'user-nav-dropdown' });
    fireEvent.click(dropdownToggle);

    const changePassOption = screen.getByText(/🔑 Cambiar contraseña/i);
    fireEvent.click(changePassOption);

    // Debe abrirse ChangePasswordModal
    expect(screen.getByText('Cambiar Contraseña', { selector: '.modal-title' })).not.toBeNull();
  });
});
