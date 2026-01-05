/**
 * Role Permission State Management Hook
 * Manages roles, permissions, and permission matrix state
 * @module useRolePermission
 */

import { useState, useEffect, useCallback } from 'react';
import { rolePermissionService } from '../services/rolePermissionService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { simulateEvent } from '../../../shared/utils/eventSimulator';
import { EVENT_TYPES } from '../../../shared/constants/eventTypes';
import { PERMISSIONS } from '../../../shared/constants/permissions';

/**
 * Role Permission state management hook
 * @returns {Object} Role Permission state and actions
 * 
 * @example
 * const { roles, rolePermissions, createRole, updatePermissions } = useRolePermission();
 */
export const useRolePermission = () => {
  const [roles, setRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolePermissionService.getAllRoles();
      setRoles(data);
    } catch (err) {
      setError(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const permissionsMap = {};
      
      for (const role of roles) {
        const rolePerms = await rolePermissionService.getRolePermissions(role.id);
        permissionsMap[role.id] = rolePerms.permissions || [];
      }
      
      setRolePermissions(permissionsMap);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [roles, showNotification]);

  // Initial fetch
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Fetch permissions when roles change
  useEffect(() => {
    if (roles.length > 0) {
      fetchAllPermissions();
    }
  }, [roles.length]); // Only depend on length to avoid infinite loop

  const selectRole = useCallback(async (id) => {
    try {
      const role = await rolePermissionService.getRoleById(id);
      setSelectedRole(role);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);

  const createRole = useCallback(async (data) => {
    try {
      const result = await rolePermissionService.createRole(data);
      
      simulateEvent(EVENT_TYPES.ROLE_PERMISSION_UPDATED, {
        roleId: result.id,
        roleName: data.name,
        operationType: 'CREATED',
      });
      
      showNotification('Role created successfully', 'success');
      await fetchRoles();
      return result;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchRoles, showNotification]);

  const updateRole = useCallback(async (id, data) => {
    try {
      await rolePermissionService.updateRole(id, data);
      
      simulateEvent(EVENT_TYPES.ROLE_PERMISSION_UPDATED, {
        roleId: id,
        roleName: data.name,
        operationType: 'UPDATED',
      });
      
      showNotification('Role updated successfully', 'success');
      await fetchRoles();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchRoles, showNotification]);

  const deleteRole = useCallback(async (id) => {
    try {
      await rolePermissionService.deleteRole(id);
      
      simulateEvent(EVENT_TYPES.ROLE_PERMISSION_UPDATED, {
        roleId: id,
        operationType: 'DELETED',
      });
      
      showNotification('Role deleted successfully', 'success');
      await fetchRoles();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchRoles, showNotification]);

  const updatePermissions = useCallback(async (roleId, permissions) => {
    try {
      await rolePermissionService.updateRolePermissions(roleId, {
        permissions,
        mappingRules: {},
      });
      
      simulateEvent(EVENT_TYPES.ROLE_PERMISSION_UPDATED, {
        roleId,
        permissionCount: permissions.length,
        operationType: 'PERMISSIONS_UPDATED',
      });
      
      showNotification('Permissions updated successfully', 'success');
      await fetchAllPermissions();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchAllPermissions, showNotification]);

  return {
    roles,
    rolePermissions,
    selectedRole,
    permissions: PERMISSIONS,
    loading,
    error,
    fetchRoles,
    selectRole,
    createRole,
    updateRole,
    deleteRole,
    updatePermissions,
  };
};