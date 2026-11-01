// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import CreateVideoGroup from './CreateVideoGroup';
import { useVideosStore } from '../videosStore';
import { productApi } from '../../product/productApi';

describe('CreateVideoGroup Component', () => {
  const mockProduct = {
    id: 'prod-abc',
    title: 'Producto Alfa',
    info_header: 'Cabecera Alfa',
    info_body: 'Body Alfa',
    picture: 'https://test.com/alfa.jpg',
    logo: 'https://test.com/logo.jpg',
    isAlive: true,
    url: 'https://alfa.com',
    enabled: true,
  };

  const renderWithRouter = (initialUrl = '/admin/videos/create/prod-abc') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/videos/create/:productId',
          element: <CreateVideoGroup />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(productApi, 'getById').mockResolvedValue(mockProduct);
    useVideosStore.setState({
      isLoading: false,
      error: null,
      createGroup: vi.fn(),
    });
  });

  it('carga el producto asociado y renderiza el formulario con 1 video inicial obligatorio', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Crear Grupo de Videos/i)).not.toBeNull();
      expect(screen.getByText('prod-abc')).not.toBeNull();
    });

    expect(screen.getByLabelText(/Título del Grupo/i)).not.toBeNull();
    expect(screen.getByLabelText(/Descripción del Grupo/i)).not.toBeNull();
    expect(screen.getByText('Video #1')).not.toBeNull();
    expect(screen.queryByText('✕ Quitar')).toBeNull(); // No debe poder quitarse si solo hay 1
  });

  it('permite añadir y quitar videos adicionales manteniendo al menos 1', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Video #1')).not.toBeNull();
    });

    // Añadir segundo video
    fireEvent.click(screen.getByRole('button', { name: /\+ Añadir otro video/i }));

    expect(screen.getByText('Video #2')).not.toBeNull();

    // Ahora sí debe haber botón para quitar
    const removeButtons = screen.getAllByRole('button', { name: /✕ Quitar/i });
    expect(removeButtons).toHaveLength(2);

    // Quitar el segundo
    fireEvent.click(removeButtons[1]);

    expect(screen.queryByText('Video #2')).toBeNull();
    expect(screen.queryByText('✕ Quitar')).toBeNull();
  });

  it('valida campos obligatorios y envía correctamente tras confirmación', async () => {
    const mockCreateGroup = vi.fn().mockResolvedValue({ id: 'vg-new' });
    useVideosStore.setState({
      createGroup: mockCreateGroup,
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByLabelText(/Título del Grupo/i)).not.toBeNull();
    });

    // Llenar campos
    fireEvent.change(screen.getByLabelText(/Título del Grupo/i), {
      target: { value: 'Videos Oficiales' },
    });
    fireEvent.change(screen.getByLabelText(/Descripción del Grupo/i), {
      target: { value: 'Descripción de prueba' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej: Tour de la interfaz'), {
      target: { value: 'Video Demo 1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej: dQw4w9WgXcQ o https://youtu.be/...'), {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    // Clic en Guardar Grupo
    fireEvent.click(screen.getByRole('button', { name: /Guardar Grupo de Videos/i }));

    // Modal de confirmación
    await waitFor(() => {
      expect(screen.getByText('¿Deseas crear este grupo con 1 video(s) para el producto "Producto Alfa"?')).not.toBeNull();
    });

    // Confirmar en el modal
    fireEvent.click(screen.getByRole('button', { name: 'Sí, crear grupo' }));

    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith({
        title: 'Videos Oficiales',
        description: 'Descripción de prueba',
        productId: 'prod-abc',
        videos: [
          {
            name: 'Video Demo 1',
            youTubeId: 'dQw4w9WgXcQ',
          },
        ],
      });
    });
  });
});
