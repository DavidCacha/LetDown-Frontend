import { Platform } from 'react-native';

/**
 * Backend local (NestJS) — puerto 3000, prefijo global /api/v1.
 *
 * IMPORTANTE sobre BASE_URL en desarrollo local:
 * - Emulador Android: "localhost" apunta al propio emulador, no a tu PC.
 *   Por eso se usa 10.0.2.2, que Android mapea automáticamente a
 *   localhost de tu máquina.
 * - Simulador iOS: sí puede usar "localhost" directo.
 * - Celular físico (USB o wifi): ninguno de los dos funciona. Reemplaza
 *   manualmente LOCAL_HOST por la IP de tu PC en la red local, ej:
 *   const LOCAL_HOST = '192.168.1.45';
 *   (Windows: ejecuta `ipconfig` y busca "Dirección IPv4")
 */
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

/**
 * Wrapper de red que:
 * - Manda/parsea JSON automáticamente
 * - Agrega el header Authorization cuando se pasa accessToken
 * - Normaliza los errores de NestJS (class-validator) a un ApiError legible
 *
 * NOTA: usa XMLHttpRequest en vez de fetch(). En este proyecto (RN 0.74.0
 * + Android físico) fetch() falla de forma intermitente/consistente con
 * "TypeError: Network request failed" en peticiones POST con body JSON +
 * header Authorization sobre la IP LAN, mientras que la misma petición vía
 * XMLHttpRequest funciona siempre (confirmado con curl/Swagger en 201 y
 * con una prueba XHR directa). GET seguía funcionando bien con fetch, pero
 * se deja todo unificado en XHR para evitar sorpresas futuras.
 */
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