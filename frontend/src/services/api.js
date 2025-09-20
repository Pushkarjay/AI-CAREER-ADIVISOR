import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Small helper to unwrap different backend shapes safely
const safeData = (res) => res?.data ?? {};

// Auth API
export const authAPI = {
  signup: (email, password, userData) => api.post('/api/v1/auth/signup', { email, password, ...userData }),
  login: (email, password) => api.post('/api/v1/auth/login', { email, password }),
  refreshToken: () => api.post('/api/v1/auth/refresh'),
  getProfile: () => api.get('/api/v1/auth/profile'),
};

// Chat API
export const chatAPI = {
  sendMessage: ({ message, session_id = null, history = [] }) => api.post('/api/chat', { message, session_id, history }),
};

// Career API
export const careerAPI = {
  // Adapter: may return array directly or object with recommended_careers
  getRecommendations: async () => {
    try {
      const res = await api.get('/api/recommendations');
      const data = safeData(res);
      // Support multiple shapes from adapter/alias
      if (Array.isArray(data)) {
        return { data };
      }
      if (Array.isArray(data?.items)) {
        return { data: data.items };
      }
      if (Array.isArray(data?.recommended_careers)) {
        return { data: data.recommended_careers };
      }
      if (Array.isArray(data?.careers)) {
        return { data: data.careers }; // legacy
      }
      return { data: [] };
    } catch (e) {
      console.error('getRecommendations failed', e.response?.status, e.response?.data);
      throw e;
    }
  },
  // Public trends passthrough
  getTrends: () => api.get('/api/career-trends'),
  // V1 search endpoint expects post body
  search: (query, filters = {}) => {
    // Translate simple query string into skills/interests heuristically
    const tokens = String(query || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const body = {
      skills: filters.skills || tokens,
      interests: filters.interests || [],
      industries: filters.industry ? [filters.industry] : [],
      experience_level: filters.experience || 'entry',
      location: filters.location || 'India',
    };
    return api.post('/api/v1/careers/search', body);
  },
  // Optional careers list if exposed later
  getCareers: () => api.get('/api/careers'),
};

// Roadmaps API client
export const roadmapAPI = {
  list: () => api.get('/api/roadmaps/'),
  get: (domainId) => api.get(`/api/v1/roadmaps/${encodeURIComponent(domainId)}`),
  recommend: () => api.get('/api/v1/roadmaps/recommendations')
};

// Profile API
export const profileAPI = {
  fetch: () => api.get('/api/profile').catch((error) => { throw error; }),
  save: (profileData) => api.post('/api/profile', profileData).catch((error) => { throw error; }),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/api/v1/analytics/dashboard'),
  getMarketTrends: () => api.get('/api/v1/analytics/market-trends'),
  getSkillAnalytics: () => api.get('/api/v1/analytics/skill-analytics'),
  getCareerJourney: () => api.get('/api/v1/analytics/career-journey'),
};

export default api;