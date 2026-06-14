/**
 * Thin fetch wrapper that all service modules go through.
 *
 *  - Reads the base URL from `VITE_API_BASE_URL`.
 *  - Unwraps the backend's `{ success, data }` envelope.
 *  - Throws a typed `ApiError` on failure so callers can show messages.
 *  - Injects the bearer token (when present) on every request.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'bpl.token';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip attaching the auth token (e.g. for public endpoints). */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false, signal } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token && !skipAuth) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Is the API running?');
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, 'BAD_RESPONSE', 'Malformed server response');
    }
  }

  const envelope = payload as
    | { success: true; data: T }
    | { success: false; error: { message: string; code: string } }
    | null;

  if (!res.ok || !envelope || envelope.success === false) {
    const message =
      envelope && envelope.success === false ? envelope.error.message : `Request failed (${res.status})`;
    const code = envelope && envelope.success === false ? envelope.error.code : 'HTTP_ERROR';

    // An expired/invalid token should drop the local session.
    if (res.status === 401 && !skipAuth) setToken(null);

    throw new ApiError(res.status, code, message);
  }

  return envelope.data;
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
};
