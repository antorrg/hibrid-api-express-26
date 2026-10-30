import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient, HttpError, getCookie, subscribeUnauthorized, subscribeForbidden } from './HttpClient';
import { AdminApi } from './AdminApi';

describe('HttpClient & AdminApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCookie utility', () => {
    it('extrae cookies correctamente', () => {
      document.cookie = 'logged_in=true; XSRF-TOKEN=secret123; other=value';
      expect(getCookie('XSRF-TOKEN')).toBe('secret123');
      expect(getCookie('logged_in')).toBe('true');
      expect(getCookie('nonexistent')).toBeNull();
    });
  });

  describe('HttpClient', () => {
    it('realiza una petición GET exitosa con credentials: include', async () => {
      const mockData = { id: 1, name: 'Test' };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response);

      const client = new HttpClient({ baseUrl: '/api/v1' });
      const result = await client.request<{ id: number; name: string }>({
        url: '/users',
        params: { active: true },
      });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/users?active=true',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    it('adjunta automáticamente el header X-CSRF-Token en métodos mutantes cuando existe la cookie XSRF-TOKEN', async () => {
      document.cookie = 'XSRF-TOKEN=csrf_secret_token_abc';

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ created: true }),
      } as Response);

      const client = new HttpClient({ baseUrl: '/api/v1' });
      await client.request({
        url: '/products',
        method: 'POST',
        payload: { title: 'Nuevo Producto' },
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/products',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: expect.objectContaining({
            'X-CSRF-Token': 'csrf_secret_token_abc',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ title: 'Nuevo Producto' }),
        })
      );
    });

    it('notifica a los suscriptores de unauthorized y lanza HttpError ante un 401', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: false, code: 'UNAUTHORIZED', message: 'No autenticado' }),
      } as Response);

      const unauthorizedSpy = vi.fn();
      const unsubscribe = subscribeUnauthorized(unauthorizedSpy);

      const client = new HttpClient({ baseUrl: '/api/v1' });

      await expect(client.request({ url: '/auth/me' })).rejects.toBeInstanceOf(HttpError);
      expect(unauthorizedSpy).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('notifica a los suscriptores de forbidden ante un 403', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: false, code: 'ROLE_NOT_ALLOWED', message: 'Faltan permisos' }),
      } as Response);

      const forbiddenSpy = vi.fn();
      const unsubscribe = subscribeForbidden(forbiddenSpy);

      const client = new HttpClient({ baseUrl: '/api/v1' });

      await expect(client.request({ url: '/admin/logs' })).rejects.toBeInstanceOf(HttpError);
      expect(forbiddenSpy).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });

  describe('AdminApi', () => {
    it('ejecuta la llamada, desenvuelve datos y notifica éxito si hasMessage es true', async () => {
      const client = new HttpClient();
      vi.spyOn(client, 'request').mockResolvedValue({ id: 'item-1', name: 'Articulo' });

      const notify = {
        success: vi.fn(),
        error: vi.fn(),
      };

      const api = new AdminApi(client, notify);
      const result = await api.execute({
        request: { url: '/items/item-1' },
        hasMessage: true,
        successMessage: 'Cargado con éxito',
      });

      expect(result).toEqual({ id: 'item-1', name: 'Articulo' });
      expect(notify.success).toHaveBeenCalledWith('Cargado con éxito');
    });

    it('desenvuelve ApiResponse con { ok: true, data: T } si el backend lo devuelve así', async () => {
      const client = new HttpClient();
      vi.spyOn(client, 'request').mockResolvedValue({ ok: true, data: { value: 42 } });

      const api = new AdminApi(client);
      const result = await api.execute({
        request: { url: '/test' },
      });

      expect(result).toEqual({ value: 42 });
    });

    it('notifica error con notify.error y llama a reject cuando falla la petición', async () => {
      const client = new HttpClient();
      const error = new HttpError(500, 'Fallo interno del servidor');
      vi.spyOn(client, 'request').mockRejectedValue(error);

      const notify = {
        success: vi.fn(),
        error: vi.fn(),
      };
      const reject = vi.fn();

      const api = new AdminApi(client, notify);
      await api.execute({
        request: { url: '/error-endpoint' },
        errorMessage: 'Error por defecto',
        reject,
      });

      expect(notify.error).toHaveBeenCalledWith('Fallo interno del servidor');
      expect(reject).toHaveBeenCalledWith(error);
    });
  });
});
