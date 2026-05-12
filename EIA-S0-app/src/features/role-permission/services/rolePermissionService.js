/**
 * Role Permission API Service
 * Handles all Role and Permission operations via REST API
 * Aligned with Swagger specification
 * @module rolePermissionService
 */

import apiClient from '../../../shared/api/apiClient';
import { endpoints } from '../../../shared/api/endpoints';

/**
 * Role Permission service object with CRUD methods
 */
export const rolePermissionService = {
  /**
   * Get all roles
   * @returns {Promise<Array<Role>>} Array of role entities
   * 
   * @example
   * const roles = await rolePermissionService.getAllRoles();
   */
  getAllRoles: async () => {
    return await apiClient.get(endpoints.role.list);
  },

  /**
   * Get role by ID
   * @param {string} id - Role UUID
   * @returns {Promise<Role>} Role entity
   * 
   * @example
   * const role = await rolePermissionService.getRoleById('uuid-123');
   */
  getRoleById: async (id) => {
    return await apiClient.get(endpoints.role.detail(id));
  },

  /**
   * Create new role
   * @param {CreateRoleRequest} data - Role creation data
   * @returns {Promise<{id: string}>} Created role ID
   * 
   * @example
   * const result = await rolePermissionService.createRole({
   *   name: 'Administrator',
   *   description: 'Full system access'
   * });
   */
  createRole: async (data) => {
    return await apiClient.post(endpoints.role.create, data);
  },

  /**
   * Update role
   * @param {string} id - Role UUID
   * @param {UpdateRoleRequest} data - Update data
   * @returns {Promise<{updated: boolean}>} Update result
   * 
   * @example
   * await rolePermissionService.updateRole('uuid-123', {
   *   name: 'Super Admin',
   *   description: 'Updated description'
   * });
   */
  updateRole: async (id, data) => {
    return await apiClient.put(endpoints.role.update(id), data);
  },

  /**
   * Delete role
   * @param {string} id - Role UUID
   * @returns {Promise<void>} Deletion result
   * 
   * @example
   * await rolePermissionService.deleteRole('uuid-123');
   */
  deleteRole: async (id) => {
    return await apiClient.delete(endpoints.role.delete(id));
  },

  /**
   * Get role permissions
   * @param {string} roleId - Role UUID
   * @returns {Promise<RolePermission>} Role permission mapping
   * 
   * @example
   * const rolePerms = await rolePermissionService.getRolePermissions('uuid-123');
   */
  getRolePermissions: async (roleId) => {
    return await apiClient.get(endpoints.role.permission(roleId));
  },

  /**
   * Update role permissions
   * @param {string} roleId - Role UUID
   * @param {UpdateRolePermissionRequest} data - Permission update data
   * @returns {Promise<{updated: boolean}>} Update result
   * 
   * @example
   * await rolePermissionService.updateRolePermissions('uuid-123', {
   *   permissions: ['doctype.view', 'doctype.create'],
   *   mappingRules: {}
   * });
   */
  updateRolePermissions: async (roleId, data) => {
    return await apiClient.put(endpoints.role.permission(roleId), data);
  },
};