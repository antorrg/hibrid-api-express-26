// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichTextEditor, isRichTextEmpty } from './RichTextEditor';

describe('isRichTextEmpty helper', () => {
  it('detecta correctamente si un string HTML está vacío o solo contiene etiquetas', () => {
    expect(isRichTextEmpty(null)).toBe(true);
    expect(isRichTextEmpty(undefined)).toBe(true);
    expect(isRichTextEmpty('')).toBe(true);
    expect(isRichTextEmpty('   ')).toBe(true);
    expect(isRichTextEmpty('<p><br></p>')).toBe(true);
    expect(isRichTextEmpty('<div><span>&nbsp;</span></div>')).toBe(true);
    expect(isRichTextEmpty('<strong></strong>')).toBe(true);

    expect(isRichTextEmpty('<p>Hola mundo</p>')).toBe(false);
    expect(isRichTextEmpty('Texto simple')).toBe(false);
    expect(isRichTextEmpty('<b>A</b>')).toBe(false);
  });
});

describe('RichTextEditor Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.execCommand = vi.fn();
    document.queryCommandState = vi.fn().mockReturnValue(false);
  });

  it('renderiza la barra de herramientas y el área editable', () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Texto inicial</p>" onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Negrita' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Cursiva' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Subrayado' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Nuevo párrafo' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Borrar todo' })).not.toBeNull();

    const editor = screen.getByRole('textbox');
    expect(editor).not.toBeNull();
    expect(editor.innerHTML).toBe('<p>Texto inicial</p>');
  });

  it('ejecuta comandos al presionar los botones de formato', () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);

    const boldBtn = screen.getByRole('button', { name: 'Negrita' });
    fireEvent.click(boldBtn);
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);

    const italicBtn = screen.getByRole('button', { name: 'Cursiva' });
    fireEvent.click(italicBtn);
    expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);

    const underlineBtn = screen.getByRole('button', { name: 'Subrayado' });
    fireEvent.click(underlineBtn);
    expect(document.execCommand).toHaveBeenCalledWith('underline', false, undefined);
  });

  it('limpia todo el contenido al presionar el botón Limpiar', () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Texto a borrar</p>" onChange={onChange} />);

    const clearBtn = screen.getByRole('button', { name: 'Borrar todo' });
    fireEvent.click(clearBtn);

    const editor = screen.getByRole('textbox');
    expect(editor.innerHTML).toBe('');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('maneja el evento de pegado extrayendo texto plano para evitar estilos sucios', () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);

    const editor = screen.getByRole('textbox');

    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
    Object.assign(pasteEvent, {
      clipboardData: {
        getData: vi.fn().mockReturnValue('Texto pegado limpio'),
      },
    });

    editor.dispatchEvent(pasteEvent);

    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, 'Texto pegado limpio');
  });
});
