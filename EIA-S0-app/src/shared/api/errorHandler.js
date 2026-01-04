/**
 * Error Handler Module
 * Transforms API errors into user-friendly messages
 * @module errorHandler
 */

import { ERROR_CODES } from '../constants/errorCodes';

/**
 * Get user-friendly message based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} User-friendly error message
 */
const getStatusMessage = (status) => {
  switch (status) {
    case 400:
      return 'Invalid request data';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'Forbidden. You do not have permission.';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Conflict. Resource already exists.';
    case 500:
      return 'Internal server error';
    default:
      return `Error ${status}: An unexpected error occurred`;
  }
};

/**
 * Transform API errors to user-friendly messages
 * @param {Error} error - Axios error object
 * @returns {Error} Enhanced error with user message
 * @throws {Error} Enhanced error object
 */
export const transformError = (error) => {
  // Network error (no response from server)
  if (!error.response) {
    const networkError = new Error('Network error. Please check your connection.');
    networkError.type = 'NETWORK_ERROR';
    networkError.status = 0;
    networkError.originalError = error;
    
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Network Error:', {
        message: networkError.message,
        originalError: error.message,
      });
    }
    
    return networkError;
  }

  const { status, data } = error.response;
  let message = 'An error occurred';
  let errorCode = null;
  let errorType = 'UNKNOWN_ERROR';

  // Extract backend error code if exists
  if (data && data.errorCode) {
    errorCode = data.errorCode;
    message = ERROR_CODES[errorCode] || data.message || message;
    errorType = 'BACKEND_ERROR';
  } 
  // Use backend message if available
  else if (data && data.message) {
    message = data.message;
    errorType = 'BACKEND_ERROR';
  } 
  // Use backend detail from ProblemDetails format
  else if (data && data.detail) {
    message = data.detail;
    errorType = 'BACKEND_ERROR';
  }
  // Fallback to status-based messages
  else {
    message = getStatusMessage(status);
    errorType = getErrorType(status);
  }

  // Create enhanced error object
  const enhancedError = new Error(message);
  enhancedError.status = status;
  enhancedError.errorCode = errorCode;
  enhancedError.type = errorType;
  enhancedError.originalError = error;

  // Log detailed error in development mode
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

/**
 * Get error type based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} Error type constant
 */
const getErrorType = (status) => {
  if (status >= 400 && status < 500) {
    if (status === 401) return 'AUTH_ERROR';
    if (status === 403) return 'PERMISSION_ERROR';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    return 'VALIDATION_ERROR';
  }
  
  if (status >= 500) {
    return 'SERVER_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

/**
 * Check if error is authentication-related
 * @param {Error} error - Enhanced error object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  return error.status === 401 || error.type === 'AUTH_ERROR';
};

/**
 * Check if error is permission-related
 * @param {Error} error - Enhanced error object
 * @returns {boolean} True if permission error
 */
export const isPermissionError = (error) => {
  return error.status === 403 || error.type === 'PERMISSION_ERROR';
};

/**
 * Check if error is network-related
 * @param {Error} error - Enhanced error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return error.type === 'NETWORK_ERROR';
};