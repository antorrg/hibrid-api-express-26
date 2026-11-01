import { httpClient } from '../../../shared/api/api';
import type {
  PaginatedClientsResponse,
  CreateClientPayload,
  CreateClientResult,
  UpdateClientPayload,
  IClientRecord,
  PaginatedLogsResponse,
  LogFilterParams,
  ILogger,
} from './configTypes';

export const configApi = {
  // Clients & API Keys
  getClients: async (page = 1, limit = 10): Promise<PaginatedClientsResponse> => {
    return await httpClient.request<PaginatedClientsResponse>({
      url: `/apiKey?page=${page}&limit=${limit}`,
      method: 'GET',
    });
  },

  getClientById: async (id: string): Promise<IClientRecord> => {
    return await httpClient.request<IClientRecord>({
      url: `/apiKey/${id}`,
      method: 'GET',
    });
  },

  createClient: async (data: CreateClientPayload): Promise<CreateClientResult> => {
    return await httpClient.request<CreateClientResult>({
      url: '/apiKey',
      method: 'POST',
      payload: data,
    });
  },

  updateClient: async (id: string, data: UpdateClientPayload): Promise<IClientRecord> => {
    return await httpClient.request<IClientRecord>({
      url: `/apiKey/${id}`,
      method: 'PUT',
      payload: data,
    });
  },

  deleteClient: async (id: string): Promise<string> => {
    return await httpClient.request<string>({
      url: `/apiKey/${id}`,
      method: 'DELETE',
    });
  },

  toggleApiKeyStatus: async (keyId: string, enabled: boolean): Promise<any> => {
    return await httpClient.request({
      url: `/apiKey/${keyId}`,
      method: 'PATCH',
      payload: { enabled },
    });
  },

  deleteApiKey: async (keyId: string): Promise<string> => {
    return await httpClient.request<string>({
      url: `/apiKey/${keyId}/apiKey`,
      method: 'DELETE',
    });
  },

  // System Logs
  getLogs: async (params: LogFilterParams = {}): Promise<PaginatedLogsResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);
    if (params.searchField) query.set('searchField', params.searchField);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    const res = await httpClient.request<{ message: string; data: PaginatedLogsResponse }>({
      url: `/logs${queryString ? `?${queryString}` : ''}`,
      method: 'GET',
    });
    return res.data;
  },

  toggleLogKeep: async (id: string, keep: boolean): Promise<ILogger> => {
    const res = await httpClient.request<{ message: string; data: ILogger }>({
      url: `/logs/${id}`,
      method: 'PATCH',
      payload: { keep },
    });
    return res.data;
  },

  deleteLog: async (id: string): Promise<string> => {
    const res = await httpClient.request<{ data: string }>({
      url: `/logs/${id}`,
      method: 'DELETE',
    });
    return res.data;
  },

  deleteAllLogs: async (): Promise<string> => {
    // Backend logRouter requires a UUID param before /clean: /:id/clean
    const dummyUuid = '00000000-0000-0000-0000-000000000000';
    const res = await httpClient.request<{ data: string }>({
      url: `/logs/${dummyUuid}/clean`,
      method: 'DELETE',
    });
    return res.data;
  },
};
