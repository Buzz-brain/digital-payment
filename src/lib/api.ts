// Reusable API helper: centralizes backend base URL and fetch behaviour
export const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE)
  || (typeof process !== 'undefined' && process.env.REACT_APP_API_BASE)
  || 'http://localhost:5000';

// Helper to get token from persisted zustand store (localStorage)
function getAuthToken() {
  try {
    // Only use the single source of truth: `dpi-auth`
    const raw = localStorage.getItem('dpi-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options?: RequestInit) {
  const normalizedBase = apiBase.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${normalizedBase}${normalizedPath}`;

  // Inject Authorization header if token exists
  const token = getAuthToken();
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const fetchOptions = { ...options, headers };

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    // Try to parse a JSON error body to surface a friendly message
    let parsedBody: any = null;
    let textBody: string | null = null;
    try {
      parsedBody = await res.json();
    } catch (e) {
      try {
        textBody = await res.text();
      } catch (e) {
        textBody = res.statusText || 'Error';
      }
    }

    const friendlyMessage = (parsedBody && (parsedBody.message || parsedBody.error)) || textBody || res.statusText || 'Request failed';
    const error: any = new Error(typeof friendlyMessage === 'string' ? friendlyMessage : JSON.stringify(friendlyMessage));
    error.status = res.status;
    error.body = parsedBody;
    throw error;
  }

  // attempt to parse json, otherwise return text
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export const apiGet = (path: string) => apiFetch(path, { method: 'GET' });
export const apiPost = (path: string, body?: any) => apiFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, headers: { 'Content-Type': 'application/json' } });
export const apiPut = (path: string, body?: any) => apiFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, headers: { 'Content-Type': 'application/json' } });
export const apiDelete = (path: string) => apiFetch(path, { method: 'DELETE' });

export default apiFetch;
