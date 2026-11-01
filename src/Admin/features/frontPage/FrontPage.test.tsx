// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import FrontPage from './FrontPage';
import { useFrontPageStore } from './frontPageStore';

describe('FrontPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra estado vacío y botón para crear cuando no existe portada creada', () => {
    useFrontPageStore.setState({
      frontPage: {
        id: 'mock-uuid',
        title: 'No title',
        info_header: 'Antorrg-software',
        picture: 'nopicture',
        description: 'no data yet',
        enabled: true,
      },
      isLoading: false,
      error: null,
      fetchFrontPage: vi.fn(),
    });

    render(
      <MemoryRouter>
        <FrontPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Portada del Sitio')).not.toBeNull();
    expect(screen.getByText('Aún no se ha creado la portada')).not.toBeNull();
    expect(screen.getByRole('link', { name: '+ Crear Portada' })).not.toBeNull();
    // No debe haber botón de editar ni de eliminar
    expect(screen.queryByRole('link', { name: /Editar Portada/i })).toBeNull();
    expect(screen.queryByText(/Eliminar/i)).toBeNull();
  });

  it('renderiza la información completa de la portada existente y solo permite editar (sin opción a crear otra ni borrar)', () => {
    useFrontPageStore.setState({
      frontPage: {
        id: 'fp-123',
        title: 'Software Development & Design',
        info_header: 'Innovación tecnológica a tu alcance',
        picture: 'https://storage.googleapis.com/test-bucket/frontpage.jpg',
        description: 'Servicios de arquitectura de software cloud native y diseño UI/UX.',
        enabled: true,
      },
      isLoading: false,
      error: null,
      fetchFrontPage: vi.fn(),
    });

    render(
      <MemoryRouter>
        <FrontPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Software Development & Design')).not.toBeNull();
    expect(screen.getByText('Innovación tecnológica a tu alcance')).not.toBeNull();
    expect(screen.getByText(/Servicios de arquitectura de software cloud native/i)).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();
    expect(screen.getByText('Única portada del sistema')).not.toBeNull();

    // Debe existir botón de editar
    const editLinks = screen.getAllByRole('link', { name: /Editar Portada/i });
    expect(editLinks.length).toBeGreaterThan(0);
    expect(editLinks[0].getAttribute('href')).toBe('/admin/frontpage/edit');

    // No debe permitir crear otra ni eliminar
    expect(screen.queryByRole('link', { name: /\+ Crear Portada/i })).toBeNull();
    expect(screen.queryByText(/Eliminar/i)).toBeNull();
  });
});
