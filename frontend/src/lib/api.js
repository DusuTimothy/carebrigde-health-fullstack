/* ==========================================================================
   API client. Talks to the Carebridge backend over HTTP+JSON using JWT
   bearer tokens. Set VITE_API_URL to point at the backend (defaults to the
   Vite dev proxy, which forwards /api to the backend in development).

   Backend contract:
     - Auth: Authorization: Bearer <token>
     - Success: { success, message, data }
     - Failure: { success:false, message, errors? }
   ========================================================================== */

const TOKEN_KEY = 'carebridge_token';

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — session-only auth */
  }
}

export function clearToken() {
  setToken(null);
}

function buildUrl(path) {
  if (/^https?:\/\//.test(path)) return path;
  if (/^\//.test(path)) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const url = buildUrl(path);

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, {
      credentials: 'omit',
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('The server returned an unreadable response.', response.status);
  }

  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok || payload.success === false) {
    const message = payload.message || payload.error || 'The request could not be completed.';
    const errors = payload.errors?.map((e) => e.message).filter(Boolean).join(' ');
    const finalMessage = errors ? `${message} ${errors}` : message;
    throw new ApiError(finalMessage || message, response.status, payload.errors);
  }

  return payload;
}