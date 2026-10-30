import { HttpClient, subscribeUnauthorized, subscribeForbidden } from './base/HttpClient';
import { AdminApi } from './base/AdminApi';

export const basePath = import.meta.env.VITE_BASE_PATH;
console.log('soy la base ', basePath)

// Cliente HTTP base configurado para el prefijo de la API (/api/v1)
export const httpClient = new HttpClient({
  baseUrl: `${basePath}/api/v1`,
});

// APIs para el consumo desde componentes o servicios
export const publicApi = new AdminApi(new HttpClient({ baseUrl: `${basePath}/api/v1/extclients` }));
export const sessionApi = new AdminApi(new HttpClient({ baseUrl: `${basePath}/api/v1` }));
export const adminApi = new AdminApi(new HttpClient({ baseUrl: `${basePath}/api/v1` }));

// Re-exportamos los suscriptores globales para que la UI (ej. AuthProvider o Router) reaccione
export { subscribeUnauthorized, subscribeForbidden };
