import { useState, useEffect, type FormEvent } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { configApi } from '../configApi';
import { toast } from '../../../../shared/toast/toastManager';
import type { IClientRecord } from '../configTypes';

interface EditClientModalProps {
  show: boolean;
  client: IClientRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditClientModal = ({ show, client, onClose, onSuccess }: EditClientModalProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.clientName || '');
      setUrl(client.clientUrl || '');
      setEnabled(client.clientEnabled !== false);
    }
  }, [client]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (!name.trim() || !url.trim()) {
      toast.warning('Complete todos los campos requeridos', 'Campos incompletos');
      return;
    }

    setIsLoading(true);
    try {
      await configApi.updateClient(client.clientId, {
        name: name.trim(),
        url: url.trim(),
        enabled,
      });
      toast.success('Cliente actualizado correctamente');
      onSuccess();
      onClose();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al actualizar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">✏️ Editar Cliente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Nombre del Cliente</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">URL del Cliente</Form.Label>
            <Form.Control
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="client-enabled-switch"
              label={enabled ? 'Cliente Habilitado (Activo)' : 'Cliente Deshabilitado (Inactivo)'}
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
