const BASE = '/api';

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
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

export const api = {
  get: <T = unknown>(path: string) =>
    fetch(`${BASE}${path}`, { headers: buildHeaders() }).then<T>(r => handleResponse<T>(r)),

  post: <T = unknown>(path: string, body: unknown) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then<T>(r => handleResponse<T>(r)),

  put: <T = unknown>(path: string, body: unknown) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then<T>(r => handleResponse<T>(r)),

  del: <T = unknown>(path: string) =>
    fetch(`${BASE}${path}`, { method: 'DELETE', headers: buildHeaders() }).then<T>(r =>
      handleResponse<T>(r)
    ),
};
