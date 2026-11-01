import { create } from 'zustand';
import { userApi } from './userApi';
import { toast } from '../../../shared/toast/toastManager';
import type {
  UserProfile,
  CreateUserPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpgradeUserPayload,
} from './userTypes';

interface UserState {
  users: UserProfile[];
  selectedUser: UserProfile | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<UserProfile[]>;
  fetchUserById: (userId: string) => Promise<UserProfile | null>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  createUser: (data: CreateUserPayload) => Promise<UserProfile | null>;
  updateUserProfile: (userId: string, data: UpdateProfilePayload) => Promise<UserProfile | null>;
  changePassword: (data: ChangePasswordPayload) => Promise<boolean>;
  upgradeUser: (userId: string, data: UpgradeUserPayload) => Promise<UserProfile | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  clearProfile: () => void;
  clearSelectedUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUser: null,
  profile: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getAll();
      const list = Array.isArray(response) ? response : [];
      set({ users: list, isLoading: false });
      return list;
    } catch (err: any) {
      const message = err?.message || 'Error al obtener lista de usuarios';
      set({ error: message, isLoading: false });
      toast.error(message);
      return [];
    }
  },

  fetchUserById: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getById(userId);
      set({ selectedUser: response, isLoading: false });
      return response;
    } catch (err: any) {
      const message = err?.message || 'Error al obtener usuario';
      set({ error: message, isLoading: false, selectedUser: null });
      toast.error(message);
      return null;
    }
  },

  fetchUserProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getById(userId);
      set({ profile: response, isLoading: false });
      return response;
    } catch (err: any) {
      const message = err?.message || 'Error al obtener datos del usuario';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  createUser: async (data: CreateUserPayload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await userApi.create(data);
      set((state) => ({
        users: [created, ...state.users],
        isLoading: false,
      }));
      toast.success('Usuario creado exitosamente');
      return created;
    } catch (err: any) {
      const message = err?.message || 'Error al crear usuario';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateUserProfile: async (userId: string, data: UpdateProfilePayload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await userApi.updateProfile(userId, data);
      set((state) => ({
        profile: updated,
        selectedUser: state.selectedUser?.id === userId ? updated : state.selectedUser,
        users: state.users.map((u) => (u.id === userId ? updated : u)),
        isLoading: false,
      }));
      toast.success('Perfil actualizado correctamente');
      return updated;
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar el perfil';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  changePassword: async (data: ChangePasswordPayload) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.changePassword(data);
      set({ isLoading: false });
      toast.success('Contraseña actualizada correctamente');
      return true;
    } catch (err: any) {
      const message = err?.message || 'Error al cambiar contraseña';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  upgradeUser: async (userId: string, data: UpgradeUserPayload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await userApi.upgradeUser(userId, data);
      set((state) => ({
        selectedUser: state.selectedUser?.id === userId ? updated : state.selectedUser,
        users: state.users.map((u) => (u.id === userId ? updated : u)),
        isLoading: false,
      }));
      toast.success('Rol y estado actualizados correctamente');
      return updated;
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar rol y estado del usuario';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  deleteUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.deleteUser(userId);
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        selectedUser: state.selectedUser?.id === userId ? null : state.selectedUser,
        isLoading: false,
      }));
      toast.success('Usuario eliminado exitosamente');
      return true;
    } catch (err: any) {
      const message = err?.message || 'Error al eliminar usuario';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null, isLoading: false });
  },

  clearSelectedUser: () => {
    set({ selectedUser: null, error: null, isLoading: false });
  },
}));
