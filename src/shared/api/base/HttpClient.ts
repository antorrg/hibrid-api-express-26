export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestConfig {
  url: string;
  method?: HttpMethod;
  payload?: any;
  body?: any;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
}

export interface HttpClientOptions {
  baseUrl?: string;
  onUnauthorized?: (error: any) => void | Promise<void>;
  onForbidden?: (error: any) => void | Promise<void>;
  onResponseError?: (error: any) => void | Promise<void>;
}

export interface ApiErrorPayload {
  ok?: boolean;
  code?: string;
  message?: string;
  details?: unknown;
}

export class HttpError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type SessionListener = (error: any) => void;
const unauthorizedListeners: Set<SessionListener> = new Set();
const forbiddenListeners: Set<SessionListener> = new Set();

export const subscribeUnauthorized = (listener: SessionListener) => {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
};

export const subscribeForbidden = (listener: SessionListener) => {
  forbiddenListeners.add(listener);
  return () => {
    forbiddenListeners.delete(listener);
  };
};

const notifyUnauthorized = (error: any) => {
  unauthorizedListeners.forEach((fn) => fn(error));
};

const notifyForbidden = (error: any) => {
  forbiddenListeners.forEach((fn) => fn(error));
};

/**
 * Helper para leer cookies legibles por JS (como XSRF-TOKEN o logged_in)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export class HttpClient {
  private baseUrl: string;
  private onUnauthorized?: (error: any) => void | Promise<void>;
  private onForbidden?: (error: any) => void | Promise<void>;
  private onResponseError?: (error: any) => void | Promise<void>;

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? '').replace(/\/+$/, '');
    this.onUnauthorized = options.onUnauthorized;
    this.onForbidden = options.onForbidden;
    this.onResponseError = options.onResponseError;
  }

  async request<T = unknown>(config: HttpRequestConfig): Promise<T> {
    const method: HttpMethod = (config.method || 'GET').toUpperCase() as HttpMethod;
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    // Construcción de la URL
    let fullUrl = config.url.startsWith('http://') || config.url.startsWith('https://')
      ? config.url
      : `${this.baseUrl}/${config.url.replace(/^\/+/, '')}`;

    if (config.params) {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Cabeceras por defecto
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...config.headers,
    };

    // Doble cookie / CSRF protection:
    // Si es un método mutante, extraemos el token de la cookie XSRF-TOKEN
    // y lo inyectamos en la cabecera x-csrf-token
    if (isMutating) {
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (xsrfToken && !headers['x-csrf-token'] && !headers['X-CSRF-Token']) {
        headers['X-CSRF-Token'] = xsrfToken;
      }
    }

    // Preparación del cuerpo
    let body: BodyInit | undefined = undefined;
    const rawBody = config.body ?? config.payload;

    if (rawBody !== undefined && rawBody !== null && method !== 'GET') {
      if (typeof FormData !== 'undefined' && rawBody instanceof FormData) {
        body = rawBody;
        // El navegador asigna el Content-Type multipart/form-data con boundary automáticamente
        delete headers['Content-Type'];
      } else if (typeof rawBody === 'string') {
        body = rawBody;
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      } else {
        body = JSON.stringify(rawBody);
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body,
        // 'include' asegura que la cookie de sesión (app.sid, httpOnly) viaje con cada request
        credentials: 'include',
      });

      // Manejo de respuesta vacía (204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const responseData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorPayload: ApiErrorPayload = typeof responseData === 'object' && responseData !== null
          ? responseData
          : { message: String(responseData || response.statusText) };

        const error = new HttpError(
          response.status,
          errorPayload.message || `Error en la petición: ${response.status}`,
          errorPayload.code,
          errorPayload.details
        );

        throw error;
      }

      return responseData as T;
    } catch (error: any) {
      await this.onResponseError?.(error);

      const status = error?.status;
      const code = error?.code;
      const message = String(error?.message || '');

      const isUnauthorized =
        status === 401 ||
        code === 'UNAUTHORIZED' ||
        code === 'SESSION_EXPIRED' ||
        code === 'SESSION_INVALID' ||
        message.includes('Unauthenticated') ||
        message.includes('No session provided');

      if (isUnauthorized) {
        await this.onUnauthorized?.(error);
        notifyUnauthorized(error);
      }

      const isForbidden =
        status === 403 ||
        code === 'FORBIDDEN' ||
        code === 'ACCESS_DENIED' ||
        code === 'ROLE_NOT_ALLOWED' ||
        code === 'CSRF_DETECTED';

      if (isForbidden) {
        await this.onForbidden?.(error);
        notifyForbidden(error);
      }

      throw error;
    }
  }
}
