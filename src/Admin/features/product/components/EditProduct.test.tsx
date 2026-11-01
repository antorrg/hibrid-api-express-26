// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import EditProduct from './EditProduct';
import { useProductStore } from '../productStore';

vi.mock('../../images/SelectImages/SelectImages', () => ({
  default: ({
    titleField,
    onChange,
    id,
  }: {
    titleField?: string;
    onChange: (val: string | null) => void;
    id?: string;
  }) => (
    <div data-testid={`select-image-${id}`}>
      <span>{titleField}</span>
      <button
        type="button"
        onClick={() => onChange('https://test.com/new-image.jpg')}
      >
        Cambiar imagen mock
      </button>
    </div>
  ),
}));

describe('EditProduct Component', () => {
  const mockProduct = {
    id: 'prod-123',
    title: 'Producto Original',
    picture: 'https://test.com/original.jpg',
    logo: 'https://test.com/logo.jpg',
    info_header: 'Cabecera Original',
    info_body: 'Cuerpo descriptivo',
    isAlive: true,
    url: 'https://original.com',
    enabled: true,
    variants: [],
  };

  const renderWithRouter = (initialUrl = '/admin/product/prod-123/edit') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/product/:id',
          element: <div>Product Detail</div>,
        },
        {
          path: '/admin/product/:id/edit',
          element: <EditProduct />,
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
      updateProduct: vi.fn().mockResolvedValue(mockProduct),
    });
  });

  it('renderiza el formulario de edición con los datos precargados', () => {
    renderWithRouter();

    expect(screen.getByText('Editar Producto')).not.toBeNull();
    expect(screen.getByDisplayValue('Producto Original')).not.toBeNull();
    expect(screen.getByDisplayValue('Cabecera Original')).not.toBeNull();
    expect(screen.getByDisplayValue('Cuerpo descriptivo')).not.toBeNull();
    expect(screen.getByDisplayValue('https://original.com')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Guardar Cambios' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Cancelar' })).not.toBeNull();
  });

  it('muestra mensaje si el producto no existe', () => {
    useProductStore.setState({
      selectedProduct: null,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText('Producto no encontrado')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Volver a la lista' })).not.toBeNull();
  });

  it('valida campos requeridos al vaciar el título', async () => {
    renderWithRouter();

    const titleInput = screen.getByDisplayValue('Producto Original');
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: 'Guardar Cambios' });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('El título del producto es obligatorio.')).not.toBeNull();
  });

  it('envía los datos actualizados tras confirmar en el modal', async () => {
    const updateProductMock = vi.fn().mockResolvedValue({
      ...mockProduct,
      title: 'Producto Editado',
    });
    useProductStore.setState({
      updateProduct: updateProductMock,
    });

    renderWithRouter();

    // Modificamos el título
    const titleInput = screen.getByDisplayValue('Producto Original');
    fireEvent.change(titleInput, { target: { value: 'Producto Editado' } });

    // Clic en Guardar Cambios
    const submitBtn = screen.getByRole('button', { name: 'Guardar Cambios' });
    fireEvent.click(submitBtn);

    // Modal de confirmación debe abrirse
    expect(await screen.findByText('Actualizar producto')).not.toBeNull();

    const confirmBtn = screen.getByRole('button', { name: 'Sí, guardar cambios' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalledWith(
        'prod-123',
        expect.objectContaining({
          title: 'Producto Editado',
          picture: 'https://test.com/original.jpg',
          info_header: 'Cabecera Original',
          isAlive: true,
          url: 'https://original.com',
          enabled: true,
          saver: false,
        })
      );
    });
  });
});
