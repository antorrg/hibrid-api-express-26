import { useState, type FormEvent } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useUserStore } from '../userStore';

type ChangePasswordModalProps = {
  show: boolean;
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const ChangePasswordModal = ({ show, userId, onClose, onSuccess }: ChangePasswordModalProps) => {
  const { changePassword, isLoading } = useUserStore();

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setValidationError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!password) {
      setValidationError('Debe ingresar su contraseña actual');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setValidationError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Las nuevas contraseñas no coinciden');
      return;
    }

    if (newPassword === password) {
      setValidationError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    const success = await changePassword({
      id: userId,
      password,
      newPassword,
    });

    if (success) {
      handleClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">Cambiar Contraseña</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {validationError && (
            <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
              {validationError}
            </div>
          )}

          <Form.Group className="mb-3" controlId="change-pwd-current">
            <Form.Label className="small fw-semibold text-body-secondary">
              Contraseña actual <span className="text-danger">*</span>
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showCurrent ? 'text' : 'password'}
                placeholder="Ingrese contraseña actual"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                tabIndex={-1}
                aria-label={showCurrent ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <i className={showCurrent ? 'bi-svg bi-eye-slash' : 'bi-svg bi-eye'}></i>
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="change-pwd-new">
            <Form.Label className="small fw-semibold text-body-secondary">
              Nueva contraseña <span className="text-danger">*</span>
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showNew ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowNew((p) => !p)}
                tabIndex={-1}
                aria-label={showNew ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <i className={showNew ? 'bi-svg bi-eye-slash' : 'bi-svg bi-eye'}></i>
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="change-pwd-confirm">
            <Form.Label className="small fw-semibold text-body-secondary">
              Confirmar nueva contraseña <span className="text-danger">*</span>
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repita la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Ocultar confirmación' : 'Ver confirmación'}
              >
                <i className={showConfirm ? 'bi-svg bi-eye-slash' : 'bi-svg bi-eye'}></i>
              </Button>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end gap-2 border-top">
          <Button variant="outline-secondary" onClick={handleClose} disabled={isLoading} className="rounded-pill px-3">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading} className="rounded-pill px-4">
            {isLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Actualizando...
              </>
            ) : (
              'Guardar contraseña'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
