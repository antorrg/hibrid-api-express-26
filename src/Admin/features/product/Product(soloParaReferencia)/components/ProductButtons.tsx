
type BtnProps ={
  fn1: ()=> void,
  fn2: ()=> void,
  fn3: ()=> void,
  fn4: ()=> void
}

const ProductButtons = ({fn1, fn2, fn3, fn4} : BtnProps) => {
  return (
    <>
                <button
                  className="btn btn-sm btn-secondary my-2"
                  onClick={fn1}
                >
                  Volver
                </button>
                <button
                  className="btn btn-sm btn-primary my-2 ms-2"
                  onClick={fn2}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-success my-2 ms-2"
                  onClick={fn3}
                >
                  Crear Item
                </button>
                <button
                  className="btn btn-sm btn-outline-danger my-2 ms-2"
                  onClick={fn4}
                >
                  Eliminar producto
                </button>
              </>
  )
}

export default ProductButtons