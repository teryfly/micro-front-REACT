/**
 * DocType API Service
 * Handles all DocType CRUD operations via REST API
 * @module docTypeService
 */

import apiClient from '../../../shared/api/apiClient';
import { endpoints } from '../../../shared/api/endpoints';

/**
 * DocType service object with CRUD methods
 */
export const docTypeService = {
  /**
   * Get all DocTypes
   * @returns {Promise<Array<DocType>>} Array of DocType entities
   * 
   * @example
   * const docTypes = await docTypeService.getAll();
   */
  getAll: async () => {
    return await apiClient.get(endpoints.doctype.list);
  },

  /**
   * Get DocType by ID
   * @param {string} id - DocType UUID
   * @returns {Promise<DocType>} DocType entity
   * 
   * @example
   * const docType = await docTypeService.getById('uuid-123');
   */
  getById: async (id) => {
    return await apiClient.get(endpoints.doctype.detail(id));
  },

  /**
   * Create new DocType
   * @param {CreateDocTypeDTO} data - DocType creation data
   * @returns {Promise<{id: string}>} Created DocType ID
   * 
   * @example
   * const result = await docTypeService.create({
   *   code: 'CONTRACT',
   *   name: 'Contract Document',
   *   allowedPhases: ['DRAFT', 'REVIEW'],
   *   defaultPhase: 'DRAFT'
   * });
   */
  create: async (data) => {
    // Clean data to match Swagger spec exactly
    const cleanedData = {
      code: data.code,
      name: data.name,
      description: data.description || null,
      allowedPhases: data.allowedPhases || [],
      defaultPhase: data.defaultPhase,
      // Remove optional fields if they are null/empty to avoid validation errors
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.aiDraftPromptTemplateId ? { aiDraftPromptTemplateId: data.aiDraftPromptTemplateId } : {}),
      metadata: data.metadata || null,
      customFields: data.customFields || null,
    };

    return await apiClient.post(endpoints.doctype.create, cleanedData);
  },

  /**
   * Update existing DocType
   * @param {string} id - DocType UUID
   * @param {UpdateDocTypeDTO} data - Update data (code is immutable)
   * @returns {Promise<{updated: boolean}>} Update result
   * 
   * @example
   * await docTypeService.update('uuid-123', {
   *   name: 'Updated Name',
   *   allowedPhases: ['DRAFT', 'REVIEW', 'APPROVED'],
   *   defaultPhase: 'DRAFT'
   * });
   */
  update: async (id, data) => {
    // Clean data to match Swagger spec exactly
    const cleanedData = {
      name: data.name,
      description: data.description || null,
      allowedPhases: data.allowedPhases || [],
      defaultPhase: data.defaultPhase,
      // Remove optional fields if they are null/empty
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.aiDraftPromptTemplateId ? { aiDraftPromptTemplateId: data.aiDraftPromptTemplateId } : {}),
      metadata: data.metadata || null,
      customFields: data.customFields || null,
    };

    return await apiClient.put(endpoints.doctype.update(id), cleanedData);
  },

  /**
   * Delete DocType (soft delete/disable)
   * @param {string} id - DocType UUID
   * @returns {Promise<{deleted: boolean}>} Deletion result
   * 
   * @example
   * await docTypeService.delete('uuid-123');
   */
  delete: async (id) => {
    return await apiClient.delete(endpoints.doctype.delete(id));
  },
};