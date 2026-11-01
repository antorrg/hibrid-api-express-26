import React, { useRef, useEffect, useState, type MouseEvent } from 'react';

interface RichTextEditorProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isInvalid?: boolean;
}

/**
 * Determina si el contenido HTML está visualmente vacío (sin texto real).
 */
export const isRichTextEmpty = (html?: string | null): boolean => {//eslint-disable-line
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return stripped.length === 0;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  value = '',
  onChange,
  placeholder = 'Escriba el texto aquí...',
  className = '',
  isInvalid = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Sincroniza el HTML solo si el cambio proviene del exterior (evita el salto del cursor al escribir)
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const updateActiveStates = () => {
    try {
      setActiveStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      });
    } catch {
      // Ignorar errores de selección
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      const rawText = (editorRef.current.innerText || editorRef.current.textContent || '').trim();
      let content = editorRef.current.innerHTML;

      // Si no hay texto real o solo quedan etiquetas residuales, limpiar
      if (!rawText || content === '<br>' || content === '<p><br></p>' || content === '<div><br></div>') {
        content = '';
        if (editorRef.current.innerHTML !== '') {
          editorRef.current.innerHTML = '';
        }
      }

      onChange(content);
      updateActiveStates();
    }
  };

  // Manejo de pegado limpio: extrae solo texto plano para evitar estilos o etiquetas externas
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData('text/plain');
    if (plainText) {
      document.execCommand('insertText', false, plainText);
      handleInput();
    }
  };

  const executeCommand = (e: MouseEvent<HTMLButtonElement>, command: string, value: string | undefined = undefined) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // Ignorar
    }
  }, []);

  const handleClearContent = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      isInternalChangeRef.current = false;
      onChange('');
      updateActiveStates();
      editorRef.current.focus();
    }
  };

  const handleInsertParagraph = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertParagraph', false);
      handleInput();
    }
  };

  return (
    <div className={`rich-text-editor-container ${isInvalid ? 'is-invalid' : ''} ${className}`}>
      <div className="rich-text-toolbar" onMouseDown={(e) => e.preventDefault()}>
        <button
          type="button"
          className={`btn-toolbar-item ${activeStates.bold ? 'active' : ''}`}
          onClick={(e) => executeCommand(e, 'bold')}
          title="Negrita (Bold)"
          aria-label="Negrita"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          className={`btn-toolbar-item ${activeStates.italic ? 'active' : ''}`}
          onClick={(e) => executeCommand(e, 'italic')}
          title="Cursiva (Italic)"
          aria-label="Cursiva"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={`btn-toolbar-item ${activeStates.underline ? 'active' : ''}`}
          onClick={(e) => executeCommand(e, 'underline')}
          title="Subrayado (Underline)"
          aria-label="Subrayado"
        >
          <u>U</u>
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className="btn-toolbar-item"
          onClick={handleInsertParagraph}
          title="Punto Aparte (Nuevo Párrafo)"
          aria-label="Nuevo párrafo"
        >
          ↵ Párrafo
        </button>

        <button
          type="button"
          className="btn-toolbar-item text-danger border-0 ms-auto"
          onClick={handleClearContent}
          title="Borrar todo el texto"
          aria-label="Borrar todo"
        >
          ✕ Limpiar
        </button>
      </div>

      <div
        id={id}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        className="rich-text-input-area"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        onSelect={updateActiveStates}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
