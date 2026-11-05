import { httpClient } from '../../../shared/api/api';
import type {
  ILetter,
  PaginatedLettersResponse,
  ModerateLetterDTO,
} from './letterTypes';

export const letterApi = {
  getAdminLetters: async (
    page = 1,
    limit = 9,
    aprobada: boolean = false,
    tema?: string
  ): Promise<PaginatedLettersResponse> => {
    let url = `/letters/admin?page=${page}&limit=${limit}&aprobada=${aprobada}`;
    if (tema && tema.trim() !== '') {
      url += `&tema=${encodeURIComponent(tema.trim())}`;
    }

    return await httpClient.request<PaginatedLettersResponse>({
      url,
      method: 'GET',
    });
  },

  getById: async (id: string): Promise<ILetter> => {
    return await httpClient.request<ILetter>({
      url: `/letters/admin/${id}`,
      method: 'GET',
    });
  },

  moderateLetter: async (id: string, data: ModerateLetterDTO): Promise<ILetter> => {
    return await httpClient.request<ILetter>({
      url: `/letters/admin/${id}`,
      method: 'PATCH',
      payload: data,
    });
  },

  deleteLetter: async (id: string): Promise<string> => {
    return await httpClient.request<string>({
      url: `/letters/admin/${id}`,
      method: 'DELETE',
    });
  },
};

