// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import EditVariant from './EditVariant';
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
        onClick={() => onChange('https://test.com/variant-new.jpg')}
      >
        Cambiar imagen variante mock
      </button>
    </div>
  ),
}));

describe('EditVariant Component', () => {
  const mockVariant = {
    id: 'var-456',
    productId: 'prod-123',
    picture: 'https://test.com/variant-old.jpg',
    text: 'Texto descriptivo variante',
    enabled: true,
  };

  const renderWithRouter = (
    initialUrl = '/admin/product/prod-123/variant/var-456/edit'
  ) => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/product/:productId/variant/:variantId',
          element: <div>Variant Detail</div>,
        },
        {
          path: '/admin/product/:productId/variant/:variantId/edit',
          element: <EditVariant />,
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
      updateVariant: vi.fn().mockResolvedValue(mockVariant),
    });
  });

  it('renderiza el formulario de edición de variante con datos precargados', () => {
    renderWithRouter();

    expect(screen.getByText('Editar Vista / Variante')).not.toBeNull();
    expect(screen.getByText('Texto descriptivo variante')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Guardar Cambios' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Cancelar' })).not.toBeNull();
  });

  it('muestra mensaje si la variante no fue encontrada', () => {
    useProductStore.setState({
      selectedVariant: null,
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText('Variante no encontrada')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Volver' })).not.toBeNull();
  });

  it('valida que el texto descriptivo sea obligatorio si se vacía', async () => {
    renderWithRouter();

    const clearBtn = screen.getByRole('button', { name: 'Borrar todo' });
    fireEvent.click(clearBtn);

    const submitBtn = screen.getByRole('button', { name: 'Guardar Cambios' });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('El texto descriptivo es obligatorio.')).not.toBeNull();
  });

  it('actualiza la variante y llama a updateVariant tras confirmar', async () => {
    const updateVariantMock = vi.fn().mockResolvedValue({
      ...mockVariant,
      text: 'Texto actualizado',
    });

    useProductStore.setState({
      updateVariant: updateVariantMock,
    });

    renderWithRouter();

    const editor = screen.getByRole('textbox');
    editor.innerHTML = 'Texto modificado exitosamente';
    fireEvent.input(editor);

    const submitBtn = screen.getByRole('button', { name: 'Guardar Cambios' });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Actualizar variante')).not.toBeNull();

    const confirmBtn = screen.getByRole('button', { name: 'Sí, guardar cambios' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(updateVariantMock).toHaveBeenCalledWith(
        'var-456',
        'prod-123',
        expect.objectContaining({
          picture: 'https://test.com/variant-old.jpg',
          text: 'Texto modificado exitosamente',
          enabled: true,
          saver: false,
        })
      );
    });
  });
});
