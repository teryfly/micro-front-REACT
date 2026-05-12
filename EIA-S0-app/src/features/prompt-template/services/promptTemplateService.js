/**
 * Prompt Template API Service
 * Handles all Prompt Template CRUD operations via REST API
 * @module promptTemplateService
 */

import apiClient from '../../../shared/api/apiClient';
import { endpoints } from '../../../shared/api/endpoints';

/**
 * Prompt Template service object with CRUD methods
 */
export const promptTemplateService = {
  /**
   * Get all prompt templates
   * @returns {Promise<Array<PromptTemplate>>} Array of template entities
   * 
   * @example
   * const templates = await promptTemplateService.getAll();
   */
  getAll: async () => {
    return await apiClient.get(endpoints.promptTemplate.list);
  },

  /**
   * Get prompt template by ID
   * @param {string} id - Template UUID
   * @returns {Promise<PromptTemplate>} Template entity
   * 
   * @example
   * const template = await promptTemplateService.getById('uuid-123');
   */
  getById: async (id) => {
    return await apiClient.get(endpoints.promptTemplate.detail(id));
  },

  /**
   * Create new prompt template
   * @param {CreatePromptTemplateDTO} data - Template creation data
   * @returns {Promise<{id: string}>} Created template ID
   * 
   * @example
   * const result = await promptTemplateService.create({
   *   agentName: 'DocumentDraftAgent',
   *   scope: 'DocType',
   *   content: 'Please draft a document...',
   *   language: 'en',
   *   aiServiceConfigId: 'uuid-ai-service'
   * });
   */
  create: async (data) => {
    return await apiClient.post(endpoints.promptTemplate.create, data);
  },

  /**
   * Update existing prompt template
   * @param {string} id - Template UUID
   * @param {UpdatePromptTemplateDTO} data - Update data
   * @param {boolean} [overwrite=false] - Overwrite current version flag
   * @returns {Promise<{updated: boolean}>} Update result
   * 
   * @example
   * // Create new version (default)
   * await promptTemplateService.update('uuid-123', { content: 'new content' });
   * 
   * // Overwrite current version
   * await promptTemplateService.update('uuid-123', { content: 'new content' }, true);
   */
  update: async (id, data, overwrite = false) => {
    const url = overwrite 
      ? `${endpoints.promptTemplate.update(id)}?overwrite=true`
      : endpoints.promptTemplate.update(id);
    
    return await apiClient.put(url, data);
  },

  /**
   * Get version history for template
   * @param {string} id - Template UUID
   * @returns {Promise<Array<PromptTemplateVersion>>} Version history
   * 
   * @example
   * const versions = await promptTemplateService.getVersions('uuid-123');
   */
  getVersions: async (id) => {
    return await apiClient.get(endpoints.promptTemplate.versions(id));
  },
};