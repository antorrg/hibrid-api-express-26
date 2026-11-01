import Modal from './Modal'
import style from './modal.module.css'

type FailModalProps = {
  isOpen: boolean
  onAccept: () => void
  title?: string
  message?: string
  buttonText?: string
}

const FailModal = ({
  isOpen, 
  onAccept, 
  title = "¡Error!", 
  message = "La operación no se pudo realizar.", 
  buttonText = "Aceptar"
}: FailModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onAccept}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className={style.actions}>
        <button 
          type="button"
          className="btn btn-sm btn-danger" 
          onClick={onAccept}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}

export default FailModal
