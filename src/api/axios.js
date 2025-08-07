// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Updated to match backend port
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔒 Needed if you're using Laravel Sanctum for auth
});

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