import { useState, useEffect, type FormEvent } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useUserStore } from '../userStore';
import type { UserProfile } from '../userTypes';
import { roleTranslate } from '../userTypes';

type UpgradeUserModalProps = {
  show: boolean;
  user: UserProfile;
  onClose: () => void;
  onSuccess?: (updated: UserProfile) => void;
};

const ROLES = ['USER', 'ADMIN'] as const;

const UpgradeUserModal = ({ show, user, onClose, onSuccess }: UpgradeUserModalProps) => {
  const { upgradeUser, isLoading } = useUserStore();

  const [role, setRole] = useState<string>(user.role || 'USER');
  const [enabled, setEnabled] = useState<boolean>(user.enabled ?? true);

  useEffect(() => {
    if (user) {
      setRole(user.role || 'USER');
      setEnabled(user.enabled ?? true);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const updated = await upgradeUser(user.id, {
      role,
      enabled,
    });

    if (updated) {
      onClose();
      if (onSuccess) onSuccess(updated);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">Gestionar Rol y Estado</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <div className="d-flex align-items-center gap-3 p-3 bg-body-tertiary rounded-3 mb-3 border border-secondary-subtle">
            <img
              src={user.picture || '/default-avatar.png'}
              alt={user.nickname || user.name}
              className="rounded-circle border"
              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.nickname || 'U');
              }}
            />
            <div>
              <div className="fw-bold text-body-emphasis">{user.name || user.nickname}</div>
              <div className="small text-body-secondary">{user.email}</div>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="upgrade-user-role">
            <Form.Label className="small fw-semibold text-body-secondary">Rol del Usuario</Form.Label>
            <Form.Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r} ({roleTranslate(r)})
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted small">
              Los administradores tienen acceso a la gestión de productos, imágenes y usuarios.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="upgrade-user-status">
            <Form.Label className="small fw-semibold text-body-secondary">Estado de Acceso</Form.Label>
            <Form.Select
              value={enabled ? 'true' : 'false'}
              onChange={(e) => setEnabled(e.target.value === 'true')}
              disabled={isLoading}
            >
              <option value="true">Activo (Habilitado para iniciar sesión)</option>
              <option value="false">Bloqueado (Acceso deshabilitado)</option>
            </Form.Select>
            <Form.Text className="text-muted small">
              Un usuario bloqueado no podrá autenticarse en el sistema.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end gap-2 border-top">
          <Button variant="outline-secondary" onClick={onClose} disabled={isLoading} className="rounded-pill px-3">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading} className="rounded-pill px-4">
            {isLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpgradeUserModal;
