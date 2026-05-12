/**
 * Category API Service
 * Handles all Category CRUD operations via REST API
 * @module categoryService
 */

import apiClient from '../../../shared/api/apiClient';
import { endpoints } from '../../../shared/api/endpoints';

/**
 * Category service object with CRUD methods
 */
export const categoryService = {
  /**
   * Get full category tree structure
   * @returns {Promise<Array<DocumentCategory>>} Tree structure of categories
   * 
   * @example
   * const tree = await categoryService.getTree();
   */
  getTree: async () => {
    return await apiClient.get(endpoints.category.tree);
  },

  /**
   * Get category by ID
   * @param {string} id - Category UUID
   * @returns {Promise<DocumentCategory>} Category entity
   * 
   * @example
   * const category = await categoryService.getById('uuid-123');
   */
  getById: async (id) => {
    return await apiClient.get(endpoints.category.detail(id));
  },

  /**
   * Create new category
   * @param {CreateCategoryDTO} data - Category creation data
   * @returns {Promise<{id: string}>} Created category ID
   * 
   * @example
   * const result = await categoryService.create({
   *   name: 'Legal Documents',
   *   parentId: 'uuid-parent'
   * });
   */
  create: async (data) => {
    return await apiClient.post(endpoints.category.create, data);
  },

  /**
   * Update existing category
   * @param {string} id - Category UUID
   * @param {UpdateCategoryDTO} data - Update data
   * @returns {Promise<{updated: boolean}>} Update result
   * 
   * @example
   * await categoryService.update('uuid-123', {
   *   name: 'Updated Name',
   *   parentId: 'new-parent-uuid'
   * });
   */
  update: async (id, data) => {
    return await apiClient.put(endpoints.category.update(id), data);
  },

  /**
   * Delete category (single category only)
   * Use when category has no children
   * @param {string} id - Category UUID
   * @returns {Promise<{deleted: boolean}>} Deletion result
   * 
   * @example
   * await categoryService.delete('uuid-123');
   */
  delete: async (id) => {
    return await apiClient.delete(endpoints.category.delete(id));
  },

  /**
   * Recursive delete category and all its descendants
   * Use when category has children
   * @param {string} id - Category UUID
   * @returns {Promise<{deleted: boolean}>} Deletion result
   * 
   * @example
   * await categoryService.deleteTree('uuid-123');
   */
  deleteTree: async (id) => {
    return await apiClient.delete(endpoints.category.deleteTree(id));
  },

  /**
   * Check if category has children
   * @param {Array<DocumentCategory>} categories - All categories
   * @param {string} id - Category ID
   * @returns {boolean} True if category has children
   */
  hasChildren: (categories, id) => {
    return categories.some(cat => cat.parentId === id);
  },

  /**
   * Get children count for a category
   * @param {Array<DocumentCategory>} categories - All categories
   * @param {string} id - Category ID
   * @returns {number} Number of children
   */
  getChildrenCount: (categories, id) => {
    return categories.filter(cat => cat.parentId === id).length;
  },
};