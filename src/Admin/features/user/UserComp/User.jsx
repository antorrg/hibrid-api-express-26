import {useState} from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import Edition from "../../Utils/Edition/Edition";
import {userResetPass} from "../../Redux/endPoints"
import showConfirmationDialog from "../../Utils/sweetalert";
import Loading from "../Loading";


const User = ({ user, isSingleUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfileRoute = location.pathname.includes("profile");
  const [load, setLoad] = useState(false)

  const goToDetail = () => navigate(`/admin/users/${user.id}`);
  const goToBack = () => navigate(-1);
  const goToEdition = () => navigate(`/admin/users/profile/${user.id}`);
  const goToUpgrade = () => navigate(`/admin/users/upgrade/${user.id}`);

  const onClose = () => {
    setLoad(false)
    navigate("/admin?tab=users")
  };
  const onFail = () => {
    setLoad(false)
  };

 
  const goToPassUpd = () => {
    if (isProfileRoute) {
      navigate(`/admin/users/updater/${user.id}`);
    } else {
      resetPassword();
    }
  };
  const resetPassword = async () => {
    const confirmed = await showConfirmationDialog(
      "¿Quiere reiniciar esta contraseña?"
    );
    if (confirmed) {
      // Si el usuario hace clic en "Aceptar", ejecutar la funcion:
      setLoad(true)
      await userResetPass(user.id,null, onClose, onFail);
    }
  };

  const userDelete = async () => {
    const confirmed = await showConfirmationDialog(
      "¿Quiere eliminar su usuario? \n¡Esta accion no podra deshacerse!"
    );
    if (confirmed) {
      // Si el usuario hace clic en "Aceptar", ejecutar la funcion:
      //us.onDeleteUser(user.id, onClose);
      setLoad(true)
    }
  };
  const userStatus = user.enable ? "Activo" : "Bloqueado";

  const renderUserInfo = (label, value) => (
    <div className="user-info">
      <dt className="user-info-label">{label}:</dt>
      <dd className="user-info-value">{value}</dd>
    </div>
  );

  return (
    <div className="col userStyle">
      {load?
      <Loading/>: null}
      <div className="card shadow-sm p-2">
        <img
          className="card-img-top"
          src={user.picture}
          alt={`${user.nickname}'s profile`}
          style={{maxWidth:'500px'}}
        />
        <div className="card-body">
          <dl className="user-info-list">
            {renderUserInfo("Email", user.email)}
            {renderUserInfo("Apodo", user.nickname)}
            {renderUserInfo("Rol", user.role)}
            {isSingleUser && (
              <>
                {renderUserInfo("Nombre", user.name)}
                {renderUserInfo("Apellido", user.surname)}
                {renderUserInfo("País", user.country)}
                {renderUserInfo("Estado", userStatus)}
              </>
            )}
          </dl>

          <div className="d-flex justify-content-between align-items-center">
            {isSingleUser ? (
              <>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={goToBack}
                >
                  Volver
                </button>
                <Edition
                  allowedRoles={["Administrador", "Moderador"]}
                  className="btn btn-sm btn-outline-success"
                  userEditId={user.id}
                  text={isProfileRoute ? "Contraseña" : "Reset Contr"}
                  onClick={goToPassUpd}
                />
                {!isProfileRoute && (
                  <Edition
                    allowedRoles={["Administrador", "Moderador"]}
                    className="btn btn-sm btn-outline-danger"
                    text="Rol-Bloqueo"
                    onClick={goToUpgrade}
                  />
                )}
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={goToEdition}
                >
                  Editar
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={goToDetail}
                >
                  Detalles
                </button>
                <Edition
                  allowedRoles={["Administrador", "Moderador"]}
                  className="btn btn-sm btn-outline-danger"
                  text="Eliminar"
                  onClick={userDelete}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
