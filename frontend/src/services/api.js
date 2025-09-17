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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger logout here
      console.warn('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (email, password, userData) =>
    api.post('/api/v1/auth/signup', { email, password, ...userData }),
  
  login: (email, password) =>
    api.post('/api/v1/auth/login', { email, password }),
  
  refreshToken: () =>
    api.post('/api/v1/auth/refresh'),
  
  getProfile: () =>
    api.get('/api/v1/auth/profile'),
};

// Chat API
export const chatAPI = {
  sendMessage: ({ message, session_id = null, history = [] }) =>
    api.post('/api/chat', { message, session_id, history }),
};

// Career API
export const careerAPI = {
  getRecommendations: () => api.get('/api/recommendations'),
};

// Profile API
export const profileAPI = {
  fetch: () => api.get('/api/v1/profiles/me'),
  save: (profileData) => api.post('/api/profile', profileData),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    api.get('/api/v1/analytics/dashboard'),
  
  getMarketTrends: () =>
    api.get('/api/v1/analytics/market-trends'),
  
  getSkillAnalytics: () =>
    api.get('/api/v1/analytics/skill-analytics'),
  
  getCareerJourney: () =>
    api.get('/api/v1/analytics/career-journey'),
};

export default api;