import { useState } from 'react'
import {useDispatch} from 'react-redux'
import { useReduxFetch } from "../../../hooks/useReduxFetch"
import { getAllImages } from "./imagesAdminSlice"
import { imagesApi } from '../../AdminApi/imagesApi'
import Loader2 from "../../../components/Loader2"

const ViewImages = () => {
  const dispatch = useDispatch()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const { images } = useReduxFetch({
        action : getAllImages,
        selector: (state) => state.adminImages
    })

  const onClose = () => {
    dispatch(getAllImages() as any)
    setDeletingId(null);
  };
  const onRetry = () => {
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const delImage = async (id:string) => {
    const imageId = Number(id)
    const confirmed = await imagesApi.confirmAction({
    title: "¿Quiere eliminar esta imagen?"
    });
    if (confirmed) {
      // Si el usuario hace clic en "Aceptar", ejecutar la funcion:
      setDeletingId(id);
      await imagesApi.delete(
        imageId,
        {
        success: () => onClose(),
        reject: () => onRetry()
      } 
      )
      getAllImages()
    }else{
      setDeletingId(null)
    }
  };

  return (
      <section className="container album py-5 mb-3">
              <div className="col-lg-6 col-md-8 ">
                <h2 className="fw-light">Imagenes guardadas</h2>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                {images?.map((img, index) => (
                  <div className="col" key={img.id}>
                    <div className="card shadow-sm">
                      {deletingId === String(img.id) ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '260px' }}>
                          <Loader2 fullScreen={false} scale={0.4} text={'Borrando...'} />
                        </div>
                      ) : (
                        <>
                          <img
                          className="card-img-top"
                          style={{ aspectRatio: '7 / 5', objectFit:'cover', objectPosition:'center'}}
                          src={img.imageUrl}
                          alt="Card image"
                          />
                          <div className="card-body">
                          {(String(img.id) === 'L')?
                            <p className="card-text">
                              No hay imagenes guardadas
                            </p>
                            :
                            <p className="card-text">
                              Imagen guardada Nª: {index + 1}
                            </p>
                              }
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-danger me-3"
                                  onClick={() => delImage(`${img.id}`)}
                                  disabled={String(img.id) === 'L' || deletingId !== null}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </div>
      </section>
  )
}

export default ViewImages