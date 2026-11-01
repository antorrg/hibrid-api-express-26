// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewImages from './ViewImages';
import { useImageStore } from './imageStore';

describe('ViewImages Component', () => {
  const mockImages = [
    { id: 'img-uuid-1', imageUrl: 'https://test.com/photo1.jpg' },
    { id: 'img-uuid-2', imageUrl: 'https://test.com/photo2.jpg' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useImageStore.setState({
      images: mockImages,
      pagination: { total: 2, currentPage: 1, totalPages: 1 },
      isLoading: false,
      error: null,
      fetchImages: vi.fn(),
    });
  });

  it('renderiza el título de la galería y las imágenes almacenadas', () => {
    render(<ViewImages />);

    expect(screen.getByText('Galería de imágenes')).not.toBeNull();
    expect(screen.getByText(/Total de imágenes registradas: 2/i)).not.toBeNull();
    expect(screen.getByAltText('photo1.jpg')).not.toBeNull();
    expect(screen.getByAltText('photo2.jpg')).not.toBeNull();
  });

  it('muestra mensaje cuando la galería está vacía', () => {
    useImageStore.setState({
      images: [],
      pagination: { total: 0, currentPage: 1, totalPages: 1 },
      isLoading: false,
    });

    render(<ViewImages />);

    expect(screen.getByText(/No hay imágenes guardadas en el sistema/i)).not.toBeNull();
  });

  it('abre ConfirmModal al hacer clic en Eliminar y llama a deleteImage al confirmar', async () => {
    const deleteSpy = vi.fn().mockResolvedValue(true);
    useImageStore.setState({
      deleteImage: deleteSpy,
    });

    render(<ViewImages />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' });
    fireEvent.click(deleteButtons[0]);

    // Debe abrir el ConfirmModal
    expect(screen.getByText('¿Estás seguro de que deseas eliminar esta imagen permanentemente? Esta acción eliminará el archivo del almacenamiento.')).not.toBeNull();

    // Confirmar en el modal
    const confirmBtn = screen.getByRole('button', { name: 'Sí, eliminar' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('img-uuid-1');
    });
  });

  it('muestra controles de paginación si hay más de 1 página', () => {
    useImageStore.setState({
      images: mockImages,
      pagination: { total: 25, currentPage: 1, totalPages: 3 },
    });

    render(<ViewImages />);

    expect(screen.getByText('Página 1 de 3')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Anterior/i })).not.toBeNull();
    expect(screen.getByRole('button', { name: /Siguiente/i })).not.toBeNull();
  });
});
