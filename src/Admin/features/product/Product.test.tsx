// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import Product from './Product';
import { useProductStore } from './productStore';

describe('Product Component (Detalle de Producto)', () => {
  const mockProduct = {
    id: 'prod-123',
    title: 'Producto Premium',
    picture: 'https://test.com/picture.jpg',
    logo: 'https://test.com/logo.png',
    info_header: 'Resumen destacado',
    info_body: 'Cuerpo descriptivo completo',
    isAlive: true,
    url: 'https://externo.com',
    enabled: true,
    variants: [
      {
        id: 'var-999',
        productId: 'prod-123',
        picture: 'https://test.com/variant.jpg',
        text: 'Variante de prueba color azul',
        enabled: true,
      },
    ],
  };

  const renderWithRouter = (initialUrl = '/admin/product/prod-123') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/product/:id',
          element: <Product />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useProductStore.setState({
      selectedProduct: mockProduct,
      isLoading: false,
      error: null,
      fetchProductById: vi.fn(),
    });
  });

  it('renderiza la ficha técnica del producto y sus variantes', () => {
    renderWithRouter();

    expect(screen.getByText('Producto Premium')).not.toBeNull();
    expect(screen.getByText('Resumen destacado')).not.toBeNull();
    expect(screen.getByText('Cuerpo descriptivo completo')).not.toBeNull();
    expect(screen.getByText('Variantes del Producto')).not.toBeNull();
    expect(screen.getByText('Variante de prueba color azul')).not.toBeNull();

    const variantLink = screen.getByRole('link', { name: 'Ver variante' }) as HTMLAnchorElement;
    expect(variantLink).not.toBeNull();
    expect(variantLink.getAttribute('href')).toBe('/admin/product/prod-123/variant/var-999');
  });

  it('permite abrir el modal de confirmación y eliminar el producto', async () => {
    const deleteSpy = vi.fn().mockResolvedValue(true);
    useProductStore.setState({
      deleteProduct: deleteSpy,
    });

    renderWithRouter();

    const deleteBtn = screen.getByRole('button', { name: 'Eliminar producto' });
    fireEvent.click(deleteBtn);

    // Debe abrir ConfirmModal
    expect(screen.getByText(/¿Estás seguro de que deseas eliminar permanentemente el producto/i)).not.toBeNull();

    const confirmModalBtn = screen.getByRole('button', { name: 'Sí, eliminar producto' });
    fireEvent.click(confirmModalBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('prod-123');
    });
  });
});
