/**
 * API Error Handler
 * Transforms API errors into user-friendly messages
 * @module api/errorHandler
 */

import { ERROR_CODES } from '../constants/errorCodes';

const getStatusMessage = (status) => {
  const messages = {
    400: 'Invalid request data',
    401: 'Unauthorized. Please login again.',
    403: 'Forbidden. You do not have permission.',
    404: 'Resource not found',
    409: 'Conflict. Resource already exists.',
    500: 'Internal server error',
  };
  return messages[status] || `Error ${status}: An unexpected error occurred`;
};

const getErrorType = (status) => {
  if (status === 401) return 'AUTH_ERROR';
  if (status === 403) return 'PERMISSION_ERROR';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status >= 400 && status < 500) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN_ERROR';
};

export const transformError = (error) => {
  if (!error.response) {
    const networkError = new Error('Network error. Please check your connection.');
    networkError.type = 'NETWORK_ERROR';
    networkError.status = 0;
    networkError.originalError = error;
    
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Network Error:', { message: networkError.message, originalError: error.message });
    }
    
    return networkError;
  }

  const { status, data } = error.response;
  let message = 'An error occurred';
  let errorCode = null;
  let errorType = 'UNKNOWN_ERROR';

  if (data?.errorCode) {
    errorCode = data.errorCode;
    message = ERROR_CODES[errorCode] || data.message || message;
    errorType = 'BACKEND_ERROR';
  } else if (data?.message) {
    message = data.message;
    errorType = 'BACKEND_ERROR';
  } else if (data?.detail) {
    message = data.detail;
    errorType = 'BACKEND_ERROR';
  } else {
    message = getStatusMessage(status);
    errorType = getErrorType(status);
  }

  const enhancedError = new Error(message);
  enhancedError.status = status;
  enhancedError.errorCode = errorCode;
  enhancedError.type = errorType;
  enhancedError.originalError = error;

  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 API Error:', {
      status,
      errorCode,
      errorType,
      message,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data,
      responseData: data,
    });
  }

  return enhancedError;
};

export const isAuthError = (error) => error.status === 401 || error.type === 'AUTH_ERROR';
export const isPermissionError = (error) => error.status === 403 || error.type === 'PERMISSION_ERROR';
export const isNetworkError = (error) => error.type === 'NETWORK_ERROR';