import { Modal, Button, Badge } from 'react-bootstrap';
import type { ILetter } from './letterTypes';

interface LetterDetailModalProps {
  show: boolean;
  onHide: () => void;
  letter: ILetter | null;
  onToggleApproval: (letter: ILetter) => void;
  onDelete: (id: string) => void;
}

export const LetterDetailModal = ({
  show,
  onHide,
  letter,
  onToggleApproval,
  onDelete,
}: LetterDetailModalProps) => {
  if (!letter) return null;

  const formattedDate = letter.createdAt
    ? new Date(letter.createdAt).toLocaleString()
    : 'No disponible';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 d-flex align-items-center gap-2">
          <span>Carta:</span>
          <Badge bg="secondary" className="fw-normal">
            {letter.tema || 'Sin Tema'}
          </Badge>
          <Badge bg={letter.aprobada ? 'success' : 'warning'} text={letter.aprobada ? undefined : 'dark'}>
            {letter.aprobada ? 'Aprobada' : 'Pendiente'}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3 p-3 bg-body-tertiary rounded-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted fw-semibold">Fecha de creación:</span>
            <span className="small text-body-secondary">{formattedDate}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted fw-semibold">ID:</span>
            <code className="text-secondary small font-monospace">{letter.id}</code>
          </div>
        </div>

        <div className="p-3 border rounded-3 bg-body" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {letter.mensaje}
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => {
            onHide();
            onDelete(letter.id);
          }}
        >
          🗑️ Eliminar Carta
        </Button>

        <div className="d-flex gap-2">
          <Button
            variant={letter.aprobada ? 'warning' : 'success'}
            size="sm"
            onClick={() => {
              onHide();
              onToggleApproval(letter);
            }}
          >
            {letter.aprobada ? 'Desaprobar Carta' : 'Aprobar Carta'}
          </Button>

          <Button variant="secondary" size="sm" onClick={onHide}>
            Cerrar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

