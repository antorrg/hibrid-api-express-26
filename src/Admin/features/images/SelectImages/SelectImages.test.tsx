// @vitest-environment jsdom
import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectImages from './SelectImages';

const FormWrapper = () => {
  const [picture, setPicture] = useState<string | null>(null);
  const [useImg, setUseImg] = useState<boolean>(false);

  return (
    <SelectImages
      value={picture}
      onChange={setPicture}
      useImg={useImg}
      onUseImgChange={setUseImg}
    />
  );
};

describe('SelectImages Component', () => {
  it('renderiza por defecto ImageUploader cuando useImg es false', () => {
    render(<FormWrapper />);

    expect(screen.getByText('Elegir imagen existente de la galería')).not.toBeNull();
    expect(screen.getByText('Imagen:')).not.toBeNull();
    expect(document.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('alterna a ImageSelector al activar el switch useImg', () => {
    render(<FormWrapper />);

    const switchInput = screen.getByRole('checkbox');
    expect(switchInput).not.toBeNull();

    // Activar switch para usar imagen guardada
    fireEvent.click(switchInput);

    expect(screen.getByText('Seleccionar imagen guardada')).not.toBeNull();
    expect(screen.queryByText('Imagen:')).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });
});
