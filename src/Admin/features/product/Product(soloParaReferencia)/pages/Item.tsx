import { Link, useParams } from 'react-router-dom'
import { booleanState } from '../../../AdminUtils/helpers'
import { useReduxFetch } from '../../../../hooks/useReduxFetch'
import { getItem } from '../productAdminSlice'
import Loader2 from '../../../../components/Loader2'

const Item = () => {
  const { id } = useParams()
  const itemId = Number(id)
 
  const {selectedItem, adminLoading } = useReduxFetch({
    action: getItem,
    arg: itemId,
    selector: (state) => state.adminProduct,
    deps: [itemId],
    condition: !!id
  })

  const mockitem = {
    id: 0,
    picture: 'no picture',
    text: 'no text',
    enabled:false
  }
  const item = selectedItem? selectedItem : mockitem
  return (
      <div
        className="modal modal-tour position-static d-block modal-custom py-5"
        role="dialog"
        id="modalTour"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-body p-5 text-center">
              {adminLoading?
              <Loader2
              fullScreen={false}
              scale={0.5}
              />
              :
              <>
              <img
                className={`d-block.mx-auto mb-4 ms-4 me-4 ${
                  !item!.enabled ? "deactivate" : ""
                  }`}
                  style={{maxWidth: '90%'}}
                  src={selectedItem?.picture!}
                  alt="image not found"
                  />
              <p className="text-muted">
                <strong>Texto: </strong>
                {item?.text}
              </p>
              <p className="text-muted">
                <strong>Estado: </strong> {booleanState(item?.enabled!)}
              </p>
              </>
              }
              <Link
                className="btn btn-sm btn-secondary mt-3 mx-auto w-25"
                to={`/admin/producto/detalles/${selectedItem?.ProductId}`}
                >
                Cerrar
              </Link>
              <Link
                to={`/admin/producto/edicion/item/${item!.id}`}
                className="btn btn-sm btn-primary mt-3 ms-2 mx-auto w-25"
                >
                Editar
              </Link>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Item