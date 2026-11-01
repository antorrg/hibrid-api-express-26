import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import showConfirmationDialog from "../../Utils/sweetalert";
import {userUpgrade} from "../../Redux/endPoints";
import { getUserById } from "../../Redux/actions";
import Loading from '../Loading'

const UserUpgrade = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const user1 = useSelector((state) => state.UserById);
  const [load, setLoad] = useState(false)

  useEffect(() => {
    dispatch(getUserById(id));
  }, [id]);

  const onClose = () => {
    setLoad(false)
    navigate(-1);
  };
  const onFail = () => {
    setLoad(false)
  };

  const [user, setUser] = useState({
    role: "",
    enable: "",
  });

  useEffect(() => {
    if (user1) {
      setUser({
        role: user1.role || "",
        enable: user1.enable || "",
      });
    }
  }, [user1]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Lógica para actualizar el producto
    const confirmed = await showConfirmationDialog(
      "¿Está seguro de actualizar este usuario?"
    );
    if (confirmed) {
      // Si el usuario hace clic en "Aceptar", ejecutar la funcion:
      //console.log(user);
      setLoad(true)
      await userUpgrade(id, user, onClose, onFail);
    }
  };

  return (
    <div className="imageBack">
      {load?
      <Loading/>
      :
      <div className="coverBack">
        <div className="container-md modal-content colorBack backgroundFormColor formProductContainer rounded-4 shadow">
          <div className="container mt-5">
            <h1>Cambio de roles, bloqueo:</h1>
            <section
              className="needs-validation"
              id="updateItemForm"
              noValidate
            >
              <div className="row">
                <div className="col-md-6 mb-3"></div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Rol:
                  </label>
                  <select
                    name="role"
                    className="form-control"
                    value={user.role}
                    onChange={handleInputChange}
                  >
                    <option value={"Administrador"}>Administrador</option>
                    <option value={"Usuario"}>Usuario</option>
                    <option value={"Moderador"}>Moderador</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="enable" className="form-label">
                    Estado:
                  </label>
                  <select
                    name="enable"
                    className="form-control"
                    value={user.enable}
                    onChange={handleInputChange}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Bloqueado</option>
                  </select>
                </div>

                <div className="d-flex flex-row me-3">
                  <button
                    className="btn btn-md btn-primary mb-3 me-2"
                    type="button"
                    id="submitButton"
                    onClick={handleSubmit}
                  >
                    Actualizar
                  </button>
                  <button
                    className="btn btn-md btn-secondary mb-3"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      
      </div>
        }
    </div>
  );
};

export default UserUpgrade;
