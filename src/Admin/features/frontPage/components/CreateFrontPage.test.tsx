// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import CreateFrontPage from './CreateFrontPage';
import { useFrontPageStore } from '../frontPageStore';

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
        onClick={() => onChange('https://storage.googleapis.com/test/frontpage.jpg')}
      >
        Seleccionar imagen portada
      </button>
    </div>
  ),
}));

describe('CreateFrontPage Component', () => {
  const renderWithRouter = (initialUrl = '/admin/frontpage/create') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/frontpage/create',
          element: <CreateFrontPage />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useFrontPageStore.setState({
      frontPage: null,
      isLoading: false,
      error: null,
      fetchFrontPage: vi.fn(),
      createFrontPage: vi.fn(),
    });
  });

  it('renderiza el formulario de creación de portada', () => {
    renderWithRouter();

    expect(screen.getByText('Crear Portada Principal')).not.toBeNull();
    expect(screen.getByLabelText(/Título de la Portada/i)).not.toBeNull();
    expect(screen.getByLabelText(/Cabecera \/ Posicionamiento/i)).not.toBeNull();
    expect(screen.getByLabelText(/Descripción General/i)).not.toBeNull();
    expect(screen.getByTestId('select-image-frontpage-create-image')).not.toBeNull();
  });

  it('valida campos obligatorios si se intenta enviar vacío', async () => {
    renderWithRouter();

    const submitBtn = screen.getByRole('button', { name: /Guardar Portada/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('El título de la portada es obligatorio.')).not.toBeNull();
      expect(screen.getByText('La cabecera o información de posicionamiento es obligatoria.')).not.toBeNull();
      expect(screen.getByText('Debes seleccionar o subir una imagen para la portada.')).not.toBeNull();
      expect(screen.getByText('La descripción de la portada es obligatoria.')).not.toBeNull();
    });
  });

  it('envía los datos correctamente tras confirmar en el modal', async () => {
    const mockCreate = vi.fn().mockResolvedValue(true);
    useFrontPageStore.setState({
      createFrontPage: mockCreate,
    });

    renderWithRouter();

    // Rellenar campos
    fireEvent.change(screen.getByLabelText(/Título de la Portada/i), {
      target: { value: 'Mi Portada Web' },
    });
    fireEvent.change(screen.getByLabelText(/Cabecera \/ Posicionamiento/i), {
      target: { value: 'Soluciones Digitales' },
    });
    fireEvent.change(screen.getByLabelText(/Descripción General/i), {
      target: { value: 'Bienvenido a nuestro portal oficial.' },
    });

    // Seleccionar imagen
    fireEvent.click(screen.getByText('Seleccionar imagen portada'));

    // Clic en Guardar Portada (abre modal de confirmación)
    fireEvent.click(screen.getByRole('button', { name: /Guardar Portada/i }));

    // Modal de confirmación
    await waitFor(() => {
      expect(screen.getByText('¿Estás seguro de que deseas guardar la portada principal del sitio?')).not.toBeNull();
    });

    // Confirmar en el modal
    const confirmBtn = screen.getByRole('button', { name: 'Sí, guardar portada' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        title: 'Mi Portada Web',
        info_header: 'Soluciones Digitales',
        picture: 'https://storage.googleapis.com/test/frontpage.jpg',
        description: 'Bienvenido a nuestro portal oficial.',
      });
    });
  });
});
