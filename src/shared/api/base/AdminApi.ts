import { HttpClient, type HttpRequestConfig } from './HttpClient';
import { toast } from '../../toast/toastManager';

export type NotifyFn = {
  success(message: string, title?: string): void;
  error(message: string, title?: string): void;
  warning?(message: string, title?: string): void;
  info?(message: string, title?: string): void;
};

export interface ApiResponse<T> {
  ok?: boolean;
  data?: T;
  message?: string;
}

export interface ExecuteOptions<T> {
  request: HttpRequestConfig;
  hasMessage?: boolean;
  successMessage?: string | null | undefined;
  errorMessage?: string;
  success?: (data: T) => void;
  reject?: (error: unknown) => void;
}

const defaultNotify: NotifyFn = {
  success: (msg, title = 'Acción exitosa') => toast.success(msg, title),
  error: (msg, title = 'Error') => toast.error(msg, title),
  warning: (msg, title = 'Advertencia') => toast.warning(msg, title),
  info: (msg, title = 'Información') => toast.info(msg, title),
};

export class AdminApi {
  private http: HttpClient;
  private notify: NotifyFn;

  constructor(
    http: HttpClient,
    notify: NotifyFn = defaultNotify,
  ) {
    this.http = http;
    this.notify = notify;
  }

  async execute<T>({
    request,
    hasMessage,
    successMessage,
    errorMessage,
    success,
    reject,
  }: ExecuteOptions<T>): Promise<T | void> {
    try {
      const rawResult = await this.http.request<T | ApiResponse<T>>(request);

      // Si el backend responde con un wrapper { ok: true, data: T }, desenvolvemos data.
      // Si responde directamente con la entidad/arreglo (como hace Express responder()), usamos el resultado directamente.
      let data: T;
      if (
        rawResult !== null &&
        typeof rawResult === 'object' &&
        'ok' in rawResult &&
        'data' in rawResult
      ) {
        data = (rawResult as ApiResponse<T>).data as T;
      } else {
        data = rawResult as T;
      }

      if (hasMessage) {
        const messageToShow =
          successMessage ||
          (typeof rawResult === 'object' && rawResult !== null && 'message' in rawResult
            ? String((rawResult as ApiResponse<T>).message)
            : undefined);

        if (messageToShow) {
          this.notify.success(messageToShow);
        }
      }

      success?.(data);
      return data;
    } catch (error: any) {//eslint-disable-line
      const backendMessage = error?.message || error?.error?.message;
      this.notify.error(backendMessage ?? errorMessage ?? 'Error desconocido');
      console.error('[AdminApi error]:', error);
      reject?.(error);
    }
  }
}
