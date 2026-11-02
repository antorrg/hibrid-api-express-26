import { httpClient } from '../../../shared/api/api';
import type {
  IAbout,
  CreateAboutDTO,
  UpdateAboutDTO,
} from './aboutTypes';

export const aboutApi = {
  get: async (): Promise<IAbout> => {
    return await httpClient.request<IAbout>({
      url: '/about',
      method: 'GET',
    });
  },

  create: async (data: CreateAboutDTO): Promise<{ message: string }> => {
    return await httpClient.request<{ message: string }>({
      url: '/about',
      method: 'POST',
      body: data,
    });
  },

  update: async (id: string, data: UpdateAboutDTO): Promise<IAbout> => {
    return await httpClient.request<IAbout>({
      url: `/about/${id}`,
      method: 'PUT',
      body: data,
    });
  },
};
