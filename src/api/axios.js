import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  transformRequest: [
    (data, headers) => {
      // Don't transform FormData - let the browser handle it
      if (data instanceof FormData) {
        return data;
      }
      // For other data types, use default JSON transformation
      if (headers['Content-Type'] === 'application/json') {
        return JSON.stringify(data);
      }
      return data;
    }
  ]
});

// Request interceptor to add CSRF token and authentication token
api.interceptors.request.use(
  (config) => {
    // Add CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
    
    // Add authentication token
    const authToken = localStorage.getItem('token');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // If the request data is FormData, remove Content-Type header
    // to let the browser set it with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch, try to get a new one
      window.location.reload();
    }
    
    // Handle 401 Unauthorized or 403 Forbidden for admin
    if (error.response?.status === 401 || error.response?.status === 403) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          // Only auto-logout for admin users
          if (userData.role === 'admin') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/admin/login';
          }
        } catch (e) {
          // Invalid user data, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;