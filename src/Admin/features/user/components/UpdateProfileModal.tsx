import { useState, useEffect, type FormEvent } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useUserStore } from '../userStore';
import SelectImages from '../../images/SelectImages/SelectImages';
import type { UserProfile } from '../userTypes';

type UpdateProfileModalProps = {
  show: boolean;
  user: UserProfile;
  onClose: () => void;
  onSuccess?: (updated: UserProfile) => void;
};

const UpdateProfileModal = ({ show, user, onClose, onSuccess }: UpdateProfileModalProps) => {
  const { updateUserProfile, isLoading } = useUserStore();

  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name || '');
  const [nickname, setNickname] = useState(user.nickname || '');
  const [picture, setPicture] = useState<string | null>(user.picture || null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setName(user.name || '');
      setNickname(user.nickname || '');
      setPicture(user.picture || null);
    }
  }, [user]);

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

    const updated = await updateUserProfile(user.id, {
      email: trimmedEmail,
      name: name.trim(),
      nickname: nickname.trim(),
      picture: picture || '',
    });

    if (updated) {
      onClose();
      if (onSuccess) onSuccess(updated);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">Actualizar Mi Perfil</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {validationError && (
            <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
              {validationError}
            </div>
          )}

          <div className="row">
            <div className="col-md-5 mb-4 mb-md-0 d-flex flex-column align-items-center">
              <Form.Label className="small fw-semibold text-body-secondary mb-2 text-center">
                Foto de Perfil
              </Form.Label>
              <SelectImages
                id="update-profile-picture-select"
                titleField="Subir foto:"
                value={picture}
                onChange={(newUrl) => setPicture(newUrl)}
              />
            </div>

            <div className="col-md-7">
              <Form.Group className="mb-3" controlId="profile-email">
                <Form.Label className="small fw-semibold text-body-secondary">
                  Correo Electrónico <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="profile-name">
                <Form.Label className="small fw-semibold text-body-secondary">
                  Nombre Completo
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="profile-nickname">
                <Form.Label className="small fw-semibold text-body-secondary">
                  Apodo / Nombre de Usuario
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: juanperez"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isLoading}
                />
              </Form.Group>
            </div>
          </div>
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
              'Guardar Perfil'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateProfileModal;
