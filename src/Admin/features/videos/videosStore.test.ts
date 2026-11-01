import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useVideosStore } from './videosStore';
import { videosApi } from './videosApi';
import type { IVideoGroup, SingleVideoGroupResponse } from './videosTypes';

describe('videosStore (Zustand)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useVideosStore.getState().clearAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicia con estado inicial vacío', () => {
    const state = useVideosStore.getState();
    expect(state.videoGroups).toEqual([]);
    expect(state.paginationInfo).toBeNull();
    expect(state.selectedGroup).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchVideoGroups obtiene grupos paginados y actualiza el store', async () => {
    const mockResponse: SingleVideoGroupResponse = {
      info: { page: 1, limit: 3, totalPages: 2 },
      data: [
        {
          id: 'vg-1',
          title: 'Grupo 1',
          description: 'Desc 1',
          productId: 'prod-1',
          enabled: true,
        },
      ],
    };

    vi.spyOn(videosApi, 'getAllGroups').mockResolvedValue(mockResponse);

    const result = await useVideosStore.getState().fetchVideoGroups(1, 3);

    expect(result).toEqual(mockResponse.data);
    expect(useVideosStore.getState().videoGroups).toEqual(mockResponse.data);
    expect(useVideosStore.getState().paginationInfo).toEqual(mockResponse.info);
    expect(useVideosStore.getState().isLoading).toBe(false);
  });

  it('fetchGroupById obtiene grupo por ID y actualiza selectedGroup', async () => {
    const mockGroup: IVideoGroup = {
      id: 'vg-1',
      title: 'Grupo 1',
      description: 'Desc 1',
      productId: 'prod-1',
      enabled: true,
      videos: [
        {
          id: 'v-1',
          videoGroupId: 'vg-1',
          name: 'Video Demo',
          youTubeId: 'dQw4w9WgXcQ',
          enabled: true,
        },
      ],
    };

    vi.spyOn(videosApi, 'getGroupById').mockResolvedValue(mockGroup);

    const result = await useVideosStore.getState().fetchGroupById('vg-1');

    expect(result).toEqual(mockGroup);
    expect(useVideosStore.getState().selectedGroup).toEqual(mockGroup);
  });

  it('createGroup llama a videosApi.createGroup y actualiza lista', async () => {
    const createData = {
      title: 'Nuevo Grupo',
      description: 'Desc',
      productId: 'prod-1',
      videos: [{ name: 'V1', youTubeId: 'dQw4w9WgXcQ' }],
    };

    const created: IVideoGroup = {
      id: 'vg-new',
      ...createData,
      enabled: true,
      videos: [
        {
          id: 'v-1',
          videoGroupId: 'vg-new',
          name: 'V1',
          youTubeId: 'dQw4w9WgXcQ',
          enabled: true,
        },
      ],
    };

    vi.spyOn(videosApi, 'createGroup').mockResolvedValue(created);

    const result = await useVideosStore.getState().createGroup(createData);

    expect(result).toEqual(created);
    expect(useVideosStore.getState().videoGroups[0]).toEqual(created);
  });

  it('deleteGroup elimina de la lista y limpia selectedGroup', async () => {
    useVideosStore.setState({
      videoGroups: [
        { id: 'vg-1', title: 'G1', description: 'D1', productId: 'p1', enabled: true },
      ],
      selectedGroup: {
        id: 'vg-1',
        title: 'G1',
        description: 'D1',
        productId: 'p1',
        enabled: true,
        videos: [],
      },
    });

    vi.spyOn(videosApi, 'deleteGroup').mockResolvedValue('Eliminado');

    const success = await useVideosStore.getState().deleteGroup('vg-1');

    expect(success).toBe(true);
    expect(useVideosStore.getState().videoGroups).toHaveLength(0);
    expect(useVideosStore.getState().selectedGroup).toBeNull();
  });

  it('createVideo añade un video al selectedGroup', async () => {
    useVideosStore.setState({
      selectedGroup: {
        id: 'vg-1',
        title: 'G1',
        description: 'D1',
        productId: 'p1',
        enabled: true,
        videos: [],
      },
    });

    const newVideo = {
      id: 'v-10',
      videoGroupId: 'vg-1',
      name: 'Video 10',
      youTubeId: 'abc12345678',
      enabled: true,
    };

    vi.spyOn(videosApi, 'createVideo').mockResolvedValue(newVideo);

    const result = await useVideosStore.getState().createVideo({
      videoGroupId: 'vg-1',
      name: 'Video 10',
      youTubeId: 'abc12345678',
    });

    expect(result).toEqual(newVideo);
    expect(useVideosStore.getState().selectedGroup?.videos).toContainEqual(newVideo);
  });

  it('deleteVideo remueve un video del selectedGroup', async () => {
    const existingVideo = {
      id: 'v-10',
      videoGroupId: 'vg-1',
      name: 'Video 10',
      youTubeId: 'abc12345678',
      enabled: true,
    };

    useVideosStore.setState({
      selectedGroup: {
        id: 'vg-1',
        title: 'G1',
        description: 'D1',
        productId: 'p1',
        enabled: true,
        videos: [existingVideo],
      },
    });

    vi.spyOn(videosApi, 'deleteVideo').mockResolvedValue('Eliminado');

    const success = await useVideosStore.getState().deleteVideo('v-10');

    expect(success).toBe(true);
    expect(useVideosStore.getState().selectedGroup?.videos).toHaveLength(0);
  });
});
