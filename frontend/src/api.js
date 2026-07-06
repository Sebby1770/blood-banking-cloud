const BASE = '/api';

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
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
    eligibility: (id) => request(`/donors/${id}/eligibility`),
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
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/requests' + (q ? `?${q}` : ''));
    },
    queue: () => request('/requests/queue'),
    create: (data) => request('/requests', { method: 'POST', body: JSON.stringify(data) }),
    fulfill: (id) => request(`/requests/${id}/fulfill`, { method: 'POST' }),
    cancel: (id) => request(`/requests/${id}/cancel`, { method: 'POST' }),
    matches: (id) => request(`/requests/${id}/matches`),
  },
  donations: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/donations' + (q ? `?${q}` : ''));
    },
    create: (data) => request('/donations', { method: 'POST', body: JSON.stringify(data) }),
  },
  analytics: {
    summary: () => request('/analytics/summary'),
    trends: () => request('/analytics/trends'),
    activity: (limit = 30) => request(`/analytics/activity?limit=${limit}`),
    fulfillment: () => request('/analytics/fulfillment'),
    urgency: () => request('/analytics/urgency'),
    cities: () => request('/analytics/cities'),
    donorsByGroup: () => request('/analytics/donors-by-group'),
    forecast: () => request('/analytics/forecast'),
  },
  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  outreach: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/outreach' + (q ? `?${q}` : ''));
    },
  },
  alerts: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/alerts' + (q ? `?${q}` : ''));
    },
    count: () => request('/alerts/count'),
    markRead: (id) => request(`/alerts/${id}/read`, { method: 'POST' }),
    markAllRead: () => request('/alerts/read-all', { method: 'POST' }),
  },
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  compatibility: {
    matrix: () => request('/compatibility'),
    forGroup: (group) => request(`/compatibility/${encodeURIComponent(group)}`),
  },
};