import './uiInteractions.js';
import { colorModes } from './colorModes.js';
import modalService from './modalService.mjs';
import {
  showConfirmationModal,
  validateEmail,
  capitalizeFirstLetter,
  showModal,
  showExit,
  showFailed,
} from './contact.mjs';

document.addEventListener('DOMContentLoaded', () => {
  colorModes();

  // Selección del formulario
  const contactForm = document.getElementById('sendEmail');
  if (contactForm) {
    const initialInput = {
      email: '',
      subject: '',
      message: '',
    };

    let input = { ...initialInput };
    let error = { ...initialInput };

    const handleOnChange = (event) => {
      const { name, value } = event.target;
      input[name] = value;
      error = validateEmail(input);

      // Actualiza el texto de error solo si el elemento existe en el DOM
      const errorElem = document.getElementById(`error${capitalizeFirstLetter(name)}`);
      if (errorElem && error[name] !== undefined) {
        errorElem.textContent = error[name];
      }

      // Habilita o deshabilita el botón de enviar
      const permit =
        !input.email.trim() ||
        !input.subject.trim() ||
        !input.message.trim() ||
        error.email ||
        error.subject ||
        error.message;
      document.getElementById('submitButton').disabled = permit;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      error = validateEmail(input);

      // Verifica errores antes de enviar
      if (Object.values(error).some((err) => err)) {
        return;
      }

      // Confirmación antes de enviar
      const accepted = await showConfirmationModal({
        type: 'info',
        title: '¿Está seguro de enviar el email?',
        message: 'Por favor confirme su acción.',
      });
      if (accepted) {
        showModal();

        // Leemos CSRF y Honeypot directamente del DOM
        const payload = {
          ...input,
          _csrf: document.getElementById('csrfToken')?.value || '',
          website: document.getElementById('website')?.value || '',
        };

        const response = await sendEmailFunction(payload);
        if (response.ok) {
          modalService.closeAll();
          showExit();

          // Redirección después de 4 segundos
          setTimeout(() => {
            window.location.href = '/';
          }, 4000);
        } else {
          modalService.closeAll();
          showFailed('Hubo un problema al procesar su solicitud.');
        }
      }
    };

    async function sendEmailFunction(payload) {
      try {
        const response = await fetch('/api/v1/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          input = { ...initialInput };
          document.getElementById('email').value = '';
          document.getElementById('subject').value = '';
          document.getElementById('message').value = '';
          const websiteEl = document.getElementById('website');
          if (websiteEl) websiteEl.value = '';
          return { ok: true };
        }
        return { ok: false };
      } catch (error) {
        modalService.closeAll();
        showFailed('¡Error inesperado. Intente nuevamente más tarde!');
        return { ok: false };
      }
    }

    // Agrega eventos a los campos interactivos y botones
    document.getElementById('email').addEventListener('input', handleOnChange);
    document.getElementById('subject').addEventListener('input', handleOnChange);
    document.getElementById('message').addEventListener('input', handleOnChange);
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', handleSubmit);

    // Botón de cancelar
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
      cancelButton.addEventListener('click', async () => {
        const accepted = await showConfirmationModal({
          type: 'info',
          title: '¿Seguro quiere salir?',
          message: 'Será redirigido a Home.',
        });
        if (accepted) {
          window.location.href = '/';
        }
      });
    }
  }
});
