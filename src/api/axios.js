// src/api/axios.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    // Removed Content-Type to allow FormData to set its own
  },
  withCredentials: true,
});

// Add request interceptor to include session ID for guest users
api.interceptors.request.use(
  (config) => {
    // Get session ID from localStorage for guest users
    const sessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId;
      console.log('🔑 Adding X-Session-Id header:', sessionId);
    } else {
      console.log('⚠️ No session ID found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get CSRF cookie before any requests
api.interceptors.request.use(async (config) => {
  // Get CSRF cookie for Sanctum
  if (!document.cookie.includes('XSRF-TOKEN')) {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });
  }
  
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('API Request:', config.method?.toUpperCase(), config.url, {
    hasToken: !!token,
    headers: config.headers
  });
  
  return config;
});

// Add response interceptor to log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;