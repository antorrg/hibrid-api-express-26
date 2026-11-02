import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAboutStore, isAboutPersisted } from './aboutStore';
import { aboutApi } from './aboutApi';
import type { IAbout } from './aboutTypes';

describe('aboutStore (Zustand)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAboutStore.getState().clearAbout();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('inicia con estado inicial vacío', () => {
    const state = useAboutStore.getState();
    expect(state.about).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('isAboutPersisted identifica correctamente si es fallback o persistido', () => {
    expect(isAboutPersisted(null)).toBe(false);
    expect(
      isAboutPersisted({
        id: 'mock-uuid',
        title: 'No title',
        picture: 'nopicture',
        text: 'no data yet',
        imgShow: false,
        enabled: true,
      })
    ).toBe(false);
    expect(
      isAboutPersisted({
        id: 'real-uuid',
        title: 'Nuestra Historia',
        picture: 'https://storage.googleapis.com/about.jpg',
        text: '<p>Historia institucional</p>',
        imgShow: true,
        enabled: true,
      })
    ).toBe(true);
    expect(
      isAboutPersisted({
        id: 'real-uuid-text-only',
        title: 'Nuestra Misión',
        picture: 'nopicture',
        text: '<p>Solo texto institucional</p>',
        imgShow: false,
        enabled: true,
      })
    ).toBe(true);
  });

  it('fetchAbout obtiene datos de la sección y actualiza el store', async () => {
    const mockData: IAbout = {
      id: 'about-1',
      title: 'Acerca de Nosotros',
      text: '<p>Contenido institucional</p>',
      picture: 'https://images.com/about.jpg',
      imgShow: true,
      enabled: true,
    };

    vi.spyOn(aboutApi, 'get').mockResolvedValue(mockData);

    const result = await useAboutStore.getState().fetchAbout();

    expect(result).toEqual(mockData);
    expect(useAboutStore.getState().about).toEqual(mockData);
    expect(useAboutStore.getState().isLoading).toBe(false);
  });

  it('fetchAbout maneja errores correctamente', async () => {
    vi.spyOn(aboutApi, 'get').mockRejectedValue(new Error('Fallo de red'));

    const result = await useAboutStore.getState().fetchAbout();

    expect(result).toBeNull();
    expect(useAboutStore.getState().about).toBeNull();
    expect(useAboutStore.getState().error).toBe('Fallo de red');
    expect(useAboutStore.getState().isLoading).toBe(false);
  });

  it('createAbout llama a la API, refresca y actualiza estado', async () => {
    const createDto = {
      title: 'Nuevo Acerca de',
      text: '<p>Texto de prueba</p>',
      picture: 'https://images.com/new.jpg',
      imgShow: true,
    };

    const persisted: IAbout = {
      id: 'new-about-123',
      ...createDto,
      enabled: true,
    };

    vi.spyOn(aboutApi, 'create').mockResolvedValue({ message: 'About creado exitosamente' });
    vi.spyOn(aboutApi, 'get').mockResolvedValue(persisted);

    const success = await useAboutStore.getState().createAbout(createDto);

    expect(success).toBe(true);
    expect(aboutApi.create).toHaveBeenCalledWith(createDto);
    expect(useAboutStore.getState().about).toEqual(persisted);
  });

  it('updateAbout actualiza el registro en la API y en el store', async () => {
    const updatedData: IAbout = {
      id: 'about-1',
      title: 'Título Actualizado',
      text: '<p>Texto actualizado</p>',
      picture: 'https://images.com/updated.jpg',
      imgShow: false,
      enabled: false,
    };

    vi.spyOn(aboutApi, 'update').mockResolvedValue(updatedData);

    const result = await useAboutStore.getState().updateAbout('about-1', {
      title: 'Título Actualizado',
      imgShow: false,
      enabled: false,
    });

    expect(result).toEqual(updatedData);
    expect(aboutApi.update).toHaveBeenCalledWith('about-1', {
      title: 'Título Actualizado',
      imgShow: false,
      enabled: false,
    });
    expect(useAboutStore.getState().about).toEqual(updatedData);
  });
});
