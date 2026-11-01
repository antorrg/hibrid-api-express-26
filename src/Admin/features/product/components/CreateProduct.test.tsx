// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import CreateProduct from './CreateProduct';
import { useProductStore } from '../productStore';

// Mock SelectImages para facilitar pruebas de selección
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
        onClick={() => onChange('https://test.com/selected-image.jpg')}
      >
        Seleccionar imagen mock
      </button>
    </div>
  ),
}));

describe('CreateProduct Component', () => {
  const renderWithRouter = (initialUrl = '/admin/product/create') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/product/create',
          element: <CreateProduct />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useProductStore.setState({
      isLoading: false,
      error: null,
      createProduct: vi.fn(),
    });
  });

  it('renderiza el formulario de creación con todos los campos clave', () => {
    renderWithRouter();

    expect(screen.getByText('Creación de Producto')).not.toBeNull();
    expect(screen.getByLabelText(/Título del producto/i)).not.toBeNull();
    expect(screen.getByLabelText(/Información de cabecera/i)).not.toBeNull();
    expect(screen.getByLabelText(/Descripción detallada/i)).not.toBeNull();
    expect(screen.getByLabelText(/¿El proyecto está disponible online/i)).not.toBeNull();
    expect(screen.getByText(/Variantes \/ Ítems del Producto/i)).not.toBeNull();
  });

  it('valida campos obligatorios y muestra errores si se intenta enviar vacío', async () => {
    renderWithRouter();

    const submitBtn = screen.getByRole('button', { name: 'Crear Producto' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('El título del producto es obligatorio.')).not.toBeNull();
    expect(screen.getByText('Debes seleccionar o subir una imagen principal.')).not.toBeNull();
    expect(screen.getByText('La información de cabecera/posicionamiento es obligatoria.')).not.toBeNull();
  });

  it('muestra campo de URL solo cuando isAlive está activado', () => {
    renderWithRouter();

    // Inicialmente no está en vivo
    expect(screen.queryByLabelText(/URL externa del proyecto en producción/i)).toBeNull();
    expect(screen.getByText(/Proyecto sin despliegue online:/i)).not.toBeNull();

    // Activamos switch isAlive
    const isAliveSwitch = screen.getByLabelText(/¿El proyecto está disponible online/i);
    fireEvent.click(isAliveSwitch);

    // Ahora el campo URL debe estar visible
    expect(screen.getByLabelText(/URL externa del proyecto en producción/i)).not.toBeNull();
  });

  it('permite añadir y remover variantes dinámicamente', () => {
    renderWithRouter();

    expect(screen.getByText('Variante #1')).not.toBeNull();

    const addVariantBtn = screen.getByRole('button', { name: '+ Agregar Variante' });
    fireEvent.click(addVariantBtn);

    expect(screen.getByText('Variante #2')).not.toBeNull();

    const removeBtns = screen.getAllByRole('button', { name: 'Eliminar variante' });
    fireEvent.click(removeBtns[0]);

    // Debería quedar solo 1 variante
    expect(screen.queryByText('Variante #2')).toBeNull();
  });

  it('completa el formulario, abre modal de confirmación y llama a createProduct', async () => {
    const createSpy = vi.fn().mockResolvedValue({ id: 'new-id', title: 'Mi Nuevo Proyecto' });
    useProductStore.setState({ createProduct: createSpy });

    renderWithRouter();

    // Rellenamos título e información
    fireEvent.change(screen.getByLabelText(/Título del producto/i), {
      target: { value: 'Portfolio Personal v2' },
    });
    fireEvent.change(screen.getByLabelText(/Información de cabecera/i), {
      target: { value: 'Frontend moderno en React 19' },
    });
    fireEvent.change(screen.getByLabelText(/Descripción detallada/i), {
      target: { value: 'Detalle de la arquitectura del portfolio' },
    });

    // Simulamos selección de imagen principal
    const selectMainPicBtn = screen.getAllByRole('button', { name: 'Seleccionar imagen mock' })[0];
    fireEvent.click(selectMainPicBtn);

    // Hacemos submit para abrir ConfirmModal
    const submitBtn = screen.getByRole('button', { name: 'Crear Producto' });
    fireEvent.click(submitBtn);

    // Verificar modal abierto
    expect(screen.getByText(/¿Estás seguro de que deseas crear el producto "Portfolio Personal v2"?/i)).not.toBeNull();

    // Confirmar creación
    const confirmBtn = screen.getByRole('button', { name: 'Sí, crear producto' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Portfolio Personal v2',
          info_header: 'Frontend moderno en React 19',
          info_body: 'Detalle de la arquitectura del portfolio',
          picture: 'https://test.com/selected-image.jpg',
          isAlive: false,
          url: 'NoUrl',
        })
      );
    });
  });
});
