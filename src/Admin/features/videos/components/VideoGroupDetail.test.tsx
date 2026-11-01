// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import VideoGroupDetail from './VideoGroupDetail';
import { useVideosStore } from '../videosStore';

describe('VideoGroupDetail Component', () => {
  const mockGroup = {
    id: 'vg-500',
    title: 'Grupo de Tutoriales',
    description: 'Aprende a usar la plataforma paso a paso',
    productId: 'prod-xyz',
    enabled: true,
    videos: [
      {
        id: 'vid-1',
        videoGroupId: 'vg-500',
        name: 'Primeros Pasos',
        youTubeId: 'dQw4w9WgXcQ',
        enabled: true,
      },
    ],
  };

  const renderWithRouter = (initialUrl = '/admin/videos/vg-500') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/videos/:id',
          element: <VideoGroupDetail />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useVideosStore.setState({
      selectedGroup: mockGroup,
      isLoading: false,
      error: null,
      fetchGroupById: vi.fn().mockResolvedValue(mockGroup),
      updateGroup: vi.fn().mockResolvedValue(mockGroup),
      deleteGroup: vi.fn().mockResolvedValue(true),
      createVideo: vi.fn(),
      updateVideo: vi.fn(),
      deleteVideo: vi.fn().mockResolvedValue(true),
    });
  });

  it('renderiza datos del grupo y su lista de videos', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Datos del Grupo')).not.toBeNull();
      expect(screen.getByDisplayValue('Grupo de Tutoriales')).not.toBeNull();
      expect(screen.getByDisplayValue('Aprende a usar la plataforma paso a paso')).not.toBeNull();
      expect(screen.getByText('Primeros Pasos')).not.toBeNull();
      expect(screen.getByText('dQw4w9WgXcQ')).not.toBeNull();
    });
  });

  it('guarda los cambios del grupo al enviar el formulario', async () => {
    const mockUpdateGroup = vi.fn().mockResolvedValue(mockGroup);
    useVideosStore.setState({
      updateGroup: mockUpdateGroup,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Grupo de Tutoriales')).not.toBeNull();
    });

    fireEvent.change(screen.getByDisplayValue('Grupo de Tutoriales'), {
      target: { value: 'Grupo Modificado' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios del Grupo' }));

    await waitFor(() => {
      expect(mockUpdateGroup).toHaveBeenCalledWith(
        'vg-500',
        expect.objectContaining({
          title: 'Grupo Modificado',
          description: 'Aprende a usar la plataforma paso a paso',
          enabled: true,
        })
      );
    });
  });

  it('abre modal y permite añadir un video al grupo', async () => {
    const mockCreateVideo = vi.fn().mockResolvedValue({
      id: 'vid-2',
      videoGroupId: 'vg-500',
      name: 'Nuevo Video',
      youTubeId: 'abc12345678',
      enabled: true,
    });

    useVideosStore.setState({
      createVideo: mockCreateVideo,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ Agregar video/i })).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /\+ Agregar video/i }));

    // Modal se abre
    await waitFor(() => {
      expect(screen.getByText('Añadir Video al Grupo')).not.toBeNull();
    });

    fireEvent.change(screen.getByLabelText(/Título o Nombre del Video/i), {
      target: { value: 'Video Número 2' },
    });
    fireEvent.change(screen.getByLabelText(/ID o Enlace de YouTube/i), {
      target: { value: 'abc12345678' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Video' }));

    await waitFor(() => {
      expect(mockCreateVideo).toHaveBeenCalledWith({
        videoGroupId: 'vg-500',
        name: 'Video Número 2',
        youTubeId: 'abc12345678',
      });
    });
  });

  it('elimina un video individual tras confirmación', async () => {
    const mockDeleteVideo = vi.fn().mockResolvedValue(true);
    useVideosStore.setState({
      deleteVideo: mockDeleteVideo,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTitle('Eliminar video')).not.toBeNull();
    });

    fireEvent.click(screen.getByTitle('Eliminar video'));

    await waitFor(() => {
      expect(screen.getByText('¿Estás seguro de que deseas eliminar el video "Primeros Pasos"?')).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar video' }));

    await waitFor(() => {
      expect(mockDeleteVideo).toHaveBeenCalledWith('vid-1');
    });
  });
});
