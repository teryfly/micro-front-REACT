/**
 * Response Interceptor Module
 * Transforms API responses and adds metadata
 * @module responseInterceptor
 */

/**
 * Transform API responses and log in development
 * @param {Object} response - Axios response object
 * @returns {Object} Transformed response
 */
export const transformResponse = (response) => {
  // Log successful requests in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      duration: calculateDuration(response.config),
    });
  }

  // Add metadata to response data if it's an object
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    response.data._metadata = {
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
    };
  }

  return response;
};

/**
 * Calculate request duration from X-Request-Time header
 * @param {Object} config - Axios request config
 * @returns {number|null} Duration in milliseconds or null
 */
const calculateDuration = (config) => {
  try {
    const requestTime = config.headers['X-Request-Time'];
    if (requestTime) {
      const start = new Date(requestTime).getTime();
      const end = Date.now();
      return end - start;
    }
  } catch (error) {
    // Ignore duration calculation errors
  }
  return null;
};