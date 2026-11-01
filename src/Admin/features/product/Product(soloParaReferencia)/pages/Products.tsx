import { Link } from 'react-router-dom'
import { useReduxFetch } from '../../../../hooks/useReduxFetch'
import { getAllProducts, clearError } from '../productAdminSlice'
import { booleanState } from '../../../AdminUtils/helpers'

const Products = () => {
const { products }= useReduxFetch({
    action: getAllProducts,
    selector: (state) => state.adminProduct,
    cleanupAction: clearError
})


  return (
        <section className="container album py-1 mb-3 ">
      <div className=" row py-lg-5">
        <div className="col-lg-6 col-md-8 col-sm-12 mx-auto text-center">
          <h2 className="fw-light">Productos:</h2>
          <Link
            className="btn btn-sm btn-outline-success me-3 mb-3"
            to="/admin/producto/creacion"
          >
            Crear producto
          </Link>
        </div>
        <div className="">
          {products?.map((info) => (
            <div
              className="d-flex flex-column flex-lg-row justify-content-between align-items-start w-100 mb-3 shadow-md card"
              key={info?.id}
              style={{ borderRadius: "0.5rem" }}
            >
              <img
                className={`bd-placeholder-img-fluid ms-2 mx-auto mx-lg-0 ${
                  info && !info.enabled? "deactivate" : ""
                }`}
                src={info?.picture!}
                alt="Imagen"
                style={{ maxWidth: "10rem", borderRadius: "0.5rem 0 0 0.5rem" }}
              />
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                <div className="col-lg-5 ms-2">
                  <h2 className="fw-normal">{info?.title}</h2>
                  <p>{info?.info_header}</p>
                  <p>
                    <strong>Estado: </strong>
                    {booleanState(info.enabled)}
                  </p>
                </div>
                <p className="mt-3 mt-lg-0">
                  <Link
                    className="btn btn-sm btn-outline-secondary me-3"
                    to={`/admin/producto/detalles/${info?.id}`}
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
  )
}

export default Products