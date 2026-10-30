import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../../../Redux/actions";
import { booleanState } from "../../../Utils/generalHelpers";
import Edition from "../../../Utils/Edition/Edition"
import { userDelete } from "../../../Redux/endPoints";
import showConfirmationDialog from "../../../Utils/sweetalert";
import Loading from "../../Loading"

const Usuario = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [load, setLoad]= useState(false)
  const users = useSelector((state) => state.Users);

  const { id } = useParams();

  const onClose = () => {
      setLoad(false)
  };
  const isAdmin = true;
  useEffect(() => {
    dispatch(getUsers());
  }, [load]);

  const userDel = async (userId) => {
    const confirmed = await showConfirmationDialog(
      "¿Quiere eliminar el usuario? \n¡Esta accion no podra deshacerse!"
    );
    if (confirmed) {
      // Si el usuario hace clic en "Aceptar", ejecutar la funcion:
      setLoad(true)
      await userDelete(userId, onClose, onClose );
    }
  };
  return (
    <section className="container album py-1 mb-3 ">
      <div className=" row py-lg-5">
        <div className="col-lg-6 col-md-8 col-sm-12 mx-auto text-center">
          <h2 className="fw-light">Usuarios:</h2>
          <Link
            className="btn btn-sm btn-outline-success me-3 mb-3"
            to="/admin/users/create"
          >
            Crear Usuario
          </Link>
        </div>
        {load?
        <Loading/>
        :
        <div className="">
          {users?.map((info) => (
            <div
              className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100 mb-3 shadow-sm backgroundElements"
              key={info?.id}
              style={{ borderRadius: "0.5rem" }}
            >
              <img
                className="bd-placeholder-img-fluid ms-2"
                src={info?.picture}
                alt="Imagen"
                style={{ maxWidth: "10rem", borderRadius: "0.5rem 0 0 0.5rem" }}
              />
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                <div className="col-lg-5 ms-2">
                  <h2 className="fw-normal">{info.name? info.name : info.nickname}</h2>
                  <p> <strong>Email: </strong>{info?.email}</p>
                  <p> <strong>Rol: </strong>{info?.role}</p>
                  <p>
                    <strong>Estado: </strong>
                    {booleanState(info.enable)}
                  </p>
                </div>
                <p className="mt-3 mt-lg-0"style={{display:'flex', flexDirection:'column'}}>
                  <Link
                    className="btn btn-sm btn-outline-secondary me-3 mb-3"
                    to={`/admin/users/${info?.id}`}
                  >
                    Ver detalles
                  </Link>
                  <Edition
                    allowedRoles={["Administrador", "Moderador"]}
                    className="btn btn-sm btn-outline-danger me-3"
                    text="Eliminar"
                    onClick={()=>userDel(info.id)}
                  />
                </p>
              </div>
            </div>
          ))}
        </div>
        }
      </div>
    </section>
  );
};

export default Usuario