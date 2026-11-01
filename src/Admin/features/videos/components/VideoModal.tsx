import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { extractYouTubeId, getYouTubeThumbnail } from '../videoUtils';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; youTubeId: string }) => Promise<void>;
  initialData?: { name: string; youTubeId: string } | null;
  title?: string;
  isSaving?: boolean;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'Gestionar Video',
  isSaving = false,
}) => {
  const [name, setName] = useState('');
  const [youTubeInput, setYouTubeInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setYouTubeInput(initialData.youTubeId || '');
    } else {
      setName('');
      setYouTubeInput('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const cleanId = extractYouTubeId(youTubeInput);
  const thumbnail = cleanId ? getYouTubeThumbnail(cleanId) : '';

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'El nombre o título del video es obligatorio.';
    }
    if (!youTubeInput.trim()) {
      errs.youTubeInput = 'Debes ingresar el ID o la URL del video de YouTube.';
    } else if (!cleanId) {
      errs.youTubeInput = 'No se pudo identificar un ID de YouTube válido.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      name: name.trim(),
      youTubeId: cleanId,
    });
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="border-secondary-subtle">
        <Modal.Title className="h5 fw-bold text-body-emphasis">{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-3">
          <div className="mb-3">
            <Form.Label htmlFor="video-name" className="fw-semibold text-body small">
              Título o Nombre del Video <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              id="video-name"
              type="text"
              placeholder="Ej: Demostración de arquitectura y dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
              disabled={isSaving}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </div>

          <div className="mb-3">
            <Form.Label htmlFor="video-youtube" className="fw-semibold text-body small">
              ID o Enlace de YouTube <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              id="video-youtube"
              type="text"
              placeholder="Ej: dQw4w9WgXcQ o https://www.youtube.com/watch?v=..."
              value={youTubeInput}
              onChange={(e) => setYouTubeInput(e.target.value)}
              isInvalid={!!errors.youTubeInput}
              disabled={isSaving}
            />
            <Form.Control.Feedback type="invalid">{errors.youTubeInput}</Form.Control.Feedback>
            <Form.Text className="text-body-secondary small">
              Puedes pegar el ID directo o el enlace completo de YouTube (incluso shorts o links compartidos).
            </Form.Text>
          </div>

          {cleanId && (
            <div className="card p-2 bg-body-tertiary border border-secondary-subtle rounded-3 mt-3">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={thumbnail}
                  alt="Miniatura YouTube"
                  className="rounded"
                  style={{ width: '100px', height: '56px', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="small">
                  <span className="text-body-secondary d-block">ID detectado:</span>
                  <strong className="text-body font-monospace">{cleanId}</strong>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-secondary-subtle">
          <Button variant="outline-secondary" onClick={onClose} disabled={isSaving} className="rounded-pill px-3">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving} className="rounded-pill px-4 fw-semibold">
            {isSaving ? 'Guardando...' : 'Guardar Video'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default VideoModal;
