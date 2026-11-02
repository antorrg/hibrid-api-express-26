import { beforeEach, describe, expect, it } from 'vitest';
import { adminLinkViewer } from './adminLinkViewer.js';

describe('adminLinkViewer', () => {
  beforeEach(() => {
    // Limpiamos cookies y DOM antes de cada test
    document.cookie = 'logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.body.innerHTML = `
      <ul>
        <li class="nav-item" id="adminNavItem" style="display: none;">
          <a class="nav-link active" id="adminLink" href="http://localhost:5173/admin" data-admin-url="http://localhost:5173/admin" data-login-url="http://localhost:5173/login">Admin</a>
        </li>
      </ul>
    `;
  });

  it('debe mantener el link oculto si no existe la cookie logged_in', () => {
    adminLinkViewer('logged_in');

    const navItem = document.getElementById('adminNavItem');
    expect(navItem.style.display).toBe('none');
  });

  it('debe mostrar el link de Admin si la cookie logged_in es "true"', () => {
    document.cookie = 'logged_in=true; path=/;';

    adminLinkViewer('logged_in');

    const navItem = document.getElementById('adminNavItem');
    const adminLink = document.getElementById('adminLink');

    expect(navItem.style.display).toBe('');
    expect(adminLink.textContent).toBe('Admin');
    expect(adminLink.getAttribute('href')).toBe('http://localhost:5173/admin');
  });

  it('debe mostrar el link como Login si fallback es "login" y la cookie no existe', () => {
    adminLinkViewer('logged_in', { fallback: 'login' });

    const navItem = document.getElementById('adminNavItem');
    const adminLink = document.getElementById('adminLink');

    expect(navItem.style.display).toBe('');
    expect(adminLink.textContent).toBe('Login');
    expect(adminLink.getAttribute('href')).toBe('http://localhost:5173/login');
  });
});
