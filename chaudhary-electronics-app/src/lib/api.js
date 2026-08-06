// Thin fetch wrapper for the backend at server/ (see server/README.md for the full API
// reference). Handles the JSON envelope every endpoint returns, attaches the bearer access
// token, and transparently retries once via the refresh-token cookie on a 401.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
// The server also serves locally-stored uploads (/uploads/...) from its root, not under /api/v1.
export const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');

/** Resolves a possibly-relative image URL (local disk storage returns e.g. "/uploads/x.png")
 * against the API origin; absolute URLs (Cloudinary, or any http(s) URL) pass through untouched. */
export function resolveImageUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url}`;
}

let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}
/** Called once (from AuthContext) so this module can clear auth state on an
 * unrecoverable 401 without importing AuthContext itself (would be circular). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

class ApiRequestError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors || [];
  }
}

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function request(method, path, { body, isForm = false, retry = true } = {}) {
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let payload = body;
  if (body && !isForm) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: payload,
      credentials: 'include', // send/receive the httpOnly refresh-token cookie
    });
  } catch (networkErr) {
    // fetch() itself only throws for things that never reached a server response at all:
    // the backend is down, DNS/connection failure, or — very commonly in local dev — a CORS
    // rejection (e.g. the frontend ended up on a port the backend's CLIENT_URL allowlist
    // doesn't know about). status: 0 lets callers tell this apart from a real 401/403/etc.
    if (import.meta.env.DEV) {
      console.error(`[api] ${method} ${path} — network/CORS failure (browser blocked or unreachable):`, networkErr);
    }
    throw new ApiRequestError('Could not reach the server. Check your connection and try again.', 0, []);
  }

  if (res.status === 401 && retry && path !== '/auth/refresh' && path !== '/auth/login') {
    const refreshed = await tryRefresh();
    if (refreshed) return request(method, path, { body, isForm, retry: false });
    onUnauthorized?.();
  }

  const json = await parseJson(res);
  if (!res.ok) {
    if (import.meta.env.DEV) {
      console.error(`[api] ${method} ${path} — ${res.status} ${res.statusText}:`, json || '(no JSON body)');
    }
    // Prefer the first specific field error ("Price must be a positive number") over the
    // generic envelope message ("Validation failed") — the generic one is never actionable.
    const message = json?.errors?.[0]?.message || json?.message || `Request failed (${res.status})`;
    throw new ApiRequestError(message, res.status, json?.errors);
  }
  return json; // { success, message, data, meta? }
}

let refreshPromise = null;
async function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return false;
        const json = await parseJson(res);
        if (json?.data?.accessToken) {
          setAccessToken(json.data.accessToken);
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body, opts) => request('POST', path, { body, ...opts }),
  patch: (path, body, opts) => request('PATCH', path, { body, ...opts }),
  delete: (path) => request('DELETE', path),
};

export { ApiRequestError };
