# Ejemplo de implementacion de modalservice
Las instancias de parametros serían:
### Parametros javascript:
```javascript
 type = 'info', // Tipo de modal: success, error, warning, info, etc.
    title = 'Título', // Título del modal
    message = '', // Mensaje del modal
    showAcceptButton = false, // Si muestra el botón de aceptar
    showDenyButton = false, // Si muestra el botón de cancelar
    onAccept = null, // Callback para aceptar
    onDeny = null, // Callback para cancelar
    autoHide = true, // Ocultar automáticamente después de un tiempo
    hideDelay = 3000, // Tiempo de espera antes de ocultar automáticamente
    loader = false,// Si el modal es un loading con spinner.
    closeOnClickOutside = true,
    icons=false, //Indica si utilza o no iconos
    iconType=null, //Indica el tipo de icono
```
<hr>

### Parametros css:
![](./coloresCss.png)

```css
.modalDialog--success { color: rgb(58, 159, 11); }
.modalDialog--info { color: rgb(0, 123, 255); }
.modalDialog--failed { color: rgb(245, 32, 42); }
.modalDialog--warning { color: rgb(219, 136, 4); }
```

```javascript
// Importar el servicio
import { modalService } from './js/main.mjs';
const d = document;
const button = d.getElementById('modal-button');
const button1 = d.getElementById('modal-button1');

const actionActivate = ()=>alert('Aceptaste y funcioné, je je!!')


button.addEventListener('click',  ()=>{
    // Modal de éxito
    modalService.showModal({
    type: 'success',
    title: '¡Este es un modal de pruebas!',
    message: 'En un momento se cerrará.',
    autoHide: true,
    hideDelay: 3000
  });
})

button1.addEventListener('click', async function () {
  const accepted = await showConfirmationModal();
  if (accepted) {
    verModal();

      // Simula una función asíncrona
      const response = await someAsyncFunction();

      if (response.ok) {
        modalService.closeAll();
          verExit();
      } else {
         modalService.closeAll();
          alert("Hubo un problema.");
      }
    
  }
});

function showConfirmationModal() {
  return new Promise((resolve) => {
    modalService.showModal({
          type: 'info',
          title: '¿Está seguro de eliminar el usuario?',
          message: 'Esta acción no se puede deshacer.',
          showAcceptButton: true,
          showDenyButton: true,
          autoHide: false,
          onAccept: () => resolve(true), // Resuelve la promesa como `true` al aceptar
          onDeny: () => resolve(false),  // Resuelve la promesa como `false` al cancelar
      });
  });
}

function verModal() {
    modalService.showModal({
      type: 'warning',
      title: 'Espere un poquito...',
      loader: true,
      autoHide: false,
  });
}


async function someAsyncFunction() {
  return new Promise(resolve => {
      setTimeout(() => resolve({ ok: true }), 2000);
  });
}

const verExit = () => {
    modalService.showModal({
      type: 'success',
      title: 'Funcionamiento perfecto',
      message: 'Todo anda de diez',
      icons: true,
      iconType: 'checkmark'
  });
};

```
