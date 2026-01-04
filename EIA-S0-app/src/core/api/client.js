/**
 * API Client
 * Axios-based HTTP client with interceptors
 * @module api/client
 */

import axios from 'axios';
import { API_CONFIG } from './config';
import { requestInterceptor, requestErrorInterceptor, responseInterceptor } from './interceptors';
import { transformError } from './errorHandler';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

axiosInstance.interceptors.response.use(
  responseInterceptor,
  (error) => Promise.reject(transformError(error))
);

const apiClient = {
  get: async (url, config = {}) => {
    const response = await axiosInstance.get(url, config);
    return response.data;
  },

  post: async (url, data = {}, config = {}) => {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  },

  put: async (url, data = {}, config = {}) => {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  },

  delete: async (url, config = {}) => {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  },

  patch: async (url, data = {}, config = {}) => {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  },

  getInstance: () => axiosInstance,
  getBaseUrl: () => API_CONFIG.BASE_URL,
};

export default apiClient;