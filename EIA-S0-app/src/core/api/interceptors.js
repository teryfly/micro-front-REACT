/**
 * API Request/Response Interceptors
 * @module api/interceptors
 */

export const requestInterceptor = (config) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Request-Time'] = new Date().toISOString();

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

export const requestErrorInterceptor = (error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Request Setup Error:', error);
  }
  return Promise.reject(error);
};

export const responseInterceptor = (response) => {
  if (process.env.NODE_ENV === 'development') {
    const duration = calculateDuration(response.config);
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      duration: duration ? `${duration}ms` : 'N/A',
    });
  }

  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    response.data._metadata = {
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
    };
  }

  return response;
};

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