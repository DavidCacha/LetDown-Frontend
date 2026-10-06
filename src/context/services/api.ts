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
const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const BASE_URL = `http://${LOCAL_HOST}:3000/api/v1`;

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
 * Wrapper de fetch que:
 * - Manda/parsea JSON automáticamente
 * - Agrega el header Authorization cuando se pasa accessToken
 * - Normaliza los errores de NestJS (class-validator) a un ApiError legible
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, accessToken } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor. Revisa tu conexión o que el backend esté corriendo.',
      networkError,
    );
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');

  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {

    const rawMessage = payload?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join('\n')
      : rawMessage || `Error ${response.status}`;

    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}
