const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'Đã xảy ra lỗi khi gọi API');
    error.status = response.status;
    error.details = payload.details || null;
    throw error;
  }

  return payload;
};

// ===== MOVIES API =====
export const movieApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ).toString();
    return request(`/movies${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/movies/${id}`),
  create: (data) => request('/movies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/movies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/movies/${id}`, { method: 'DELETE' })
};

// ===== ROOMS API =====
export const roomApi = {
  getAll: () => request('/rooms'),
  getById: (id) => request(`/rooms/${id}`),
  create: (data) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/rooms/${id}`, { method: 'DELETE' })
};

// ===== SHOWTIMES API =====
export const showtimeApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ).toString();
    return request(`/showtimes${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/showtimes/${id}`),
  create: (data) => request('/showtimes', { method: 'POST', body: JSON.stringify(data) }),
  generate: (data) => request('/showtimes/generate', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/showtimes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/showtimes/${id}`, { method: 'DELETE' })
};
