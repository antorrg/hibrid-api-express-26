import { create } from 'zustand';
import { frontPageApi } from './frontPageApi';
import { toast } from '../../../shared/toast/toastManager';
import type {
  IFrontPage,
  CreateFrontPageDTO,
  UpdateFrontPageDTO,
} from './frontPageTypes';

/**
 * Determina si la portada recibida representa un registro persistido
 * o el objeto de respaldo por defecto (mock fallback) del backend.
 */
export const isFrontPagePersisted = (fp: IFrontPage | null): boolean => {
  if (!fp) return false;
  return fp.picture !== 'nopicture';
};

interface FrontPageState {
  frontPage: IFrontPage | null;
  isLoading: boolean;
  error: string | null;

  fetchFrontPage: () => Promise<IFrontPage | null>;
  createFrontPage: (data: CreateFrontPageDTO) => Promise<boolean>;
  updateFrontPage: (id: string, data: UpdateFrontPageDTO) => Promise<IFrontPage | null>;
  clearFrontPage: () => void;
}

export const useFrontPageStore = create<FrontPageState>((set, get) => ({
  frontPage: null,
  isLoading: false,
  error: null,

  fetchFrontPage: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await frontPageApi.get();
      set({ frontPage: data || null, isLoading: false });
      return data || null;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener la portada';
      set({ error: message, isLoading: false, frontPage: null });
      toast.error(message);
      return null;
    }
  },

  createFrontPage: async (data: CreateFrontPageDTO) => {
    set({ isLoading: true, error: null });
    try {
      await frontPageApi.create(data);
      toast.success('Portada creada exitosamente');
      // Refrescamos para obtener el registro completo con su id generado
      const refreshed = await get().fetchFrontPage();
      set({ isLoading: false });
      return !!refreshed;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al crear la portada';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  updateFrontPage: async (id: string, data: UpdateFrontPageDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await frontPageApi.update(id, data);
      set({ frontPage: updated, isLoading: false });
      toast.success('Portada actualizada exitosamente');
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al actualizar la portada';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  clearFrontPage: () => set({ frontPage: null, error: null, isLoading: false }),
}));
