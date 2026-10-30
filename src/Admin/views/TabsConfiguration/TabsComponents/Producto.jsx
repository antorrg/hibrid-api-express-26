import { useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProduct } from "../../../Redux/actions";
import { booleanState } from "../../../Utils/generalHelpers";

const Producto = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.Products);

  const { id } = useParams();
  const goBack = () => navigate(-1);
  
  useEffect(() => {
    dispatch(getProduct());
  }, []);
  return (
    <section className="container album py-1 mb-3 ">
      <div className=" row py-lg-5">
        <div className="col-lg-6 col-md-8 col-sm-12 mx-auto text-center">
          <h2 className="fw-light">Productos:</h2>
          <Link
            className="btn btn-sm btn-outline-success me-3 mb-3"
            to="/admin/product/create"
          >
            Crear producto
          </Link>
        </div>
        <div className=" ">
          {products?.map((info) => (
            <div
              className="backgroundElements d-flex flex-column flex-lg-row justify-content-between align-items-start w-100 mb-3 shadow-sm"
              key={info?.id}
              style={{ borderRadius: "0.5rem" }}
            >
              <img
                className="bd-placeholder-img-fluid ms-2 mx-auto mx-lg-0"
                src={info?.landing}
                alt="Imagen"
                style={{ maxWidth: "10rem", borderRadius: "0.5rem 0 0 0.5rem" }}
              />
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                <div className="col-lg-5 ms-2">
                  <h2 className="fw-normal">{info?.title}</h2>
                  <p>{info?.infoHeader}</p>
                  <p>
                    <strong>Estado: </strong>
                    {booleanState(info.enable)}
                  </p>
                </div>
                <p className="mt-3 mt-lg-0">
                  <Link
                    className="btn btn-sm btn-outline-secondary me-3"
                    to={`/admin/product/${info?.id}`}
                  >
                    Ver detalles
                  </Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Producto;
