/**
 * AI Service API Service
 * Handles all AI Service CRUD operations via REST API
 * @module aiServiceService
 */

import apiClient from '../../../shared/api/apiClient';
import { endpoints } from '../../../shared/api/endpoints';

/**
 * AI Service service object with CRUD methods
 */
export const aiServiceService = {
  /**
   * Get all AI services
   * @returns {Promise<Array<AIServiceConfig>>} Array of AI service configs
   * 
   * @example
   * const services = await aiServiceService.getAll();
   */
  getAll: async () => {
    return await apiClient.get(endpoints.aiService.list);
  },

  /**
   * Get AI service by ID
   * @param {string} id - AI Service UUID
   * @returns {Promise<AIServiceConfig>} AI Service config
   * 
   * @example
   * const config = await aiServiceService.getById('uuid-123');
   */
  getById: async (id) => {
    return await apiClient.get(endpoints.aiService.detail(id));
  },

  /**
   * Create new AI service
   * @param {CreateAIServiceDTO} data - Creation data
   * @returns {Promise<{id: string}>} Created service ID
   * 
   * @example
   * const result = await aiServiceService.create({
   *   provider: 'OpenAI',
   *   modelName: 'gpt-4',
   *   parameters: { temperature: 0.7 },
   *   retryPolicy: { maxAttempts: 3 }
   * });
   */
  create: async (data) => {
    return await apiClient.post(endpoints.aiService.create, data);
  },

  /**
   * Update AI service
   * @param {string} id - AI Service UUID
   * @param {UpdateAIServiceDTO} data - Update data
   * @returns {Promise<{updated: boolean}>} Update result
   * 
   * @example
   * await aiServiceService.update('uuid-123', {
   *   modelName: 'gpt-4-turbo',
   *   parameters: { temperature: 0.5 }
   * });
   */
  update: async (id, data) => {
    return await apiClient.put(endpoints.aiService.update(id), data);
  },
};