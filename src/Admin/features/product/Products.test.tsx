// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Products from './Products';
import { useProductStore } from './productStore';

describe('Products Component', () => {
  const mockProducts = [
    {
      id: 'prod-1',
      title: 'Sistema de Gestión',
      picture: 'https://test.com/prod1.jpg',
      logo: 'https://test.com/logo1.jpg',
      info_header: 'Plataforma para empresas',
      info_body: 'Descripción extensa',
      isAlive: true,
      url: 'https://app.com',
      enabled: true,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useProductStore.setState({
      products: mockProducts,
      isLoading: false,
      error: null,
      fetchProducts: vi.fn(),
    });
  });

  it('renderiza la lista de productos y enlace a detalles', () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByText('Catálogo de Productos')).not.toBeNull();
    expect(screen.getByText('Sistema de Gestión')).not.toBeNull();
    expect(screen.getByText('Plataforma para empresas')).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();

    const detailLink = screen.getByRole('link', { name: 'Ver detalles' }) as HTMLAnchorElement;
    expect(detailLink).not.toBeNull();
    expect(detailLink.getAttribute('href')).toBe('/admin/product/prod-1');
  });

  it('muestra mensaje cuando no hay productos registrados', () => {
    useProductStore.setState({
      products: [],
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByText(/No hay productos registrados en el sistema/i)).not.toBeNull();
  });
});
