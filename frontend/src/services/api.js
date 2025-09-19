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
  getCareers: () => api.get('/api/careers'),
  getTrends: () => api.get('/api/career-trends'), // placeholder for future
};

// Profile API
export const profileAPI = {
  // Use the adapter endpoints that properly route to backend
  fetch: () => {
    console.log('🔄 Fetching profile from /api/profile');
    return api.get('/api/profile').catch(error => {
      console.error('❌ Profile fetch failed:', error.response?.status, error.response?.data);
      throw error;
    });
  },
  
  save: (profileData) => {
    console.log('💾 Saving profile to /api/profile:', profileData);
    return api.post('/api/profile', profileData).catch(error => {
      console.error('❌ Profile save failed:', error.response?.status, error.response?.data);
      throw error;
    });
  },
  
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📄 Making upload request to /api/resume');
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    return api.post('/api/resume', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000, // 60 second timeout for file uploads
    }).catch(error => {
      console.error('❌ Resume upload failed:', error.response?.status, error.response?.data);
      throw error;
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