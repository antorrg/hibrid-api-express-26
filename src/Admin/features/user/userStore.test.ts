import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserStore } from './userStore';
import { httpClient } from '../../../shared/api/api';
import { UserRole } from '../../../Auth/types';

describe('userStore (Zustand)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useUserStore.getState().clearProfile();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicia con profile en null y no cargando', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchUserProfile obtiene el perfil vía httpClient y actualiza el store', async () => {
    const mockProfile = {
      id: 'usr-123',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      name: 'Antonio Rodriguez',
      nickname: 'antorrg',
      picture: '/avatar.jpg',
      enabled: true,
    };

    vi.spyOn(httpClient, 'request').mockResolvedValue(mockProfile);

    const result = await useUserStore.getState().fetchUserProfile('usr-123');

    expect(result).toEqual(mockProfile);
    expect(useUserStore.getState().profile).toEqual(mockProfile);
    expect(useUserStore.getState().isLoading).toBe(false);
    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/user/usr-123',
      method: 'GET',
    });
  });

  it('updateUserProfile hace PUT al endpoint y actualiza el store', async () => {
    const initialProfile = {
      id: 'usr-123',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      name: 'Antonio Rodriguez',
      nickname: 'antorrg',
      picture: '/avatar.jpg',
      enabled: true,
    };

    const updatedProfile = {
      ...initialProfile,
      name: 'Antonio R. Gramajo',
      nickname: 'antorrg-dev',
    };

    vi.spyOn(httpClient, 'request').mockResolvedValue(updatedProfile);

    const result = await useUserStore.getState().updateUserProfile('usr-123', {
      name: 'Antonio R. Gramajo',
      nickname: 'antorrg-dev',
    });

    expect(result).toEqual(updatedProfile);
    expect(useUserStore.getState().profile).toEqual(updatedProfile);
    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/user/usr-123',
      method: 'PUT',
      payload: {
        name: 'Antonio R. Gramajo',
        nickname: 'antorrg-dev',
      },
    });
  });

  it('clearProfile limpia el perfil y el error', () => {
    useUserStore.setState({
      profile: {
        id: 'usr-1',
        email: 'test@test.com',
        role: UserRole.USER,
        name: 'Test',
        nickname: 'test',
        picture: '',
        enabled: true,
      },
      error: 'Some error',
    });

    useUserStore.getState().clearProfile();

    expect(useUserStore.getState().profile).toBeNull();
    expect(useUserStore.getState().error).toBeNull();
  });

  it('fetchUsers obtiene la lista de usuarios y actualiza el store', async () => {
    const mockUsers = [
      {
        id: 'usr-1',
        email: 'user1@test.com',
        role: UserRole.USER,
        name: 'User 1',
        nickname: 'user1',
        picture: '/pic1.jpg',
        enabled: true,
      },
    ];

    vi.spyOn(httpClient, 'request').mockResolvedValue(mockUsers);

    const result = await useUserStore.getState().fetchUsers();

    expect(result).toEqual(mockUsers);
    expect(useUserStore.getState().users).toEqual(mockUsers);
    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/user',
      method: 'GET',
    });
  });

  it('fetchUserById obtiene un usuario específico y actualiza selectedUser', async () => {
    const mockUser = {
      id: 'usr-2',
      email: 'user2@test.com',
      role: UserRole.ADMIN,
      name: 'User 2',
      nickname: 'user2',
      picture: '/pic2.jpg',
      enabled: true,
    };

    vi.spyOn(httpClient, 'request').mockResolvedValue(mockUser);

    const result = await useUserStore.getState().fetchUserById('usr-2');

    expect(result).toEqual(mockUser);
    expect(useUserStore.getState().selectedUser).toEqual(mockUser);
  });

  it('createUser llama al POST y agrega el nuevo usuario a users', async () => {
    const newUser = {
      id: 'usr-3',
      email: 'new@test.com',
      role: UserRole.USER,
      name: 'Falta completar',
      nickname: 'new',
      picture: '/default.jpg',
      enabled: true,
    };

    vi.spyOn(httpClient, 'request').mockResolvedValue(newUser);

    const result = await useUserStore.getState().createUser({
      email: 'new@test.com',
      password: 'password123',
    });

    expect(result).toEqual(newUser);
    expect(useUserStore.getState().users).toContainEqual(newUser);
    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/user',
      method: 'POST',
      payload: {
        email: 'new@test.com',
        password: 'password123',
      },
    });
  });

  it('changePassword envía las credenciales actuales y nuevas', async () => {
    vi.spyOn(httpClient, 'request').mockResolvedValue({ id: 'usr-1' });

    const success = await useUserStore.getState().changePassword({
      id: 'usr-1',
      password: 'oldPassword1',
      newPassword: 'newPassword1',
    });

    expect(success).toBe(true);
    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/user/update-credentials',
      method: 'POST',
      payload: {
        id: 'usr-1',
        password: 'oldPassword1',
        newPassword: 'newPassword1',
      },
    });
  });

  it('upgradeUser actualiza el rol y estado habilitado del usuario', async () => {
    const initialUser = {
      id: 'usr-4',
      email: 'target@test.com',
      role: UserRole.USER,
      name: 'Target',
      nickname: 'target',
      picture: '/pic4.jpg',
      enabled: true,
    };
    useUserStore.setState({ users: [initialUser] });

    const upgradedUser = {
      ...initialUser,
      role: UserRole.ADMIN,
      enabled: false,
    };

    vi.spyOn(httpClient, 'request').mockResolvedValue(upgradedUser);

    const result = await useUserStore.getState().upgradeUser('usr-4', {
      role: UserRole.ADMIN,
      enabled: false,
    });

    expect(result).toEqual(upgradedUser);
    expect(useUserStore.getState().users[0].role).toBe(UserRole.ADMIN);
    expect(useUserStore.getState().users[0].enabled).toBe(false);
  });

  it('deleteUser elimina al usuario del arreglo users', async () => {
    const userToDelete = {
      id: 'usr-5',
      email: 'delete@test.com',
      role: UserRole.USER,
      name: 'To Delete',
      nickname: 'del',
      picture: '',
      enabled: true,
    };
    useUserStore.setState({ users: [userToDelete] });

    vi.spyOn(httpClient, 'request').mockResolvedValue('deleted');

    const success = await useUserStore.getState().deleteUser('usr-5');

    expect(success).toBe(true);
    expect(useUserStore.getState().users.some((u) => u.id === 'usr-5')).toBe(false);
  });
});
