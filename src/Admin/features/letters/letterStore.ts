import { create } from 'zustand';
import { letterApi } from './letterApi';
import { toast } from '../../../shared/toast/toastManager';
import type { ILetter, PaginatedLettersResponse } from './letterTypes';

interface LetterState {
  letters: ILetter[];
  pageInfo: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchLetters: (
    page?: number,
    limit?: number,
    aprobada?: boolean,
    tema?: string
  ) => Promise<PaginatedLettersResponse | null>;
  moderateLetter: (id: string, aprobada: boolean) => Promise<boolean>;
  deleteLetter: (id: string) => Promise<boolean>;
  clearLetters: () => void;
}

export const useLetterStore = create<LetterState>((set) => ({
  letters: [],
  pageInfo: {
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
  },
  isLoading: false,
  error: null,

  fetchLetters: async (page = 1, limit = 9, aprobada = false, tema = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await letterApi.getAdminLetters(page, limit, aprobada, tema);
      set({
        letters: response.data || [],
        pageInfo: response.info || { currentPage: page, totalPages: 1, totalElements: 0 },
        isLoading: false,
      });
      return response;
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || 'Error al obtener las cartas';
      set({ error: message, isLoading: false, letters: [] });
      toast.error(message);
      return null;
    }
  },

  moderateLetter: async (id: string, aprobada: boolean) => {
    set({ isLoading: true, error: null });
    try {
      await letterApi.moderateLetter(id, { aprobada });
      toast.success(
        aprobada
          ? 'Carta aprobada exitosamente'
          : 'Carta desaprobada (oculta del sitio público)'
      );
      set((state) => ({
        letters: state.letters.filter((l) => l.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || 'Error al moderar la carta';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  deleteLetter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await letterApi.deleteLetter(id);
      toast.success('Carta eliminada exitosamente');
      set((state) => ({
        letters: state.letters.filter((l) => l.id !== id),
        pageInfo: {
          ...state.pageInfo,
          totalElements: Math.max(state.pageInfo.totalElements - 1, 0),
        },
        isLoading: false,
      }));
      return true;
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || 'Error al eliminar la carta';
      set({ error: message, isLoading: false });
      toast.error(message);
      return false;
    }
  },

  clearLetters: () => {
    set({
      letters: [],
      pageInfo: { currentPage: 1, totalPages: 1, totalElements: 0 },
      error: null,
    });
  },
}));

