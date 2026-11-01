import { httpClient } from '../../../shared/api/api';
import type {
  IFrontPage,
  CreateFrontPageDTO,
  UpdateFrontPageDTO,
} from './frontPageTypes';

export const frontPageApi = {
  get: async (): Promise<IFrontPage> => {
    return await httpClient.request<IFrontPage>({
      url: '/frontpage',
      method: 'GET',
    });
  },

  create: async (data: CreateFrontPageDTO): Promise<{ message: string }> => {
    return await httpClient.request<{ message: string }>({
      url: '/frontpage',
      method: 'POST',
      body: data,
    });
  },

  update: async (id: string, data: UpdateFrontPageDTO): Promise<IFrontPage> => {
    return await httpClient.request<IFrontPage>({
      url: `/frontpage/${id}`,
      method: 'PUT',
      body: data,
    });
  },
};
