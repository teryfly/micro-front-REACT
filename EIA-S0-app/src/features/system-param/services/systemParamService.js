/**
 * System Parameter API Service
 * Handles all System Parameter operations via REST API
 * @module systemParamService
 */
import apiClient from '../../../shared/api/apiClient';
import { endpoints } from '../../../shared/api/endpoints';
/**
 * System Parameter service object with CRUD methods
 */
export const systemParamService = {
  /**
   * Get all system parameters
   * @returns {Promise<Array<SystemParameter>>} Array of system parameters
   * 
   * @example
   * const params = await systemParamService.getAll();
   */
  getAll: async () => {
    return await apiClient.get(endpoints.systemParam.list);
  },
  /**
   * Get system parameter by key
   * @param {string} key - Parameter key
   * @returns {Promise<SystemParameter>} System parameter entity
   * 
   * @example
   * const param = await systemParamService.getByKey('system.maxPromptLength');
   */
  getByKey: async (key) => {
    return await apiClient.get(endpoints.systemParam.detail(key));
  },
  /**
   * Create new system parameter
   * @param {string} key - Parameter key
   * @param {CreateSystemParamDTO} data - Creation data
   * @returns {Promise<{created: boolean}>} Creation result
   * 
   * @example
   * await systemParamService.create('custom.parameter', {
   *   value: 'custom-value',
   *   type: 'string',
   *   description: 'Custom parameter description'
   * });
   */
  create: async (key, data) => {
    return await apiClient.put(endpoints.systemParam.update(key), data);
  },
  /**
   * Update existing system parameter
   * @param {string} key - Parameter key
   * @param {UpdateSystemParamDTO} data - Update data
   * @returns {Promise<{updated: boolean}>} Update result
   * 
   * @example
   * await systemParamService.update('system.maxPromptLength', {
   *   value: '64000',
   *   type: 'int',
   *   description: 'Updated max prompt length'
   * });
   */
  update: async (key, data) => {
    return await apiClient.put(endpoints.systemParam.update(key), data);
  },
};