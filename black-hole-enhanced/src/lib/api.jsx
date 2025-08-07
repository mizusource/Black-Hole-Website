import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://lnh8imcnw9nw.manus.space/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verify: (data) => api.post('/auth/verify', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
};

// Manga API
export const mangaAPI = {
  getList: (params) => api.get('/manga', { params }),
  getDetails: (id) => api.get(`/manga/${id}`),
  getChapter: (mangaId, chapterId) => api.get(`/manga/${mangaId}/chapters/${chapterId}`),
  rateManga: (id, rating) => api.post(`/manga/${id}/rate`, { rating }),
  rateChapter: (mangaId, chapterId, rating) => api.post(`/manga/${mangaId}/chapters/${chapterId}/rate`, { rating }),
  addReview: (id, data) => api.post(`/manga/${id}/review`, data),
  addComment: (mangaId, chapterId, data) => api.post(`/manga/${mangaId}/chapters/${chapterId}/comments`, data),
  toggleFavorite: (id) => api.post(`/manga/${id}/favorite`),
  getFavorites: (params) => api.get('/manga/favorites', { params }),
  getReadingProgress: (params) => api.get('/manga/reading-progress', { params }),
};

// Admin API
export const adminAPI = {
  login: (password) => api.post('/admin/login', { password }),
  getStats: () => api.get('/admin/stats'),
  createManga: (data) => api.post('/admin/manga', data),
  updateManga: (id, data) => api.put(`/admin/manga/${id}`, data),
  deleteManga: (id) => api.delete(`/admin/manga/${id}`),
  createChapter: (mangaId, data) => api.post(`/admin/manga/${mangaId}/chapters`, data),
  updateChapter: (id, data) => api.put(`/admin/chapters/${id}`, data),
  deleteChapter: (id) => api.delete(`/admin/chapters/${id}`),
  getComments: (params) => api.get('/admin/comments', { params }),
  pinComment: (id) => api.post(`/admin/comments/${id}/pin`),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id) => api.post(`/admin/users/${id}/ban`),
  promoteUser: (id) => api.post(`/admin/users/${id}/promote`),
};

// User API
export const userAPI = {
  getList: (params) => api.get('/users', { params }),
  getProfile: (id) => api.get(`/users/${id}`),
};

export default api;

