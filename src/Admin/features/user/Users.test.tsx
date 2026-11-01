// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Users from './Users';
import { useUserStore } from './userStore';
import * as AuthContextModule from '../../../Auth/AuthContext/AuthContext';
import { UserRole } from '../../../Auth/types';

describe('Users Component', () => {
  const currentAdmin = {
    id: 'admin-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    nickname: 'admin',
    given_name: 'Super Admin',
  };

  const mockUsers = [
    {
      id: 'admin-1',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      name: 'Super Admin',
      nickname: 'admin',
      picture: 'https://test.com/admin.jpg',
      enabled: true,
    },
    {
      id: 'user-2',
      email: 'empleado@test.com',
      role: UserRole.USER,
      name: 'Juan Perez',
      nickname: 'juanp',
      picture: 'https://test.com/juan.jpg',
      enabled: false,
    },
  ];

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
      users: mockUsers,
      isLoading: false,
      error: null,
      fetchUsers: vi.fn(),
      deleteUser: vi.fn(),
    });
  });

  it('renderiza la lista de usuarios con badges de estado y rol', () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    expect(screen.getByText('Gestión del Padrón de Usuarios')).not.toBeNull();
    expect(screen.getByText('Super Admin')).not.toBeNull();
    expect(screen.getByText('Juan Perez')).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();
    expect(screen.getByText('Bloqueado')).not.toBeNull();

    // El usuario de la sesión debe tener el badge "Tú"
    expect(screen.getByText('Tú')).not.toBeNull();
  });

  it('muestra botones administrativos (detalles, rol/estado, eliminar) según guard de rol ADMIN', () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    // Enlace a detalles para ambos usuarios
    const detailLinks = screen.getAllByRole('link', { name: /Ver detalles/i });
    expect(detailLinks.length).toBe(2);

    // Botón para gestionar rol y estado solo en el usuario ajeno
    expect(screen.getByRole('button', { name: /Rol \/ Estado/i })).not.toBeNull();
    expect(screen.getByRole('button', { name: /Eliminar/i })).not.toBeNull();

    // No debe haber botones de edición de perfil ni contraseña en la lista del padrón
    expect(screen.queryByRole('button', { name: /Editar perfil/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Contraseña/i })).toBeNull();
  });

  it('oculta las acciones administrativas si el usuario no tiene rol ADMIN o superior', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { ...currentAdmin, role: UserRole.USER },
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

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: /Ver detalles/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Rol \/ Estado/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Eliminar/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /\+ Crear usuario/i })).toBeNull();
  });

  it('abre el modal de creación de usuario al hacer clic en + Crear usuario', () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('button', { name: /\+ Crear usuario/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Crear Nuevo Usuario')).not.toBeNull();
  });

  it('abre el modal de gestión de rol al hacer clic en Rol / Estado', () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    const upgradeBtn = screen.getByRole('button', { name: /Rol \/ Estado/i });
    fireEvent.click(upgradeBtn);

    expect(screen.getByText('Gestionar Rol y Estado')).not.toBeNull();
  });

  it('permite filtrar usuarios mediante la barra de búsqueda', () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por email, nombre, apodo o rol/i);
    fireEvent.change(searchInput, { target: { value: 'juanp' } });

    expect(screen.getByText('Juan Perez')).not.toBeNull();
    expect(screen.queryByText('Super Admin')).toBeNull();
  });
});
