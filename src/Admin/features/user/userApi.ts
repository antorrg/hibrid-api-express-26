import { httpClient } from '../../../shared/api/api';
import type {
  UserProfile,
  CreateUserPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpgradeUserPayload,
} from './userTypes';

export const userApi = {
  getAll: async (): Promise<UserProfile[]> => {
    return await httpClient.request<UserProfile[]>({
      url: '/user',
      method: 'GET',
    });
  },

  getById: async (id: string): Promise<UserProfile> => {
    return await httpClient.request<UserProfile>({
      url: `/user/${id}`,
      method: 'GET',
    });
  },

  create: async (data: CreateUserPayload): Promise<UserProfile> => {
    return await httpClient.request<UserProfile>({
      url: '/user',
      method: 'POST',
      payload: data,
    });
  },

  updateProfile: async (id: string, data: UpdateProfilePayload): Promise<UserProfile> => {
    return await httpClient.request<UserProfile>({
      url: `/user/${id}`,
      method: 'PUT',
      payload: data,
    });
  },

  changePassword: async (data: ChangePasswordPayload): Promise<UserProfile> => {
    return await httpClient.request<UserProfile>({
      url: '/user/update-credentials',
      method: 'POST',
      payload: data,
    });
  },

  upgradeUser: async (id: string, data: UpgradeUserPayload): Promise<UserProfile> => {
    return await httpClient.request<UserProfile>({
      url: `/user/${id}/assign-status`,
      method: 'PATCH',
      payload: data,
    });
  },

  deleteUser: async (id: string): Promise<string> => {
    return await httpClient.request<string>({
      url: `/user/${id}`,
      method: 'DELETE',
    });
  },
};
