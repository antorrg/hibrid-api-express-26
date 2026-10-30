import { Dropdown } from "react-bootstrap";
import { useAuth } from "../../Auth/AuthContext/AuthContext";
import { useNavigate } from "react-router";
import { basePath } from "../../shared/api/api";
import { useUserStore } from "../features/user/userStore";

const AdminNav = () => {
  const { user } = useAuth();
  const profileData = useUserStore((state) => state.profile);
  const navigate = useNavigate();
  const inicio = basePath ? basePath : '/';

  const userId = profileData?.id || user?.id || '';

  const profile = () => {
    if (userId) {
      navigate(`/admin/users/profile/${userId}`);
    }
  };

  const change = () => {
    if (userId) {
      navigate(`/admin/users/updater/${userId}`);
    }
  };

  const pictureSrc = profileData?.picture || (user as any)?.picture || "/favicon.png";
  const displayName = profileData?.name || profileData?.nickname || (user as any)?.given_name || (user as any)?.nickname || user?.email || "Usuario";

  return (
    <>
      <nav
        className="navbar navbar-dark bg-dark"
        aria-label="Dark offcanvas navbar"
      >
        <div className="container-fluid">
          <p className="navbar-brand text-start ms-1">
            Panel Administrador
          </p>
          <div className="d-flex justify-content-start">
            <Dropdown align="end" className="">
              <Dropdown.Toggle
                as="a"
                className="d-flex align-items-center text-white text-decoration-none nav-link"
              >
                <img
                  src={pictureSrc}
                  alt="Avatar"
                  width="32"
                  height="32"
                  className="rounded-circle me-2"
                />
                <strong>
                  {displayName}
                </strong>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-dark text-small shadow">
                <Dropdown.Item onClick={profile}>Perfil</Dropdown.Item>
                <Dropdown.Item onClick={change}>Cambiar password</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <a className="navbar-brand text-start ms-5" href={inicio}>
            Ir a página principal
          </a>
        </div>
      </nav>
    </>
  );
};

export default AdminNav;
