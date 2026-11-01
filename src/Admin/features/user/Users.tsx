import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { useUserStore } from './userStore';
import { useAuth } from '../../../Auth/AuthContext/AuthContext';
import { UserRole } from '../../../Auth/types';
import { booleanState } from '../../../shared/utils/utils';
import { roleTranslate, type UserProfile } from './userTypes';
import Loader from '../../../shared/components/Loader';
import ConfirmModal from '../../../shared/modalComponents/ConfirmModal';
import CreateUserModal from './components/CreateUserModal';
import UpgradeUserModal from './components/UpgradeUserModal';

const Users = () => {
  const { user: authUser, hasMinRole } = useAuth();
  const { users, isLoading, fetchUsers, deleteUser } = useUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userToUpgrade, setUserToUpgrade] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const isAdminOrHigher = hasMinRole(UserRole.ADMIN);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(term) ||
        u.name?.toLowerCase().includes(term) ||
        u.nickname?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    setUserToDelete(null);
    await deleteUser(targetId);
  };

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'ADMIN':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      default:
        return 'bg-secondary-subtle text-body-secondary border border-secondary-subtle';
    }
  };

  return (
    <section className="container-fluid py-4 mb-4">
      {/* Modales administrativos */}
      {showCreateModal && (
        <CreateUserModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {userToUpgrade && (
        <UpgradeUserModal
          show={userToUpgrade !== null}
          user={userToUpgrade}
          onClose={() => setUserToUpgrade(null)}
        />
      )}

      <ConfirmModal
        isOpen={userToDelete !== null}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar permanentemente al usuario "${userToDelete?.email}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Cabecera y acciones */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Gestión del Padrón de Usuarios</h2>
          <p className="text-body-secondary mb-0 small">
            {users.length > 0
              ? `Total de usuarios registrados: ${users.length}`
              : 'Administración de accesos y estado del padrón'}
          </p>
        </div>

        {isAdminOrHigher && (
          <div>
            <button
              type="button"
              className="btn btn-sm btn-primary px-3 py-2 fw-semibold rounded-pill d-flex align-items-center gap-1"
              onClick={() => setShowCreateModal(true)}
            >
              <span>+</span> Crear usuario
            </button>
          </div>
        )}
      </div>

      {/* Barra de búsqueda */}
      {users.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-body border-secondary-subtle">🔍</span>
              <input
                type="text"
                className="form-control border-secondary-subtle"
                placeholder="Buscar por email, nombre, apodo o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {isLoading && users.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loader fullScreen={false} scale={0.5} text="Cargando usuarios..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card border border-secondary-subtle bg-body p-5 text-center shadow-sm">
          <p className="text-body-secondary mb-0">
            {searchTerm
              ? 'No se encontraron usuarios que coincidan con la búsqueda.'
              : 'No hay usuarios registrados en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredUsers.map((user) => {
            const isMe = user.id === authUser?.id;
            const isTargetOwner = user.role === 'OWNER';

            return (
              <div
                className="card shadow-sm border border-secondary-subtle bg-body overflow-hidden"
                key={user.id}
                style={{ borderRadius: '12px' }}
              >
                <div className="d-flex flex-column flex-md-row align-items-center">
                  {/* Avatar */}
                  <div
                    className="bg-body-tertiary flex-shrink-0 d-flex justify-content-center align-items-center p-3"
                    style={{ width: '100%', maxWidth: '140px', minHeight: '120px' }}
                  >
                    <img
                      src={user.picture || '/default-avatar.png'}
                      alt={user.nickname || user.name}
                      className="rounded-circle shadow-sm"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        opacity: user.enabled ? 1 : 0.45,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://ui-avatars.com/api/?name=' +
                          encodeURIComponent(user.name || user.nickname || 'U');
                      }}
                    />
                  </div>

                  {/* Datos del usuario */}
                  <div className="card-body d-flex flex-column flex-lg-row justify-content-between align-items-lg-center w-100 p-3 gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <h3 className="h5 fw-bold text-body-emphasis mb-0">
                          {user.name && user.name !== 'Falta completar'
                            ? user.name
                            : user.nickname || 'Usuario'}
                        </h3>
                        {isMe && (
                          <span className="badge bg-info-subtle text-info border border-info-subtle">
                            Tú
                          </span>
                        )}
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {roleTranslate(user.role)}
                        </span>
                        <span
                          className={`badge ${
                            user.enabled
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                          }`}
                        >
                          {booleanState(user.enabled)}
                        </span>
                      </div>

                      <div className="text-body-secondary small mb-1">
                        <span className="fw-semibold">Email:</span> {user.email}
                      </div>

                      {user.nickname && (
                        <div className="text-body-secondary small">
                          <span className="fw-semibold">Apodo:</span> {user.nickname}
                        </div>
                      )}
                    </div>

                    {/* Acciones administrativas con guard de rol */}
                    {isAdminOrHigher && (
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <Link
                          className="btn btn-sm btn-outline-secondary px-3 py-2 fw-medium rounded-pill"
                          to={`/admin/user/${user.id}`}
                        >
                          Ver detalles
                        </Link>

                        {/* Modificar rol y estado en el padrón */}
                        {!isTargetOwner && !isMe && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info px-3 py-2 fw-medium rounded-pill"
                            onClick={() => setUserToUpgrade(user)}
                          >
                            ⚙️ Rol / Estado
                          </button>
                        )}

                        {/* Eliminar usuario (no permitido para cuentas OWNER ni a uno mismo) */}
                        {!isTargetOwner && !isMe && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger px-3 py-2 fw-medium rounded-pill"
                            onClick={() => setUserToDelete(user)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Users;
