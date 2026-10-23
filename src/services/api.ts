import { Platform } from 'react-native';

const LOCAL_HOST = '192.168.100.5';

export const BASE_URL = `https://id-7f4a23b6e3e7431e8515e6735ad09287.ecs.us-east-2.on.aws/api/v1`;

export class ApiError extends Error {
  statusCode: number;
  details: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
}

export function apiFetch<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, accessToken } = options;
  const url = `${BASE_URL}${path}`;

  console.log('[apiFetch] ->', method, url);

  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (accessToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    }

    xhr.onload = () => {
      const contentType = xhr.getResponseHeader('content-type') || '';
      const isJson = contentType.includes('application/json');

      let payload: any = null;
      if (isJson && xhr.responseText) {
        try {
          payload = JSON.parse(xhr.responseText);
        } catch {
          payload = null;
        }
      }

      const ok = xhr.status >= 200 && xhr.status < 300;

      if (!ok) {

        const rawMessage = payload?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join('\n')
          : rawMessage || `Error ${xhr.status}`;

        reject(new ApiError(xhr.status, message, payload));
        return;
      }

      resolve(payload as T);
    };

    xhr.onerror = (event) => {
      reject(
        new ApiError(
          0,
          'No se pudo conectar con el servidor. Revisa tu conexión o que el backend esté corriendo.',
          event,
        ),
      );
    };

    xhr.ontimeout = () => {
      reject(
        new ApiError(
          0,
          'La conexión con el servidor tardó demasiado. Intenta de nuevo.',
          null,
        ),
      );
    };

    xhr.send(body !== undefined ? JSON.stringify(body) : undefined);
  });
}