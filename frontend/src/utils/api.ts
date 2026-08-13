// Dev: Vite proxy forwards /api → localhost:5001 (vite.config.ts).
// Prod: requests hit /api, which vercel.json proxies to the Render backend.
// VITE_API_URL can override this to call the backend directly.
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

function buildHeaders(): HeadersInit {
  const token = localStorage.getItem('wf_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('wf_token');
    window.location.replace('/login');
    throw new Error('Unauthorized');
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. a proxy/gateway error page).
    if (!res.ok) {
      throw new Error("Couldn't reach the server. It may be waking up — please try again in a moment.");
    }
    throw new Error('Invalid response from server');
  }

  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}

// Wraps fetch so a dropped connection (offline, or the backend still spinning
// up on Render's free tier) surfaces a friendly message instead of "Failed to fetch".
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { headers: buildHeaders(), ...init });
  } catch {
    throw new Error("Couldn't reach the server. It may be waking up — please try again in a moment.");
  }
  return handleResponse<T>(res);
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),

  post: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
};
