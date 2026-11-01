import Modal from './Modal'
import style from './modal.module.css'

type SuccessModalProps = {
  isOpen: boolean
  onAccept: () => void
  title?: string
  message?: string
  buttonText?: string
}

const SuccessModal = ({
  isOpen, 
  onAccept, 
  title = "¡Éxito!", 
  message = "La operación se realizó con éxito.", 
  buttonText = "Aceptar"
}: SuccessModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onAccept}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className={style.actions}>
        <button 
          type="button"
          className="btn btn-sm btn-success" 
          onClick={onAccept}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}

export default SuccessModal
