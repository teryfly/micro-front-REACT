/**
 * Phase API Service
 * Handles all Phase CRUD operations via REST API
 * @module phaseService
 */
import apiClient from '../../../shared/api/apiClient';
import { endpoints } from '../../../shared/api/endpoints';
/**
 * Phase service object with CRUD methods
 */
export const phaseService = {
  /**
   * Get all phases
   * @returns {Promise<Array<PhaseDefinition>>} Array of phase entities
   */
  getAll: async () => {
    return await apiClient.get(endpoints.phase.list);
  },
  /**
   * Get phase by ID
   * @param {string} id - Phase UUID
   * @returns {Promise<PhaseDefinition>} Phase entity
   */
  getById: async (id) => {
    return await apiClient.get(endpoints.phase.detail(id));
  },
  /**
   * Create new phase
   * @param {CreatePhaseDTO} data - Phase creation data
   * @returns {Promise<{id: string}>} Created phase ID
   */
  create: async (data) => {
    return await apiClient.post(endpoints.phase.create, data);
  },
  /**
   * Update existing phase
   * @param {string} id - Phase UUID
   * @param {UpdatePhaseDTO} data - Update data (phaseCode is immutable)
   * @returns {Promise<{updated: boolean}>} Update result
   */
  update: async (id, data) => {
    return await apiClient.put(endpoints.phase.update(id), data);
  },
  /**
   * Batch update phase orders after drag-drop.
   * Sends all non-null, non-undefined properties of each phase.
   * This prevents accidentally erasing fields such as displayName and allowedTransitions.
   * @param {Array<PhaseDefinition>} phases - Complete phase objects with new order values
   * @returns {Promise<{updated: boolean}>} Batch update result
   */
  updateOrders: async (phases) => {
    // Use all properties except id, createdAt, updatedAt, for each phase
    const promises = phases.map((phase) => {
      // Only send fields that are not undefined/null, preserve all data
      const {
        id, createdAt, updatedAt, ...rest
      } = phase;
      // Remove undefined fields
      const payload = {};
      Object.keys(rest).forEach((k) => {
        if (rest[k] !== undefined) {
          payload[k] = rest[k];
        }
      });
      return apiClient.put(endpoints.phase.update(id), payload);
    });
    await Promise.all(promises);
    return { updated: true };
  },
};