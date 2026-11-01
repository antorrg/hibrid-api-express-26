import Modal from './Modal'
import style from './modal.module.css'

type ConfirmModalProps = {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: string
  cancelVariant?: string
}

const ConfirmModal = ({
  isOpen, 
  onCancel, 
  onConfirm, 
  title = "¿Estás seguro?", 
  message = "¿Deseas continuar?", 
  confirmText = "Sí, continuar", 
  cancelText = "No, volver",
  confirmVariant = "btn-outline-primary",
  cancelVariant = "btn-outline-danger",
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h2>{title}</h2>
      <p>{message}</p>
      
      <div className={style.actions}>
        <button 
          type="button"
          className={`btn btn-sm ${cancelVariant}`}
          onClick={onCancel}
        >
          {cancelText}
        </button>
        
        <button 
          type="button"
          className={`btn btn-sm ${confirmVariant}`}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
