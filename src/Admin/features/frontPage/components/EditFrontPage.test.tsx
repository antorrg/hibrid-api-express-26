// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import EditFrontPage from './EditFrontPage';
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
        onClick={() => onChange('https://storage.googleapis.com/test/new-frontpage.jpg')}
      >
        Cambiar imagen portada
      </button>
    </div>
  ),
}));

describe('EditFrontPage Component', () => {
  const mockFrontPage = {
    id: 'fp-999',
    title: 'Portada Inicial',
    info_header: 'Cabecera Inicial',
    description: 'Descripción Inicial',
    picture: 'https://storage.googleapis.com/test/initial.jpg',
    enabled: true,
  };

  const renderWithRouter = (initialUrl = '/admin/frontpage/edit') => {
    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          element: <div>Admin Page</div>,
        },
        {
          path: '/admin/frontpage/edit',
          element: <EditFrontPage />,
        },
      ],
      { initialEntries: [initialUrl] }
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useFrontPageStore.setState({
      frontPage: mockFrontPage,
      isLoading: false,
      error: null,
      fetchFrontPage: vi.fn(),
      updateFrontPage: vi.fn(),
    });
  });

  it('carga y muestra los valores actuales de la portada', async () => {
    renderWithRouter();

    expect(screen.getByText('Editar Portada Principal')).not.toBeNull();
    expect((screen.getByLabelText(/Título de la Portada/i) as HTMLInputElement).value).toBe('Portada Inicial');
    expect((screen.getByLabelText(/Cabecera \/ Posicionamiento/i) as HTMLInputElement).value).toBe('Cabecera Inicial');
    expect((screen.getByLabelText(/Descripción General/i) as HTMLTextAreaElement).value).toBe('Descripción Inicial');
    expect((screen.getByLabelText(/Portada Habilitada/i) as HTMLInputElement).checked).toBe(true);
  });

  it('muestra el switch de conservación de imagen anterior (saver) al reemplazar la imagen', async () => {
    renderWithRouter();

    // Antes de cambiar imagen, no se muestra el switch saver
    expect(screen.queryByLabelText(/Conservar imagen anterior en la galería/i)).toBeNull();

    // Cambiamos la imagen usando el mock
    fireEvent.click(screen.getByText('Cambiar imagen portada'));

    // Ahora debe aparecer el switch saver
    await waitFor(() => {
      expect(screen.getByLabelText(/Conservar imagen anterior en la galería/i)).not.toBeNull();
    });
  });

  it('envía los datos actualizados tras confirmación en el modal', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ ...mockFrontPage, title: 'Portada Modificada' });
    useFrontPageStore.setState({
      updateFrontPage: mockUpdate,
    });

    renderWithRouter();

    // Modificar título
    fireEvent.change(screen.getByLabelText(/Título de la Portada/i), {
      target: { value: 'Portada Modificada' },
    });

    // Guardar cambios
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    // Modal de confirmación
    await waitFor(() => {
      expect(screen.getByText('¿Estás seguro de que deseas guardar los cambios en la portada principal?')).not.toBeNull();
    });

    // Confirmar en el modal
    fireEvent.click(screen.getByRole('button', { name: 'Sí, actualizar portada' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        'fp-999',
        expect.objectContaining({
          title: 'Portada Modificada',
          info_header: 'Cabecera Inicial',
          description: 'Descripción Inicial',
          enabled: true,
          saver: false,
        })
      );
    });
  });
});
