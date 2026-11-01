import { create } from 'zustand';
import { imagesApi } from './imagesApi';
import { toast } from '../../../shared/toast/toastManager';
import type { StoredImage, PaginationInfo, ImageQueries } from './imageTypes';

interface ImageState {
  images: StoredImage[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  fetchImages: (queries?: ImageQueries) => Promise<StoredImage[]>;
  uploadImage: (file: File) => Promise<string | null>;
  deleteImage: (id: string) => Promise<boolean>;
  clearImages: () => void;
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  pagination: null,
  isLoading: false,
  isUploading: false,
  error: null,

  fetchImages: async (queries?: ImageQueries) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imagesApi.getAll(queries);
      set({
        images: response.data || [],
        pagination: response.info || null,
        isLoading: false,
      });
      return response.data || [];
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al obtener imágenes guardadas';
      set({ error: message, isLoading: false });
      toast.error(message);
      return [];
    }
  },

  uploadImage: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      const response = await imagesApi.upload(file);
      set({ isUploading: false });
      toast.success('Imagen subida exitosamente');
      // Refrescamos o incluimos la imagen para que esté disponible en la galería
      await get().fetchImages();
      return response.url;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al subir la imagen';
      set({ error: message, isUploading: false });
      toast.error(message);
      return null;
    }
  },

  deleteImage: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await imagesApi.delete(id);
      set((state) => ({
        images: state.images.filter((img) => img.id !== id),
        pagination: state.pagination
          ? { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
          : null,
        isLoading: false,
      }));
      toast.success('Imagen eliminada correctamente');
      return true;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al eliminar la imagen';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  clearImages: () => {
    set({ images: [], pagination: null, error: null, isLoading: false, isUploading: false });
  },
}));
