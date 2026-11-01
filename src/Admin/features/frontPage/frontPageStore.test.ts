import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFrontPageStore, isFrontPagePersisted } from './frontPageStore';
import { frontPageApi } from './frontPageApi';
import type { IFrontPage } from './frontPageTypes';

describe('frontPageStore (Zustand)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useFrontPageStore.getState().clearFrontPage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicia con estado inicial vacío', () => {
    const state = useFrontPageStore.getState();
    expect(state.frontPage).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('isFrontPagePersisted identifica correctamente si es fallback o persistido', () => {
    expect(isFrontPagePersisted(null)).toBe(false);
    expect(
      isFrontPagePersisted({
        id: 'mock-uuid',
        title: 'No title',
        info_header: 'Antorrg-software',
        picture: 'nopicture',
        description: 'no data yet',
        enabled: true,
      })
    ).toBe(false);
    expect(
      isFrontPagePersisted({
        id: 'real-uuid',
        title: 'Mi Portada Real',
        info_header: 'Header',
        picture: 'https://storage.googleapis.com/real.jpg',
        description: 'Descripción',
        enabled: true,
      })
    ).toBe(true);
  });

  it('fetchFrontPage obtiene datos de la portada y actualiza el store', async () => {
    const mockData: IFrontPage = {
      id: 'fp-1',
      title: 'Título Portada',
      info_header: 'Cabecera',
      description: 'Descripción de prueba',
      picture: 'https://images.com/pic.jpg',
      enabled: true,
    };

    vi.spyOn(frontPageApi, 'get').mockResolvedValue(mockData);

    const result = await useFrontPageStore.getState().fetchFrontPage();

    expect(result).toEqual(mockData);
    expect(useFrontPageStore.getState().frontPage).toEqual(mockData);
    expect(useFrontPageStore.getState().isLoading).toBe(false);
  });

  it('fetchFrontPage maneja errores correctamente', async () => {
    vi.spyOn(frontPageApi, 'get').mockRejectedValue(new Error('Fallo de red'));

    const result = await useFrontPageStore.getState().fetchFrontPage();

    expect(result).toBeNull();
    expect(useFrontPageStore.getState().frontPage).toBeNull();
    expect(useFrontPageStore.getState().error).toBe('Fallo de red');
    expect(useFrontPageStore.getState().isLoading).toBe(false);
  });

  it('createFrontPage llama a la API, refresca y actualiza estado', async () => {
    const createDto = {
      title: 'Nueva Portada',
      info_header: 'Cabecera',
      description: 'Desc',
      picture: 'https://images.com/new.jpg',
    };

    const persisted: IFrontPage = {
      id: 'new-id-123',
      ...createDto,
      enabled: true,
    };

    vi.spyOn(frontPageApi, 'create').mockResolvedValue({ message: 'FrontPage creada exitosamente' });
    vi.spyOn(frontPageApi, 'get').mockResolvedValue(persisted);

    const success = await useFrontPageStore.getState().createFrontPage(createDto);

    expect(success).toBe(true);
    expect(frontPageApi.create).toHaveBeenCalledWith(createDto);
    expect(useFrontPageStore.getState().frontPage).toEqual(persisted);
  });

  it('updateFrontPage actualiza el registro en la API y en el store', async () => {
    const updatedData: IFrontPage = {
      id: 'fp-1',
      title: 'Título Actualizado',
      info_header: 'Cabecera Actualizada',
      description: 'Desc Actualizada',
      picture: 'https://images.com/updated.jpg',
      enabled: false,
    };

    vi.spyOn(frontPageApi, 'update').mockResolvedValue(updatedData);

    const result = await useFrontPageStore.getState().updateFrontPage('fp-1', {
      title: 'Título Actualizado',
      enabled: false,
    });

    expect(result).toEqual(updatedData);
    expect(frontPageApi.update).toHaveBeenCalledWith('fp-1', {
      title: 'Título Actualizado',
      enabled: false,
    });
    expect(useFrontPageStore.getState().frontPage).toEqual(updatedData);
  });
});
