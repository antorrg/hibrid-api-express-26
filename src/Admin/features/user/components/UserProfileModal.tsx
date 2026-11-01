import { Modal, Button } from 'react-bootstrap';
import { booleanState } from '../../../../shared/utils/utils';
import { roleTranslate, type UserProfile } from '../userTypes';

type UserProfileModalProps = {
  show: boolean;
  user: UserProfile;
  onClose: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
};

const UserProfileModal = ({
  show,
  user,
  onClose,
  onEditProfile,
  onChangePassword,
}: UserProfileModalProps) => {
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">Mi Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="d-flex flex-column align-items-center mb-4">
          <img
            src={user.picture || '/default-avatar.png'}
            alt={user.nickname || user.name || 'Mi Avatar'}
            className="rounded-circle shadow-sm border p-1 bg-body-tertiary mb-3"
            style={{ width: '130px', height: '130px', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(user.name || user.nickname || 'U');
            }}
          />
          <h3 className="h4 fw-bold text-body-emphasis mb-1">
            {user.name && user.name !== 'Falta completar'
              ? user.name
              : user.nickname || 'Usuario'}
          </h3>
          <span className="text-body-secondary small">{user.email}</span>
        </div>

        <div className="bg-body-secondary rounded-3 p-3 p-md-4 mb-3 border border-secondary-subtle">
          <dl className="row mb-0 g-3">
            <dt className="col-sm-4 text-body-secondary">Email:</dt>
            <dd className="col-sm-8 text-body fw-medium">{user.email}</dd>

            <dt className="col-sm-4 text-body-secondary">Nombre:</dt>
            <dd className="col-sm-8 text-body">
              {user.name || <span className="text-body-secondary fst-italic">Sin nombre registrado</span>}
            </dd>

            <dt className="col-sm-4 text-body-secondary">Apodo:</dt>
            <dd className="col-sm-8 text-body">
              {user.nickname || <span className="text-body-secondary fst-italic">Sin apodo</span>}
            </dd>

            <dt className="col-sm-4 text-body-secondary">Rol:</dt>
            <dd className="col-sm-8">
              <span
                className={`badge ${
                  user.role === 'OWNER'
                    ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                    : user.role === 'ADMIN'
                      ? 'bg-primary-subtle text-primary border border-primary-subtle'
                      : 'bg-secondary-subtle text-body-secondary border border-secondary-subtle'
                }`}
              >
                {roleTranslate(user.role)}
              </span>
            </dd>

            <dt className="col-sm-4 text-body-secondary">Estado de cuenta:</dt>
            <dd className="col-sm-8">
              <span
                className={`badge ${
                  user.enabled
                    ? 'bg-success-subtle text-success border border-success-subtle'
                    : 'bg-danger-subtle text-danger border border-danger-subtle'
                }`}
              >
                {booleanState(user.enabled)}
              </span>
            </dd>
          </dl>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-top">
        <Button variant="outline-secondary" onClick={onClose} className="rounded-pill px-4">
          Cerrar
        </Button>
        <div className="d-flex flex-wrap gap-2">
          <Button
            variant="outline-primary"
            className="rounded-pill px-3 fw-medium"
            onClick={onEditProfile}
          >
            ✏️ Editar datos
          </Button>
          <Button
            variant="outline-warning"
            className="rounded-pill px-3 fw-medium"
            onClick={onChangePassword}
          >
            🔑 Cambiar contraseña
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default UserProfileModal;
