import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  getSessions: () =>
    api.get('/api/v1/chat/sessions'),
  
  createSession: () =>
    api.post('/api/v1/chat/sessions'),
  
  getMessages: (sessionId) =>
    api.get(`/api/v1/chat/sessions/${sessionId}/messages`),
  
  sendMessage: (sessionId, message) =>
    api.post(`/api/v1/chat/sessions/${sessionId}/messages`, { message }),
  
  analyzeIntent: (message) =>
    api.post('/api/v1/chat/analyze-intent', { message }),
};

// Career API
export const careerAPI = {
  search: (query, filters = {}) =>
    api.get('/api/v1/careers/search', { params: { query, ...filters } }),
  
  getRecommendations: () =>
    api.get('/api/v1/careers/recommendations'),
  
  getTrends: () =>
    api.get('/api/v1/careers/trends'),
  
  getDetails: (careerId) =>
    api.get(`/api/v1/careers/${careerId}`),
};

// Profile API
export const profileAPI = {
  get: () =>
    api.get('/api/v1/profiles/me'),
  
  update: (profileData) =>
    api.put('/api/v1/profiles/me', profileData),
  
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/profiles/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  analyzeSkillGap: () =>
    api.post('/api/v1/profiles/skill-gap-analysis'),
  
  getLearningResources: () =>
    api.get('/api/v1/profiles/learning-resources'),
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