// Tiny fetch wrapper. The Vite dev server proxies /api → http://localhost:4000.
const BASE = '/api';
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

async function request(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(API_TOKEN ? { 'X-API-Key': API_TOKEN } : {}),
    ...(opts.headers || {}),
  };
  const res = await fetch(BASE + path, {
    ...opts,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  health: () => request('/health'),
  donors: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/donors' + (q ? `?${q}` : ''));
    },
    create: (data) => request('/donors', { method: 'POST', body: JSON.stringify(data) }),
  },
  hospitals: {
    list: () => request('/hospitals'),
    create: (data) => request('/hospitals', { method: 'POST', body: JSON.stringify(data) }),
  },
  inventory: {
    list: () => request('/inventory'),
    adjust: (bloodGroup, delta) =>
      request('/inventory/adjust', { method: 'POST', body: JSON.stringify({ bloodGroup, delta }) }),
  },
  requests: {
    list: () => request('/requests'),
    create: (data) => request('/requests', { method: 'POST', body: JSON.stringify(data) }),
    fulfill: (id) => request(`/requests/${id}/fulfill`, { method: 'POST' }),
  },
  donations: {
    list: () => request('/donations'),
    create: (data) => request('/donations', { method: 'POST', body: JSON.stringify(data) }),
  },
  analytics: {
    summary: () => request('/analytics/summary'),
    trends: () => request('/analytics/trends'),
  },
};
