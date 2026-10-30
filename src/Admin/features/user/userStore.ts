import { create } from 'zustand';
import { httpClient } from '../../../shared/api/api';
import { toast } from '../../../shared/toast/toastManager';
import type { UserProfile, UpdateProfilePayload } from './userTypes';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfile: (userId: string, data: UpdateProfilePayload) => Promise<UserProfile | null>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchUserProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await httpClient.request<UserProfile>({
        url: `/user/${userId}`,
        method: 'GET',
      });
      set({ profile: response, isLoading: false });
      return response;
    } catch (err: any) {
      const message = err?.message || 'Error al obtener datos del usuario';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  updateUserProfile: async (userId: string, data: UpdateProfilePayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await httpClient.request<UserProfile>({
        url: `/user/${userId}`,
        method: 'PUT',
        payload: data,
      });
      set({ profile: response, isLoading: false });
      toast.success('Perfil actualizado correctamente');
      return response;
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar el perfil';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null, isLoading: false });
  },
}));
