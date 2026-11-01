// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Videos from './Videos';
import { useVideosStore } from './videosStore';

describe('Videos Component', () => {
  const mockGroups = [
    {
      id: 'vg-1',
      title: 'Demo de Gestión',
      description: 'Videos explicativos del sistema',
      productId: 'prod-123',
      enabled: true,
    },
    {
      id: 'vg-2',
      title: 'Demo Móvil',
      description: 'Videos en smartphones',
      productId: 'prod-456',
      enabled: false,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useVideosStore.setState({
      videoGroups: mockGroups,
      paginationInfo: { page: 1, limit: 3, totalPages: 1 },
      currentPage: 1,
      isLoading: false,
      error: null,
      fetchVideoGroups: vi.fn(),
      deleteGroup: vi.fn(),
    });
  });

  it('renderiza la lista de grupos de videos y botones de gestión', () => {
    render(
      <MemoryRouter>
        <Videos />
      </MemoryRouter>
    );

    expect(screen.getByText('Galería de Videos')).not.toBeNull();
    expect(screen.getByText('Demo de Gestión')).not.toBeNull();
    expect(screen.getByText('Demo Móvil')).not.toBeNull();
    expect(screen.getByText('ID Producto: prod-123')).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();
    expect(screen.getByText('Bloqueado')).not.toBeNull();

    const manageLinks = screen.getAllByRole('link', { name: /Ver \/ Gestionar videos/i });
    expect(manageLinks).toHaveLength(2);
    expect(manageLinks[0].getAttribute('href')).toBe('/admin/videos/vg-1');
  });

  it('muestra estado vacío si no hay grupos de videos', () => {
    useVideosStore.setState({
      videoGroups: [],
      paginationInfo: null,
    });

    render(
      <MemoryRouter>
        <Videos />
      </MemoryRouter>
    );

    expect(screen.getByText('No hay grupos de videos registrados')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Ir al Catálogo de Productos' })).not.toBeNull();
  });

  it('abre modal de confirmación y elimina un grupo', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true);
    useVideosStore.setState({
      deleteGroup: mockDelete,
    });

    render(
      <MemoryRouter>
        <Videos />
      </MemoryRouter>
    );

    const deleteButtons = screen.getAllByTitle('Eliminar grupo');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('¿Estás seguro de que deseas eliminar permanentemente el grupo "Demo de Gestión"?')).not.toBeNull();
    });

    const confirmBtn = screen.getByRole('button', { name: 'Sí, eliminar grupo' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('vg-1');
    });
  });
});
