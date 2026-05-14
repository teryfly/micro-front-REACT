import axios from 'axios';
import { DEFAULT_API_BASE_URL, API_TIMEOUT } from './config';

let _baseURL = DEFAULT_API_BASE_URL;

/**
 * Allow the host-app (or AppProviders) to set the base URL at runtime.
 */
export function setApiBaseUrl(url) {
  if (url) {
    _baseURL = url;
    apiClient.defaults.baseURL = url;
  }
}

export function getApiBaseUrl() {
  return _baseURL;
}

const apiClient = axios.create({
  baseURL: _baseURL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request interceptor ── */
apiClient.interceptors.request.use(
  (config) => {
    // Token is injected by AuthContext via setAuthToken()
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.error?.code;

    if (process.env.NODE_ENV === 'development') {
      console.error('[S1 API]', status, code, error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
