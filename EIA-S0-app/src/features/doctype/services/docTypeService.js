/**
 * DocType Service
 * API service layer for DocType CRUD operations
 */

import { apiClient, endpoints } from '../../../core/api';

export const docTypeService = {
  getAll: async () => {
    return await apiClient.get(endpoints.doctype.list);
  },

  getById: async (id) => {
    return await apiClient.get(endpoints.doctype.detail(id));
  },

  create: async (data) => {
    return await apiClient.post(endpoints.doctype.create, data);
  },

  update: async (id, data) => {
    return await apiClient.put(endpoints.doctype.update(id), data);
  },

  delete: async (id) => {
    return await apiClient.delete(endpoints.doctype.delete(id));
  },
};