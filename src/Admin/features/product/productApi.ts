import { httpClient } from '../../../shared/api/api';
import type {
  IProduct,
  IProductSummary,
  IVariantProduct,
  CreateProductDTO,
  UpdateProductDTO,
  CreateVariantDTO,
  UpdateVariantDTO,
} from './productTypes';

export const productApi = {
  getAll: async (): Promise<IProductSummary[]> => {
    return await httpClient.request<IProductSummary[]>({
      url: '/product',
      method: 'GET',
    });
  },

  getById: async (id: string): Promise<IProduct> => {
    return await httpClient.request<IProduct>({
      url: `/product/${id}`,
      method: 'GET',
    });
  },

  create: async (data: CreateProductDTO): Promise<IProduct> => {
    return await httpClient.request<IProduct>({
      url: '/product',
      method: 'POST',
      body: data,
    });
  },

  update: async (id: string, data: UpdateProductDTO): Promise<IProduct> => {
    return await httpClient.request<IProduct>({
      url: `/product/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  getVariantById: async (id: string): Promise<IVariantProduct> => {
    return await httpClient.request<IVariantProduct>({
      url: `/product/variant/${id}`,
      method: 'GET',
    });
  },

  createVariant: async (data: CreateVariantDTO): Promise<IVariantProduct> => {
    return await httpClient.request<IVariantProduct>({
      url: '/product/variant',
      method: 'POST',
      body: data,
    });
  },

  updateVariant: async (id: string, data: UpdateVariantDTO): Promise<IVariantProduct> => {
    return await httpClient.request<IVariantProduct>({
      url: `/product/variant/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  deleteProduct: async (id: string, saver = false): Promise<void> => {
    await httpClient.request({
      url: `/product/${id}`,
      method: 'DELETE',
      params: { saver },
    });
  },

  deleteVariant: async (id: string, saver = false): Promise<void> => {
    await httpClient.request({
      url: `/product/variant/${id}`,
      method: 'DELETE',
      params: { saver },
    });
  },
};
