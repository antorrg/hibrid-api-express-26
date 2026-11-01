// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUploader from './ImageUploader';
import { imagesApi } from '../imagesApi';

describe('ImageUploader Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza el campo con su título y el input file', () => {
    render(<ImageUploader titleField="Foto de perfil:" onChange={vi.fn()} />);

    expect(screen.getByText('Foto de perfil:')).not.toBeNull();
    const input = screen.getByLabelText ? screen.getByLabelText('Foto de perfil:') : document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
  });

  it('muestra la imagen existente cuando se proporciona un value', () => {
    render(
      <ImageUploader
        titleField="Foto:"
        value="https://test.com/preview.png"
        onChange={vi.fn()}
      />
    );

    const img = screen.getByAltText('Vista previa') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toBe('https://test.com/preview.png');
    expect(screen.getByText('Imagen actual')).not.toBeNull();
  });

  it('sube el archivo seleccionado llamando a imagesApi.upload y actualiza onChange', async () => {
    const onChangeMock = vi.fn();
    vi.spyOn(imagesApi, 'upload').mockResolvedValue({ url: 'https://test.com/uploaded.png' });

    render(<ImageUploader titleField="Foto:" onChange={onChangeMock} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(imagesApi.upload).toHaveBeenCalledWith(file);
      expect(onChangeMock).toHaveBeenCalledWith('https://test.com/uploaded.png');
    });

    expect(screen.getByText(/Imagen subida exitosamente/i)).not.toBeNull();
  });

  it('permite quitar la imagen seleccionada', () => {
    const onChangeMock = vi.fn();
    render(
      <ImageUploader
        titleField="Foto:"
        value="https://test.com/preview.png"
        onChange={onChangeMock}
      />
    );

    const removeBtn = screen.getByRole('button', { name: 'Quitar imagen' });
    fireEvent.click(removeBtn);

    expect(onChangeMock).toHaveBeenCalledWith(null);
    expect(screen.queryByAltText('Vista previa')).toBeNull();
  });
});
