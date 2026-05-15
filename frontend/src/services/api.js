const API_BASE = 'http://localhost:8080/api';

function getToken() {
  return localStorage.getItem('matty_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// ===== Auth =====
export const auth = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
};

// ===== Designs =====
export const designs = {
  list: (page = 0, size = 12) => request(`/designs?page=${page}&size=${size}`),
  get: (id) => request(`/designs/${id}`),
  create: (data) => request('/designs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/designs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/designs/${id}`, { method: 'DELETE' }),
  duplicate: (id) => request(`/designs/${id}/duplicate`, { method: 'POST' }),
  public: (page = 0, size = 12) => request(`/designs/public?page=${page}&size=${size}`),
};

// ===== Templates =====
export const templates = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/templates?${query}`);
  },
  get: (id) => request(`/templates/${id}`),
  use: (id) => request(`/templates/${id}/use`, { method: 'POST' }),
  create: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/templates/${id}`, { method: 'DELETE' }),
};

// ===== Users =====
export const users = {
  me: () => request('/users/me'),
  update: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/users/me/password', { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: () => request('/users/me', { method: 'DELETE' }),
};

// ===== Admin =====
export const admin = {
  users: (page = 0, size = 20) => request(`/admin/users?page=${page}&size=${size}`),
  changeRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  stats: () => request('/admin/stats'),
};

// ===== Upload =====
export const upload = {
  image: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Upload Error Response:', errorText);
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }
    return res.json();
  },
};
