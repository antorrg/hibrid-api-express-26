import { create } from 'zustand';
import { aboutApi } from './aboutApi';
import { toast } from '../../../shared/toast/toastManager';
import type {
  IAbout,
  CreateAboutDTO,
  UpdateAboutDTO,
} from './aboutTypes';

/**
 * Determina si la información de About representa un registro persistido
 * o el objeto de respaldo por defecto (mock fallback) del backend.
 */
export const isAboutPersisted = (about: IAbout | null): boolean => {
  if (!about) return false;
  return about.picture !== 'nopicture' || (about.title !== 'No title' && about.text !== 'no data yet');
};

interface AboutState {
  about: IAbout | null;
  isLoading: boolean;
  error: string | null;

  fetchAbout: () => Promise<IAbout | null>;
  createAbout: (data: CreateAboutDTO) => Promise<boolean>;
  updateAbout: (id: string, data: UpdateAboutDTO) => Promise<IAbout | null>;
  clearAbout: () => void;
}

export const useAboutStore = create<AboutState>((set, get) => ({
  about: null,
  isLoading: false,
  error: null,

  fetchAbout: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await aboutApi.get();
      set({ about: data || null, isLoading: false });
      return data || null;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener la información de Acerca de';
      set({ error: message, isLoading: false, about: null });
      toast.error(message);
      return null;
    }
  },

  createAbout: async (data: CreateAboutDTO) => {
    set({ isLoading: true, error: null });
    try {
      await aboutApi.create(data);
      toast.success('Sección Acerca de creada exitosamente');
      const refreshed = await get().fetchAbout();
      set({ isLoading: false });
      return !!refreshed;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al crear la sección Acerca de';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  updateAbout: async (id: string, data: UpdateAboutDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await aboutApi.update(id, data);
      set({ about: updated, isLoading: false });
      toast.success('Sección Acerca de actualizada exitosamente');
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al actualizar la sección Acerca de';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  clearAbout: () => set({ about: null, error: null, isLoading: false }),
}));
