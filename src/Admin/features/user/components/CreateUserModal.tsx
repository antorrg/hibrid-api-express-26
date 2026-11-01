import { useState, type FormEvent } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useUserStore } from '../userStore';
import type { UserProfile } from '../userTypes';

type CreateUserModalProps = {
  show: boolean;
  onClose: () => void;
  onSuccess?: (created: UserProfile) => void;
};

const CreateUserModal = ({ show, onClose, onSuccess }: CreateUserModalProps) => {
  const { createUser, isLoading } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setValidationError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError('El email es requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValidationError('Ingrese un correo electrónico válido');
      return;
    }

    if (!password || password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    const result = await createUser({
      email: trimmedEmail,
      password,
    });

    if (result) {
      handleClose();
      if (onSuccess) onSuccess(result);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">Crear Nuevo Usuario</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {validationError && (
            <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
              {validationError}
            </div>
          )}

          <Form.Group className="mb-3" controlId="create-user-email">
            <Form.Label className="small fw-semibold text-body-secondary">
              Correo Electrónico <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="create-user-password">
            <Form.Label className="small fw-semibold text-body-secondary">
              Contraseña <span className="text-danger">*</span>
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <i className={showPassword ? 'bi-svg bi-eye-slash' : 'bi-svg bi-eye'}></i>
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="create-user-confirm-password">
            <Form.Label className="small fw-semibold text-body-secondary">
              Confirmar Contraseña <span className="text-danger">*</span>
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
              >
                <i className={showConfirmPassword ? 'bi-svg bi-eye-slash' : 'bi-svg bi-eye'}></i>
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
                Creando...
              </>
            ) : (
              'Crear usuario'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
