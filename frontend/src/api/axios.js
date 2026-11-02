import axios from 'axios';

// Detect whether to use environment variable, local development, or cloud backend
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('attenda_api_url');
    if (saved) return saved;

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
  }
  return 'https://attenda-backend-enha.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with automatic localhost fallback to Render, plus 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If local 8080 is unreachable when running on localhost, seamlessly fallback to cloud backend
    if (
      (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) &&
      !error.config?._retriedWithFallback &&
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      error.config?.baseURL?.includes('localhost:8080')
    ) {
      error.config._retriedWithFallback = true;
      error.config.baseURL = 'https://attenda-backend-enha.onrender.com/api';
      try {
        return await axios(error.config);
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }

    if (error.response?.status === 401) {
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/student-register') &&
        !window.location.pathname.startsWith('/login')
      ) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
