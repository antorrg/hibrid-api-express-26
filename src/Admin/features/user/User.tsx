import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useUserStore } from './userStore';
import { useAuth } from '../../../Auth/AuthContext/AuthContext';
import { UserRole } from '../../../Auth/types';
import { booleanState } from '../../../shared/utils/utils';
import { roleTranslate } from './userTypes';
import Loader from '../../../shared/components/Loader';
import ConfirmModal from '../../../shared/modalComponents/ConfirmModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import UpgradeUserModal from './components/UpgradeUserModal';
import UpdateProfileModal from './components/UpdateProfileModal';

const User = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser, hasMinRole } = useAuth();
  const { selectedUser, isLoading, fetchUserById, deleteUser } = useUserStore();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserById(id);
    }
  }, [id, fetchUserById]);

  const handleGoBack = () => {
    navigate('/admin?tab=users');
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setConfirmDelete(false);
    const success = await deleteUser(selectedUser.id);
    if (success) {
      handleGoBack();
    }
  };

  if (isLoading && !selectedUser) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando datos del usuario..." />
      </div>
    );
  }

  if (!selectedUser && !isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border border-secondary-subtle bg-body shadow-sm">
          <h2 className="h4 text-body-emphasis mb-3">Usuario no encontrado</h2>
          <p className="text-body-secondary mb-4">El usuario solicitado no existe o fue eliminado.</p>
          <div>
            <button type="button" onClick={handleGoBack} className="btn btn-primary rounded-pill px-4">
              Volver a Usuarios
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMe = selectedUser?.id === authUser?.id;
  const isAdminOrHigher = hasMinRole(UserRole.ADMIN);
  const isTargetOwner = selectedUser?.role === 'OWNER';

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modales */}
      {showUpgradeModal && selectedUser && (
        <UpgradeUserModal
          show={showUpgradeModal}
          user={selectedUser}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            if (id) fetchUserById(id);
          }}
        />
      )}

      {showUpdateProfileModal && selectedUser && (
        <UpdateProfileModal
          show={showUpdateProfileModal}
          user={selectedUser}
          onClose={() => setShowUpdateProfileModal(false)}
          onSuccess={() => {
            if (id) fetchUserById(id);
          }}
        />
      )}

      {showChangePasswordModal && selectedUser && (
        <ChangePasswordModal
          show={showChangePasswordModal}
          userId={selectedUser.id}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar permanentemente al usuario "${selectedUser?.email}"?`}
        confirmText="Sí, eliminar usuario"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* Barra de navegación superior */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="btn btn-sm btn-secondary rounded-pill d-flex align-items-center gap-2 px-3 py-2 caption-badges"
        >
          <span>←</span> Volver a Usuarios
        </button>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Opciones de administración: solo rol ADMIN o superior sobre otros usuarios */}
          {isAdminOrHigher && !isTargetOwner && !isMe && (
            <>
              <button
                type="button"
                className="btn btn-sm btn-outline-info px-3 py-2 fw-medium rounded-pill"
                onClick={() => setShowUpgradeModal(true)}
              >
                ⚙️ Cambiar rol y estado
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger px-3 py-2 fw-medium rounded-pill"
                onClick={() => setConfirmDelete(true)}
              >
                Eliminar usuario
              </button>
            </>
          )}

          {/* Opciones personales: solo si es el propio usuario en sesión */}
          {isMe && (
            <>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary px-3 py-2 fw-medium rounded-pill"
                onClick={() => setShowUpdateProfileModal(true)}
              >
                ✏️ Editar mi perfil
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning px-3 py-2 fw-medium rounded-pill"
                onClick={() => setShowChangePasswordModal(true)}
              >
                🔑 Cambiar contraseña
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tarjeta de detalle */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div
            className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5"
            style={{ borderRadius: '16px' }}
          >
            <div className="text-center mb-4">
              <span className="badge bg-secondary-subtle text-body-secondary border border-secondary-subtle mb-2">
                Detalle de Usuario
              </span>
              <h2 className="h4 fw-bold text-body-emphasis mb-0">
                {selectedUser?.name && selectedUser.name !== 'Falta completar'
                  ? selectedUser.name
                  : selectedUser?.nickname || 'Usuario'}
              </h2>
            </div>

            {/* Foto de perfil */}
            <div className="text-center mb-4">
              <img
                src={selectedUser?.picture || '/default-avatar.png'}
                alt={selectedUser?.nickname || selectedUser?.name}
                className="rounded-circle shadow-sm border p-1 bg-body-tertiary"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  opacity: selectedUser?.enabled ? 1 : 0.5,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(selectedUser?.name || selectedUser?.nickname || 'U');
                }}
              />
            </div>

            {/* Lista de atributos */}
            <div className="bg-body-secondary rounded-3 p-3 p-md-4 mb-4 border border-secondary-subtle">
              <dl className="row mb-0 g-3">
                <dt className="col-sm-4 text-body-secondary">Email:</dt>
                <dd className="col-sm-8 text-body fw-medium">{selectedUser?.email}</dd>

                <dt className="col-sm-4 text-body-secondary">Nombre:</dt>
                <dd className="col-sm-8 text-body">
                  {selectedUser?.name || <span className="text-body-secondary fst-italic">Sin nombre registrado</span>}
                </dd>

                <dt className="col-sm-4 text-body-secondary">Apodo:</dt>
                <dd className="col-sm-8 text-body">
                  {selectedUser?.nickname || <span className="text-body-secondary fst-italic">Sin apodo</span>}
                </dd>

                <dt className="col-sm-4 text-body-secondary">Rol:</dt>
                <dd className="col-sm-8">
                  <span
                    className={`badge ${
                      selectedUser?.role === 'OWNER'
                        ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                        : selectedUser?.role === 'ADMIN'
                          ? 'bg-primary-subtle text-primary border border-primary-subtle'
                          : 'bg-secondary-subtle text-body-secondary border border-secondary-subtle'
                    }`}
                  >
                    {roleTranslate(selectedUser?.role)}
                  </span>
                </dd>

                <dt className="col-sm-4 text-body-secondary">Estado:</dt>
                <dd className="col-sm-8">
                  <span
                    className={`badge ${
                      selectedUser?.enabled
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-danger-subtle text-danger border border-danger-subtle'
                    }`}
                  >
                    {booleanState(selectedUser?.enabled)}
                  </span>
                </dd>
              </dl>
            </div>

            <div className="d-flex justify-content-end pt-3 border-top border-secondary-subtle">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={handleGoBack}
              >
                Volver a Usuarios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
