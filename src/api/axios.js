import axios from 'axios';

// --- Helper to read cookies ---
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// --- Create axios instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://backend.nordflex.shop/api'),
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true, // Important for Sanctum
});

// --- Interceptor: Always ensure CSRF cookie exists ---
let csrfFetched = false; // prevent infinite loop
api.interceptors.request.use(
  async (config) => {
    // Fetch CSRF cookie once if missing
    if (!csrfFetched || !document.cookie.includes('XSRF-TOKEN')) {
      try {
        // For CSRF, we need the root domain (without /api)
        const csrfBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || (import.meta.env.DEV ? '' : 'https://backend.nordflex.shop');
        console.log('🔐 Fetching CSRF cookie from:', csrfBase);
        
        await axios.get(`${csrfBase}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
        csrfFetched = true;
        console.log('✅ CSRF cookie fetched successfully');
      } catch (error) {
        console.error('❌ Failed to fetch CSRF cookie:', error.message);
        // Don't set csrfFetched to true on error, so we can retry
      }
    }

    // Attach CSRF token manually (sometimes axios doesn’t do it automatically)
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    // Add guest cart session ID if available
    const sessionId = localStorage.getItem('nordic_fashion_cart_session_id');
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId;
    }

    // Add Bearer token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('📡 API Request:', config.method?.toUpperCase(), config.url, {
      hasToken: !!token,
      xsrfToken: !!xsrfToken,
      sessionId,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor (debug errors) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;