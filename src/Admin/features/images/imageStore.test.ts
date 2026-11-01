import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useImageStore } from './imageStore';
import { imagesApi } from './imagesApi';

describe('imageStore (Zustand)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useImageStore.getState().clearImages();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicia con imágenes vacías y sin estado de carga', () => {
    const state = useImageStore.getState();
    expect(state.images).toEqual([]);
    expect(state.pagination).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isUploading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchImages obtiene el listado y actualiza el store', async () => {
    const mockResponse = {
      info: { total: 2, currentPage: 1, totalPages: 1, limit: 10 },
      data: [
        { id: 'img-1', imageUrl: 'http://test.com/1.jpg' },
        { id: 'img-2', imageUrl: 'http://test.com/2.jpg' },
      ],
    };

    vi.spyOn(imagesApi, 'getAll').mockResolvedValue(mockResponse);

    const result = await useImageStore.getState().fetchImages({ page: 1, limit: 10 });

    expect(result).toEqual(mockResponse.data);
    expect(useImageStore.getState().images).toEqual(mockResponse.data);
    expect(useImageStore.getState().pagination).toEqual(mockResponse.info);
    expect(useImageStore.getState().isLoading).toBe(false);
    expect(imagesApi.getAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('uploadImage sube archivo y refresca el listado', async () => {
    const mockFile = new File(['dummy'], 'photo.png', { type: 'image/png' });
    vi.spyOn(imagesApi, 'upload').mockResolvedValue({ url: 'http://test.com/photo.png' });
    vi.spyOn(imagesApi, 'getAll').mockResolvedValue({
      info: { total: 1, currentPage: 1, totalPages: 1 },
      data: [{ id: 'img-new', imageUrl: 'http://test.com/photo.png' }],
    });

    const url = await useImageStore.getState().uploadImage(mockFile);

    expect(url).toBe('http://test.com/photo.png');
    expect(imagesApi.upload).toHaveBeenCalledWith(mockFile);
    expect(imagesApi.getAll).toHaveBeenCalled();
  });

  it('deleteImage elimina de la API y quita el elemento del estado', async () => {
    useImageStore.setState({
      images: [
        { id: 'img-1', imageUrl: 'http://test.com/1.jpg' },
        { id: 'img-2', imageUrl: 'http://test.com/2.jpg' },
      ],
      pagination: { total: 2, currentPage: 1 },
    });

    vi.spyOn(imagesApi, 'delete').mockResolvedValue(undefined);

    const success = await useImageStore.getState().deleteImage('img-1');

    expect(success).toBe(true);
    expect(imagesApi.delete).toHaveBeenCalledWith('img-1');
    expect(useImageStore.getState().images).toEqual([
      { id: 'img-2', imageUrl: 'http://test.com/2.jpg' },
    ]);
    expect(useImageStore.getState().pagination?.total).toBe(1);
  });

  it('clearImages restablece el estado', () => {
    useImageStore.setState({
      images: [{ id: 'img-1', imageUrl: 'http://test.com/1.jpg' }],
      pagination: { total: 1, currentPage: 1 },
      error: 'Error previo',
    });

    useImageStore.getState().clearImages();

    expect(useImageStore.getState().images).toEqual([]);
    expect(useImageStore.getState().pagination).toBeNull();
    expect(useImageStore.getState().error).toBeNull();
  });
});
