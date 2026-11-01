import { useState, type FormEvent } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { configApi } from '../configApi';
import { toast } from '../../../../shared/toast/toastManager';
import type { CreateClientResult } from '../configTypes';

interface CreateClientModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateClientModal = ({ show, onClose, onSuccess }: CreateClientModalProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<CreateClientResult | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setName('');
    setUrl('');
    setIsLoading(false);
    setCreatedResult(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      toast.warning('Complete todos los campos requeridos', 'Campos incompletos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await configApi.createClient({
        name: name.trim(),
        url: url.trim(),
      });
      setCreatedResult(result);
      toast.success(`Cliente "${result.name}" registrado con éxito`);
      onSuccess();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al registrar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (createdResult?.apiKey) {
      navigator.clipboard.writeText(createdResult.apiKey);
      setCopied(true);
      toast.success('API Key copiada al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          {createdResult ? '🎉 Cliente Creado Exitosamente' : '➕ Registrar Nuevo Cliente'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {createdResult ? (
          <div>
            <Alert variant="warning" className="border-warning-subtle">
              <div className="fw-semibold mb-1">⚠️ ¡Importante! Guarde esta clave ahora</div>
              <small>
                Esta es la única vez que se mostrará la clave secreta de la API Key. Cópiela y resguárdela en un lugar seguro.
              </small>
            </Alert>

            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold">Nombre del Cliente:</label>
              <div className="fw-bold">{createdResult.name}</div>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold">API Key Generada:</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control font-monospace bg-body-tertiary"
                  value={createdResult.apiKey}
                  readOnly
                />
                <Button
                  variant={copied ? 'success' : 'primary'}
                  onClick={handleCopyKey}
                >
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Nombre del Cliente / Empresa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. MiServicioApp o usuario@dominio.com"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">URL del Cliente</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                URL o dominio autorizado para este cliente.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrar Cliente'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>

      {createdResult && (
        <Modal.Footer>
          <Button variant="outline-primary" size="sm" onClick={handleClose}>
            Entendido, cerrar
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};
