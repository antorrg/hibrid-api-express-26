import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { useReduxFetch } from '../../../../hooks/useReduxFetch'
import { getProductById, clearError } from "../productAdminSlice";
import { booleanState } from '../../../AdminUtils/helpers'
import Loader2 from '../../../../components/Loader2';
import ProductButtons from '../components/ProductButtons';
import { productsApi } from '../../../AdminApi/productsApi'



const Product = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { id } = useParams();
  
  const {selectedProduct, adminLoading } = useReduxFetch({
    action: getProductById,
    arg: Number(id),
    selector: (state) => state.adminProduct,
    deps: [id],
    condition: !!id,
    cleanupAction: clearError
  })
  const [load, setLoad] = useState<boolean>(adminLoading ?? true);
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const onClose = () => {
    setLoad(false);
    navigate("/admin?tab=producto");
  };
  const finishDeleteItem = () =>{
    setDeletingId(null)
    dispatch(getProductById(Number(id)) as any)
  }

  const toEdition = () => {
    navigate(`/admin/producto/edicion/${selectedProduct!.id}`);
  };
  const itemCreate = () => {
    navigate(`/admin/producto/creacion/item/${selectedProduct!.id}`);
  };
  const deleteCurrentProduct = async () => {
    const confirmed = await productsApi.confirmAction({title:'¿Esta seguro que quiere eliminar el producto?'})
    if(!confirmed) return
    try{
      setLoad(true)
     await productsApi.delete(
      selectedProduct!.id,
      {
        success: () => onClose(),
        reject: () => setLoad(false)
      } 
    )     
  }catch{
    setLoad(false)
  }
  };
  const delItem = async (id:number ) => {
     const itemId = Number(id)
    const confirmed = await productsApi.confirmAction({
      title: "¿Quiere eliminar esta item?"
    })
    if(confirmed){
      setDeletingId(String(id))
    await productsApi.deleteItem(itemId,
    { success: finishDeleteItem, 
      reject: () => {setDeletingId(null)}
    })

  }else{
    setDeletingId(null)
  }
  };
  

  return (
    <>
          <section className="py-5 text-center container card">
              <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center rounded-4 ms-1 mb-3"
                    aria-label="Volver Atrás"
                    style={{ width: "96px", height: "40px", flexShrink: 0 }}
              >
                <i className="bi bi-arrow-left fs-4 me-3"></i>Volver
              </button>
              {load?
              <Loader2
              fullScreen={false}
              scale={0.7}
              />
              :
              <>
            <div className="row py-lg-5">
              <div className="col-lg-6 col-md-8 mx-auto">
                  <h1 className="fw-light m-0 mb-3">Proyecto: {selectedProduct?.title}</h1>
                <img
                  className={`bd-placeholder-img-fluid img-fluid mb-3 ${
                    selectedProduct && !selectedProduct.enabled ? "deactivate" : ""
                    }`}
                    src={selectedProduct?.picture!}
                    alt="Imagen"
                    style={{ width: "100%", maxWidth: "22rem", objectFit: 'cover', objectPosition: 'center' }}
                    />
                <h4>Info posicionamiento:</h4>
                <p className="lead text-muted">{selectedProduct?.info_header}</p>
                <hr></hr>
                <h4>Descripcion:</h4>
                <p className="lead text-muted">{selectedProduct?.info_body}</p>
                <hr></hr>
                <h4>Estado:</h4>
                <p className="lead text-muted">{booleanState(selectedProduct?.enabled!)}</p>
                <ProductButtons
                fn1={onClose}
                fn2={toEdition}
                fn3={itemCreate}
                fn4={deleteCurrentProduct}
                />
              </div>
            </div>
            </>
            }
          </section>
          <section className="album.py-5.bg-light">
            <div className="container">
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                {load?
                  null
                  :
                  <>
                {selectedProduct?.Items?.map((item) => (
                  <div className="col" key={item.id}>
                    <div className="card shadow-sm">
                    {deletingId === String(item.id) ? (
                      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '260px' }}>
                          <Loader2 fullScreen={false} scale={0.4} text={'Borrando...'} />
                        </div>
                      ) : (
                        <>
                      <img
                        className={`card-img-top ${
                          !item.enabled ? "deactivate" : ""
                          }`}
                          src={item.picture!}
                          alt="Card image"
                          style={{maxWidth: '25rem', height:'15rem', objectFit:'cover', objectPosition:'center'}}
                          />
                      <div className="card-body">
                        <p className="card-text">{item.text}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-secondary me-3"
                              onClick={() =>
                                navigate(`/admin/producto/detalles/item/${item.id}`)
                              }
                              disabled={item.id === 0 ? true : false}
                              >
                              Ver mas
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                delItem(item.id);
                              }}
                              disabled={item.id === 0 ? true : false}
                              >
                              Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                      </>
                      )}
                    </div>
                  </div>
                ))}
                </>
              }
              </div>
            </div>
          </section>
        </>

  );
};

export default Product;
