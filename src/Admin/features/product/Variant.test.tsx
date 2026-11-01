// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import Variant from './Variant';
import { useProductStore } from './productStore';

describe('Variant Component (Detalle de Variante)', () => {
  const mockVariant = {
    id: 'var-999',
    productId: 'prod-123',
    picture: 'https://test.com/variant-photo.jpg',
    text: 'Detalle específico de la variante en color rojo metálico',
    enabled: true,
  };

  const renderWithRouter = (initialUrl = '/admin/product/prod-123/variant/var-999') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/product/:id',
          element: <div>Product Page</div>,
        },
        {
          path: '/admin/product/:productId/variant/:variantId',
          element: <Variant />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useProductStore.setState({
      selectedVariant: mockVariant,
      isLoading: false,
      error: null,
      fetchVariantById: vi.fn(),
    });
  });

  it('renderiza la foto, descripción y badges de la variante', () => {
    renderWithRouter();

    expect(screen.getByText('Variante de Producto')).not.toBeNull();
    expect(screen.getByText('Detalle específico de la variante en color rojo metálico')).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();

    const img = screen.getByAltText('Foto de la variante') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toBe('https://test.com/variant-photo.jpg');
  });

  it('ofrece botones de navegación para volver al producto y a los tabs', () => {
    renderWithRouter();

    expect(screen.getAllByRole('button', { name: /Volver al Producto/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Ir a Productos (Tabs)' })).not.toBeNull();
  });

  it('permite abrir el modal de confirmación y eliminar la variante', async () => {
    const deleteSpy = vi.fn().mockResolvedValue(true);
    useProductStore.setState({
      deleteVariant: deleteSpy,
    });

    renderWithRouter();

    const deleteBtn = screen.getByRole('button', { name: 'Eliminar variante' });
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/¿Estás seguro de que deseas eliminar permanentemente esta variante\?/i)).not.toBeNull();

    const confirmModalBtn = screen.getByRole('button', { name: 'Sí, eliminar' });
    fireEvent.click(confirmModalBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('var-999', 'prod-123');
    });
  });
});
