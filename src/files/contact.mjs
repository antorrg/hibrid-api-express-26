import modalService from "./modalService.mjs";

export const validateEmail = (input) => {
  const errors = { email: '', issue: '', message: '' };
  if (!input.email) errors.email = 'Email es requerido';
  else if (!/\S+@\S+\.\S+/.test(input.email)) errors.email = 'Email es invalido';
  if (!input.issue) errors.issue = 'Asunto es requerido';
  if (input.issue.length < 4) errors.issue = 'Asunto muy corto';
  if (!input.message) errors.message = 'Mensaje es requerido';
  if (input.message.includes('<script>')) errors.message = 'Mensaje es invalido';
  if (input.message.length < 20) errors.message = 'Mensaje es muy corto';
  if (input.message.length > 1000) errors.message = 'Mensaje es muy largo';
  return errors;
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function showConfirmationModal({
  type = 'info',
  title = 'Titulo',
  message = 'mensaje',
}) {
  return new Promise((resolve) => {
    modalService.showModal({
      type,
      title,
      message,
      showAcceptButton: true,
      showDenyButton: true,
      autoHide: false,
      onAccept: () => resolve(true),
      onDeny: () => resolve(false),
    });
  });
}

export function showModal() {
  modalService.showModal({
    type: 'warning',
    title: 'Aguarde un momento...',
    loader: true,
    autoHide: false,
  });
}

export const showExit = () => {
  modalService.showModal({
    type: 'success',
    title: '!Envío exitoso!',
    message: 'Prontamente será contactado',
    icons: true,
    iconType: 'checkmark',
  });
};

export const showFailed = (message) => {
  modalService.showModal({
    type: 'error',
    title: '¡Envío fallido!',
    message: message,
  });
};