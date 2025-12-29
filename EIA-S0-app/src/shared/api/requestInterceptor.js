/**
 * Request Interceptor Module
 * Injects authentication tokens and request metadata
 * @module requestInterceptor
 */

/**
 * Inject authentication token and metadata into requests
 * @param {Object} config - Axios request config
 * @returns {Object} Modified config with auth headers
 */
export const injectAuthToken = (config) => {
  // Get token from localStorage
  // Note: This will be replaced with AuthContext in Phase 1.3
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add request timestamp for debugging and request tracking
  config.headers['X-Request-Time'] = new Date().toISOString();

  // Log request in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('📤 API Request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      data: config.data,
      params: config.params,
    });
  }

  return config;
};

/**
 * Handle request errors (e.g., request setup failures)
 * @param {Error} error - Request setup error
 * @returns {Promise} Rejected promise
 */
export const handleRequestError = (error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Request Setup Error:', error);
  }
  return Promise.reject(error);
};