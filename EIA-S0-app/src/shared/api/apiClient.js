/**
 * API Client Module
 * Axios-based HTTP client with interceptors for authentication and error handling
 * @module apiClient
 */

import axios from 'axios';
import { injectAuthToken, handleRequestError } from './requestInterceptor';
import { transformResponse } from './responseInterceptor';
import { transformError } from './errorHandler';

/**
 * API base URL from environment or default
 */
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5090';

/**
 * Create Axios instance with base configuration
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Apply request interceptor
 * Injects authentication token and request metadata
 */
axiosInstance.interceptors.request.use(
  injectAuthToken,
  handleRequestError
);

/**
 * Apply response interceptor
 * Transforms responses and handles errors
 */
axiosInstance.interceptors.response.use(
  transformResponse,
  (error) => {
    // Transform error using centralized error handler
    const transformedError = transformError(error);
    return Promise.reject(transformedError);
  }
);

/**
 * API Client wrapper with standardized methods
 */
const apiClient = {
  /**
   * Performs GET request
   * @template T
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   * @throws {Error} Transformed error with user message
   * 
   * @example
   * const users = await apiClient.get('/api/users');
   * const user = await apiClient.get('/api/users/123');
   */
  get: async (url, config = {}) => {
    const response = await axiosInstance.get(url, config);
    return response.data;
  },

  /**
   * Performs POST request
   * @template T
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {Object} [data={}] - Request body data
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   * @throws {Error} Transformed error with user message
   * 
   * @example
   * const newUser = await apiClient.post('/api/users', { name: 'John' });
   */
  post: async (url, data = {}, config = {}) => {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  },

  /**
   * Performs PUT request
   * @template T
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {Object} [data={}] - Request body data
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   * @throws {Error} Transformed error with user message
   * 
   * @example
   * const updated = await apiClient.put('/api/users/123', { name: 'Jane' });
   */
  put: async (url, data = {}, config = {}) => {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  },

  /**
   * Performs DELETE request
   * @template T
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   * @throws {Error} Transformed error with user message
   * 
   * @example
   * await apiClient.delete('/api/users/123');
   */
  delete: async (url, config = {}) => {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  },

  /**
   * Performs PATCH request
   * @template T
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {Object} [data={}] - Request body data
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   * @throws {Error} Transformed error with user message
   * 
   * @example
   * const patched = await apiClient.patch('/api/users/123', { status: 'active' });
   */
  patch: async (url, data = {}, config = {}) => {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  },

  /**
   * Get the raw Axios instance (for advanced usage)
   * @returns {Object} Axios instance
   */
  getInstance: () => axiosInstance,

  /**
   * Get current base URL
   * @returns {string} Base URL
   */
  getBaseUrl: () => BASE_URL,
};

export default apiClient;