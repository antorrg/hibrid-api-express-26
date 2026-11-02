/**
 * Lee el valor de una cookie accesible por JavaScript (no httpOnly).
 * @param {string} name - Nombre de la cookie a buscar.
 * @returns {string|null} - Valor de la cookie o null si no existe.
 */
function getCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

/**
 * Controla la visibilidad y contenido del enlace Admin en el header según la cookie de sesión.
 * 
 * @param {string} [name='logged_in'] - Nombre de la cookie visible.
 * @param {Object} [options={}] - Opciones de configuración.
 * @param {'none'|'login'} [options.fallback='none'] - Comportamiento cuando no hay sesión:
 *   - 'none': oculta el enlace completamente ("Admin o nada").
 *   - 'login': muestra el enlace con texto "Login" y ruta de acceso ("Admin o login").
 */
export function adminLinkViewer(name = 'logged_in', { fallback = 'none' } = {}) {
  const navItem = document.getElementById('adminNavItem');
  const adminLink = document.getElementById('adminLink');

  if (!navItem) return;

  const cookieValue = getCookie(name);
  const isLoggedIn = cookieValue === 'true';

  if (isLoggedIn) {
    navItem.style.display = '';
    navItem.classList.remove('d-none');
    if (adminLink) {
      adminLink.textContent = 'Admin';
      if (adminLink.dataset.adminUrl) {
        adminLink.href = adminLink.dataset.adminUrl;
      }
    }
  } else {
    if (fallback === 'login') {
      navItem.style.display = '';
      navItem.classList.remove('d-none');
      if (adminLink) {
        adminLink.textContent = 'Login';
        if (adminLink.dataset.loginUrl) {
          adminLink.href = adminLink.dataset.loginUrl;
        }
      }
    } else {
      // Opción 'none': el enlace desaparece completamente
      navItem.style.display = 'none';
    }
  }
}