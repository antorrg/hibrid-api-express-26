import { httpClient } from '../../../shared/api/api';
import type { GetImagesResponse, ImageQueries } from './imageTypes';

export const imagesApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const rawResponse = await httpClient.request<string | { url: string }>({
      url: '/images/upload',
      method: 'POST',
      body: formData,
    });

    const url = typeof rawResponse === 'string' ? rawResponse : rawResponse?.url;
    return { url };
  },

  getAll: async (params?: ImageQueries): Promise<GetImagesResponse> => {
    return await httpClient.request<GetImagesResponse>({
      url: '/images',
      method: 'GET',
      params: params ? (params as Record<string, string | number | boolean>) : undefined,
    });
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.request({
      url: `/images/${id}`,
      method: 'DELETE',
    });
  },
};
