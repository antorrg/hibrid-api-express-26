import { httpClient } from '../../../shared/api/api';
import type {
  IVideo,
  IVideoGroup,
  SingleVideoGroupResponse,
  VGQuery,
  CreateVideoGroupDTO,
  UpdateVideoGroupDTO,
  CreateVideoDTO,
  UpdateVideoDTO,
} from './videosTypes';

export const videosApi = {
  getAllGroups: async (query?: VGQuery): Promise<SingleVideoGroupResponse> => {
    return await httpClient.request<SingleVideoGroupResponse>({
      url: '/videos',
      method: 'GET',
      params: query,
    });
  },

  getGroupById: async (id: string): Promise<IVideoGroup> => {
    return await httpClient.request<IVideoGroup>({
      url: `/videos/${id}`,
      method: 'GET',
    });
  },

  createGroup: async (data: CreateVideoGroupDTO): Promise<IVideoGroup> => {
    return await httpClient.request<IVideoGroup>({
      url: '/videos',
      method: 'POST',
      body: data,
    });
  },

  updateGroup: async (id: string, data: UpdateVideoGroupDTO): Promise<IVideoGroup> => {
    return await httpClient.request<IVideoGroup>({
      url: `/videos/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  deleteGroup: async (id: string): Promise<string> => {
    return await httpClient.request<string>({
      url: `/videos/${id}`,
      method: 'DELETE',
    });
  },

  createVideo: async (data: CreateVideoDTO): Promise<IVideo> => {
    return await httpClient.request<IVideo>({
      url: '/videos/video',
      method: 'POST',
      body: data,
    });
  },

  updateVideo: async (id: string, data: UpdateVideoDTO): Promise<IVideo> => {
    return await httpClient.request<IVideo>({
      url: `/videos/${id}`,
      method: 'PATCH',
      body: data,
    });
  },

  deleteVideo: async (id: string): Promise<string> => {
    return await httpClient.request<string>({
      url: `/videos/${id}/video`,
      method: 'DELETE',
    });
  },
};
