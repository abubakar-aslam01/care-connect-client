import axios from 'axios';

const envBaseURL = import.meta.env.VITE_API_BASE_URL?.trim();
const isLocalBrowser =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const shouldUseLocalApi =
  import.meta.env.DEV && isLocalBrowser && import.meta.env.VITE_USE_REMOTE_API !== 'true';
const baseURL = shouldUseLocalApi ? '/api' : envBaseURL || '/api';
const TOKEN_KEY = 'ccp_token';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional response interceptor example
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isTimeout = error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '');
    const isNetworkError = error.message === 'Network Error';

    let message = error.response?.data?.message || error.message || 'Request failed';

    if (isTimeout) {
      message = import.meta.env.DEV
        ? 'The API took too long to respond. Make sure the backend is running on http://localhost:5000.'
        : 'The server took too long to respond. Please try again.';
    } else if (isNetworkError) {
      message = import.meta.env.DEV
        ? 'Cannot reach the API. Make sure the backend is running on http://localhost:5000.'
        : 'Cannot reach the server right now. Please try again.';
    }

    return Promise.reject(new Error(message));
  }
);

export const storageKeys = {
  token: TOKEN_KEY
};
