// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageSelector from './ImageSelector';
import { useImageStore } from '../imageStore';

describe('ImageSelector Component', () => {
  const mockImages = [
    { id: '1', imageUrl: 'https://test.com/img1.jpg' },
    { id: '2', imageUrl: 'https://test.com/img2.jpg' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    useImageStore.setState({
      images: mockImages,
      isLoading: false,
      error: null,
    });
  });

  it('muestra el dropdown y el label', () => {
    render(<ImageSelector onChange={vi.fn()} />);

    expect(screen.getByText('Seleccionar imagen guardada')).not.toBeNull();
    expect(screen.getByText('Elegir de la galería...')).not.toBeNull();
  });

  it('permite seleccionar una imagen del dropdown y llama a onChange', () => {
    const onChangeMock = vi.fn();
    render(<ImageSelector onChange={onChangeMock} />);

    // Abrir dropdown
    fireEvent.click(screen.getByText('Elegir de la galería...'));

    // Seleccionar la primera imagen
    const firstOption = screen.getByText('Imagen #1');
    fireEvent.click(firstOption);

    expect(onChangeMock).toHaveBeenCalledWith('https://test.com/img1.jpg');
    expect(screen.getByAltText('Seleccionada')).not.toBeNull();
  });

  it('muestra la imagen preseleccionada si se pasa en props', () => {
    render(<ImageSelector value="https://test.com/img2.jpg" onChange={vi.fn()} />);

    expect(screen.getByText('Imagen seleccionada')).not.toBeNull();
    const preview = screen.getByAltText('Seleccionada') as HTMLImageElement;
    expect(preview.src).toBe('https://test.com/img2.jpg');
  });

  it('permite limpiar la selección con el botón Quitar selección', () => {
    const onChangeMock = vi.fn();
    render(<ImageSelector value="https://test.com/img1.jpg" onChange={onChangeMock} />);

    const clearBtn = screen.getByRole('button', { name: 'Quitar selección' });
    fireEvent.click(clearBtn);

    expect(onChangeMock).toHaveBeenCalledWith(null);
    expect(screen.queryByAltText('Seleccionada')).toBeNull();
  });
});
