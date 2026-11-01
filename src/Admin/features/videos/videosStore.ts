import { create } from 'zustand';
import { videosApi } from './videosApi';
import { toast } from '../../../shared/toast/toastManager';
import type {
  IVideo,
  IVideoGroup,
  SingleVideoGroup,
  VGroupInfo,
  CreateVideoGroupDTO,
  UpdateVideoGroupDTO,
  CreateVideoDTO,
  UpdateVideoDTO,
} from './videosTypes';

interface VideosState {
  videoGroups: SingleVideoGroup[];
  paginationInfo: VGroupInfo | null;
  currentPage: number;
  selectedGroup: IVideoGroup | null;
  isLoading: boolean;
  error: string | null;

  fetchVideoGroups: (page?: number, limit?: number) => Promise<SingleVideoGroup[]>;
  fetchGroupById: (id: string) => Promise<IVideoGroup | null>;
  createGroup: (data: CreateVideoGroupDTO) => Promise<IVideoGroup | null>;
  updateGroup: (id: string, data: UpdateVideoGroupDTO) => Promise<IVideoGroup | null>;
  deleteGroup: (id: string) => Promise<boolean>;
  createVideo: (data: CreateVideoDTO) => Promise<IVideo | null>;
  updateVideo: (id: string, data: UpdateVideoDTO) => Promise<IVideo | null>;
  deleteVideo: (id: string) => Promise<boolean>;
  clearSelectedGroup: () => void;
  clearAll: () => void;
}

export const useVideosStore = create<VideosState>((set, get) => ({
  videoGroups: [],
  paginationInfo: null,
  currentPage: 1,
  selectedGroup: null,
  isLoading: false,
  error: null,

  fetchVideoGroups: async (page = 1, limit = 3) => {
    set({ isLoading: true, error: null });
    try {
      const response = await videosApi.getAllGroups({ page, limit });
      set({
        videoGroups: response?.data || [],
        paginationInfo: response?.info || null,
        currentPage: page,
        isLoading: false,
      });
      return response?.data || [];
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener grupos de videos';
      set({ error: message, isLoading: false, videoGroups: [] });
      toast.error(message);
      return [];
    }
  },

  fetchGroupById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await videosApi.getGroupById(id);
      set({ selectedGroup: data || null, isLoading: false });
      return data || null;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener grupo de videos';
      set({ error: message, isLoading: false, selectedGroup: null });
      toast.error(message);
      return null;
    }
  },

  createGroup: async (data: CreateVideoGroupDTO) => {
    set({ isLoading: true, error: null });
    try {
      const created = await videosApi.createGroup(data);
      set((state) => ({
        videoGroups: [created, ...state.videoGroups],
        isLoading: false,
      }));
      toast.success('Grupo de videos creado exitosamente');
      return created;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al crear grupo de videos';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateGroup: async (id: string, data: UpdateVideoGroupDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await videosApi.updateGroup(id, data);
      set((state) => ({
        videoGroups: state.videoGroups.map((g) => (g.id === id ? { ...g, ...updated } : g)),
        selectedGroup:
          state.selectedGroup?.id === id
            ? { ...state.selectedGroup, ...updated }
            : state.selectedGroup,
        isLoading: false,
      }));
      toast.success('Grupo de videos actualizado exitosamente');
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al actualizar grupo de videos';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  deleteGroup: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await videosApi.deleteGroup(id);
      set((state) => ({
        videoGroups: state.videoGroups.filter((g) => g.id !== id),
        selectedGroup: state.selectedGroup?.id === id ? null : state.selectedGroup,
        isLoading: false,
      }));
      toast.success('Grupo de videos eliminado exitosamente');
      return true;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al eliminar grupo de videos';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  createVideo: async (data: CreateVideoDTO) => {
    set({ isLoading: true, error: null });
    try {
      const created = await videosApi.createVideo(data);
      set((state) => ({
        selectedGroup: state.selectedGroup
          ? {
              ...state.selectedGroup,
              videos: [...(state.selectedGroup.videos || []), created],
            }
          : null,
        isLoading: false,
      }));
      toast.success('Video añadido exitosamente');
      return created;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al añadir video';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateVideo: async (id: string, data: UpdateVideoDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await videosApi.updateVideo(id, data);
      set((state) => ({
        selectedGroup: state.selectedGroup
          ? {
              ...state.selectedGroup,
              videos: (state.selectedGroup.videos || []).map((v) =>
                v.id === id ? { ...v, ...updated } : v
              ),
            }
          : null,
        isLoading: false,
      }));
      toast.success('Video actualizado exitosamente');
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al actualizar video';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  deleteVideo: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await videosApi.deleteVideo(id);
      set((state) => ({
        selectedGroup: state.selectedGroup
          ? {
              ...state.selectedGroup,
              videos: (state.selectedGroup.videos || []).filter((v) => v.id !== id),
            }
          : null,
        isLoading: false,
      }));
      toast.success('Video eliminado exitosamente');
      return true;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al eliminar video';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  clearSelectedGroup: () => set({ selectedGroup: null, error: null }),
  clearAll: () =>
    set({
      videoGroups: [],
      paginationInfo: null,
      currentPage: 1,
      selectedGroup: null,
      isLoading: false,
      error: null,
    }),
}));
