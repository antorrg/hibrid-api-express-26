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
});
