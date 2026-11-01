import { Modal, Button, Badge } from 'react-bootstrap';
import type { ILogger } from '../configTypes';

interface SystemLogDetailModalProps {
  show: boolean;
  onHide: () => void;
  log: ILogger | null;
}

export const SystemLogDetailModal = ({ show, onHide, log }: SystemLogDetailModalProps) => {
  if (!log) return null;

  const getBadgeColor = (levelName: string) => {
    switch (levelName.toUpperCase()) {
      case 'FATAL':
      case 'ERROR':
        return 'danger';
      case 'WARN':
        return 'warning';
      case 'INFO':
        return 'info';
      case 'DEBUG':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 d-flex align-items-center gap-2">
          <span>Detalles del Registro</span>
          <code className="text-secondary small font-monospace">#{log.id}</code>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <div className="p-3 bg-body-tertiary rounded-3">
              <div className="mb-2">
                <span className="text-muted small fw-semibold">Nivel:</span>{' '}
                <Badge bg={getBadgeColor(String(log.levelName))}>
                  {log.levelName} ({log.levelCode})
                </Badge>
              </div>
              <div className="mb-2">
                <span className="text-muted small fw-semibold">Fecha:</span>{' '}
                <span>{new Date(log.time).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted small fw-semibold">Protección (Keep):</span>{' '}
                <Badge bg={log.keep ? 'success' : 'secondary'}>
                  {log.keep ? '📌 Protegido' : 'No protegido'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="p-3 bg-body-tertiary rounded-3">
              <div className="mb-2">
                <span className="text-muted small fw-semibold">Host:</span>{' '}
                <code>{log.hostname || 'N/A'}</code>
              </div>
              <div className="mb-2">
                <span className="text-muted small fw-semibold">PID:</span>{' '}
                <code>{log.pid}</code>
              </div>
              {log.status && (
                <div className="mb-2">
                  <span className="text-muted small fw-semibold">Estado HTTP:</span>{' '}
                  <Badge bg="dark">{log.status}</Badge>
                </div>
              )}
              {log.type && (
                <div>
                  <span className="text-muted small fw-semibold">Tipo:</span>{' '}
                  <span className="badge bg-secondary-subtle text-secondary border">
                    {log.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-muted small fw-semibold">Mensaje:</label>
          <div className="p-3 bg-body-secondary rounded-3 border font-monospace small">
            {log.message}
          </div>
        </div>

        {log.stack && (
          <div className="mb-3">
            <label className="form-label text-muted small fw-semibold">Stack Trace:</label>
            <pre
              className="p-3 bg-dark text-light rounded-3 overflow-auto"
              style={{ maxHeight: '300px', fontSize: '0.8rem' }}
            >
              <code>{log.stack}</code>
            </pre>
          </div>
        )}

        {log.contexts && log.contexts.length > 0 && (
          <div className="mb-3">
            <label className="form-label text-muted small fw-semibold">Contextos adicionales:</label>
            <pre
              className="p-3 bg-body-tertiary rounded-3 border overflow-auto"
              style={{ maxHeight: '200px', fontSize: '0.8rem' }}
            >
              {JSON.stringify(log.contexts, null, 2)}
            </pre>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
