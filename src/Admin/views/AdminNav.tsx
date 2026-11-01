import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useAuth } from "../../Auth/AuthContext/AuthContext";
import { basePath } from "../../shared/api/api";
import { useUserStore } from "../features/user/userStore";
import UserProfileModal from "../features/user/components/UserProfileModal";
import UpdateProfileModal from "../features/user/components/UpdateProfileModal";
import ChangePasswordModal from "../features/user/components/ChangePasswordModal";
import type { UserProfile } from "../features/user/userTypes";

const AdminNav = () => {
  const { user } = useAuth();
  const profileData = useUserStore((state) => state.profile);
  const inicio = basePath ? basePath : '/';

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const currentUserProfile: UserProfile = {
    id: profileData?.id || user?.id || '',
    email: profileData?.email || user?.email || '',
    role: profileData?.role || user?.role || 'USER',
    name: profileData?.name || (user as any)?.given_name || '', //eslint-disable-line
    nickname: profileData?.nickname || user?.nickname || '',
    picture: profileData?.picture || (user as any)?.picture || '',// eslint-disable-line
    enabled: profileData?.enabled ?? true,
  };

  const pictureSrc = currentUserProfile.picture || "/favicon.png";
  const displayName =
    currentUserProfile.name ||
    currentUserProfile.nickname ||
    currentUserProfile.email ||
    "Usuario";

  return (
    <>
      {showProfileModal && (
        <UserProfileModal
          show={showProfileModal}
          user={currentUserProfile}
          onClose={() => setShowProfileModal(false)}
          onEditProfile={() => {
            setShowProfileModal(false);
            setShowUpdateProfileModal(true);
          }}
          onChangePassword={() => {
            setShowProfileModal(false);
            setShowChangePasswordModal(true);
          }}
        />
      )}

      {showUpdateProfileModal && (
        <UpdateProfileModal
          show={showUpdateProfileModal}
          user={currentUserProfile}
          onClose={() => setShowUpdateProfileModal(false)}
        />
      )}

      {showChangePasswordModal && currentUserProfile.id && (
        <ChangePasswordModal
          show={showChangePasswordModal}
          userId={currentUserProfile.id}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      <nav
        className="navbar navbar-dark bg-dark"
        aria-label="Dark offcanvas navbar"
      >
        <div className="container-fluid">
          <p className="navbar-brand text-start ms-1 mb-0">
            Panel Administrador
          </p>
          <div className="d-flex justify-content-start">
            <Dropdown align="end" className="">
              <Dropdown.Toggle
                as="a"
                className="d-flex align-items-center text-white text-decoration-none nav-link cursor-pointer"
                role="button"
                id="user-nav-dropdown"
              >
                <img
                  src={pictureSrc}
                  alt="Avatar"
                  width="32"
                  height="32"
                  className="rounded-circle me-2 object-fit-cover border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(displayName);
                  }}
                />
                <strong>{displayName}</strong>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-dark text-small shadow">
                <Dropdown.Item onClick={() => setShowProfileModal(true)}>
                  👤 Mi Perfil
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowChangePasswordModal(true)}>
                  🔑 Cambiar contraseña
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <a className="navbar-brand text-start ms-5 mb-0" href={inicio}>
            Ir a página principal
          </a>
        </div>
      </nav>
    </>
  );
};

export default AdminNav;
