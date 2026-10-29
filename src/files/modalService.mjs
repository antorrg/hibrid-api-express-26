class ModalService {
    constructor() {
      this.activeModals = new Set();
      this.setupGlobalListeners();
    }
  
    setupGlobalListeners() {
      // Cerrar modal con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const lastModal = Array.from(this.activeModals).pop();
          if (lastModal) this.closeModal(lastModal);
        }
      });
    }
  
    showModal({
      type = 'info',
      title = 'Título',
      message = '',
      showAcceptButton = false,
      showDenyButton = false,
      onAccept = null,
      onDeny = null,
      autoHide = true,
      hideDelay = 3000,
      loader = false,
      closeOnClickOutside = true,
      icons = false,
      iconType = '',
    } = {}) {
      // Generar ID único para el modal
      const modalId = `modal-${type}-${Date.now()}`;
      
      // Template del modal
      const modalHTML = `
        <div class='modalContainer hidden' id='${modalId}' role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
          <div class='modalDialog modalDialog--${type}'>
            <!-- Botón de cierre -->
            <button class="modal-close-butn" aria-label="Cerrar modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg> 
            </button>
             ${icons? `<div class="icon-container"><div class="${iconType}"></div></div><br>` : ''}
            <h1 id="${modalId}-title">${title}</h1>
            
            ${loader 
              ? `<div class="loaderModal loaderModal--${type}" role="status" aria-label="Cargando..."></div>` 
              : `<h2>${message}</h2>`
            }
            
            <div class='orderButtons'>
              ${showAcceptButton ? `
                <button id='${modalId}-accept' class='buttonAlert buttonAlert--azul'>
                  Aceptar
                </button>` : ''
              }
              ${showDenyButton ? `
                <button id='${modalId}-deny' class='buttonAlert buttonAlert--rojo'>
                  Cancelar
                </button>` : ''
              }
            </div>
          </div>
        </div>
      `;
  
      // Insertar el modal
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      const modalElement = document.getElementById(modalId);
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      
      // Forzar reflow y mostrar el modal
      void modalElement.offsetWidth;
      modalElement.classList.remove('hidden');
      
      // Agregar a la colección de modales activos
      this.activeModals.add(modalElement);
  
      // Event Listeners
      const cleanup = () => {
        if (modalElement.querySelector('.modal-close-btn')) {
          modalElement.querySelector('.modal-close-butn').removeEventListener('click', handleClose);
        }
        if (closeOnClickOutside) {
          modalElement.removeEventListener('click', handleOutsideClick);
        }
        document.body.style.overflow = '';
        this.activeModals.delete(modalElement);
      };
  
      const handleClose = () => {
        this.closeModal(modalElement);
        cleanup();
      };
  
      const handleOutsideClick = (e) => {
        if (e.target === modalElement) {
          handleClose();
        }
      };
  
      // Configurar eventos
      modalElement.querySelector('.modal-close-butn').addEventListener('click', handleClose);
      
      if (closeOnClickOutside) {
        modalElement.addEventListener('click', handleOutsideClick);
      }
  
      if (showAcceptButton) {
        const acceptButton = document.getElementById(`${modalId}-accept`);
        acceptButton.addEventListener('click', () => {
          if (onAccept) onAccept();
          handleClose();
        });
      }
  
      if (showDenyButton) {
        const denyButton = document.getElementById(`${modalId}-deny`);
        denyButton.addEventListener('click', () => {
          if (onDeny) onDeny();
          handleClose();
        });
      }
  
      // Auto-hide si está configurado
      if (autoHide && !showAcceptButton && !showDenyButton) {
        setTimeout(handleClose, hideDelay);
      }
  
      return modalElement;
    }
  
    closeModal(modalElement) {
      if (!modalElement) return;
      
      modalElement.classList.add('hidden');
      
      // Eliminar el modal después de la transición
      modalElement.addEventListener('transitionend', () => {
        modalElement.remove();
        // Si no hay más modales, restaurar el scroll
        if (this.activeModals.size === 0) {
          document.body.style.overflow = '';
        }
      }, { once: true });
    }
  
    // Método para cerrar todos los modales
    closeAll() {
      this.activeModals.forEach(modal => this.closeModal(modal));
    }
  }
  
  // Crear una única instancia del servicio
  const modalService = new ModalService();
  
  export default  modalService;