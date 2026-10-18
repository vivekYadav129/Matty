const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

export function getBackendBaseUrl() {
  return API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;
}

export function getOAuthUrl(provider) {
  const redirectUri = `${window.location.origin}/oauth2/redirect`;
  return `${API_BASE}/auth/oauth2/authorize/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export function getToken() {
  return localStorage.getItem('matty_token');
}

export function authHeaders() {
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
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    const errorMsg =
      errorData.error ||
      (errorData.errors && Object.values(errorData.errors)[0]) ||
      res.statusText ||
      'Request failed';
    throw new Error(errorMsg);
  }

  return res.json();
}

// ===== Auth =====
export const auth = {
  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        username: data.username ? data.username.trim() : '',
        email: data.email ? data.email.trim().toLowerCase() : '',
      }),
    }),
  login: (data) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        email: data.email ? data.email.trim().toLowerCase() : '',
      }),
    }),
  linkAccount: (data) =>
    request('/auth/link-account', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        email: data.email ? data.email.trim().toLowerCase() : '',
      }),
    }),
  me: () => request('/auth/me'),
  setSession: (response) => {
    if (response.token) {
      localStorage.setItem('matty_token', response.token);
    }
    const user = {
      id: response.id,
      username: response.username,
      email: response.email,
      role: response.role,
      plan: response.plan,
      profilePicUrl: response.profilePicUrl,
      provider: response.provider,
    };
    localStorage.setItem('matty_user', JSON.stringify(user));
    return user;
  },
  logout: () => {
    localStorage.removeItem('matty_token');
    localStorage.removeItem('matty_user');
  },
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
