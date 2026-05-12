/**
 * System Parameter State Management Hook
 * Manages parameter data, editable validation, and CRUD operations with editable keys management
 * @module useSystemParam
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { systemParamService } from '../services/systemParamService';
import { useNotification } from '../../../shared/hooks/useNotification';
/**
 * System Parameter state management hook
 * @returns {Object} System Parameter state and actions
 * 
 * @example
 * const { systemParams, editableKeys, isEditable, createParam, updateParam } = useSystemParam();
 */
export const useSystemParam = () => {
  const [systemParams, setSystemParams] = useState([]);
  const [selectedParam, setSelectedParam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const fetchParams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemParamService.getAll();
      setSystemParams(data);
    } catch (err) {
      setError(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  // Initial fetch on mount
  useEffect(() => {
    fetchParams();
  }, [fetchParams]);
  // Extract editable keys from system parameters
  const editableKeys = useMemo(() => {
    const editableParam = systemParams.find(
      param => param.key === 'system.parameter.editableKeys'
    );
    if (!editableParam) return [];
    try {
      return JSON.parse(editableParam.value);
    } catch (err) {
      console.error('Failed to parse editableKeys:', err);
      showNotification('Invalid editableKeys configuration', 'warning');
      return [];
    }
  }, [systemParams, showNotification]);
  // Check if parameter is editable based on editableKeys
  const isEditable = useCallback((key) => {
    return editableKeys.includes(key);
  }, [editableKeys]);
  const selectParam = useCallback(async (key) => {
    try {
      const param = await systemParamService.getByKey(key);
      setSelectedParam(param);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);
  // Helper function to update editableKeys
  const updateEditableKeys = useCallback(async (newKey, shouldBeEditable) => {
    try {
      const currentEditableKeys = [...editableKeys];
      if (shouldBeEditable && !currentEditableKeys.includes(newKey)) {
        currentEditableKeys.push(newKey);
      } else if (!shouldBeEditable && currentEditableKeys.includes(newKey)) {
        const index = currentEditableKeys.indexOf(newKey);
        currentEditableKeys.splice(index, 1);
      } else {
        return; // No change needed
      }
      await systemParamService.update('system.parameter.editableKeys', {
        value: JSON.stringify(currentEditableKeys),
        type: 'json',
        description: 'Keys that can be edited from UI',
      });
      // Refresh parameters to get updated editableKeys
      await fetchParams();
    } catch (err) {
      console.error('Failed to update editableKeys:', err);
      throw err;
    }
  }, [editableKeys, fetchParams]);
  const createParam = useCallback(async (data) => {
    try {
      // Create the parameter
      await systemParamService.create(data.key, {
        value: data.value,
        type: data.type,
        description: data.description,
      });
      // Update editableKeys if requested
      if (data.editable !== false) { // Default to editable if not explicitly set to false
        await updateEditableKeys(data.key, true);
      }
      showNotification('System parameter created successfully', 'success');
      await fetchParams();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchParams, updateEditableKeys, showNotification]);
  const updateParam = useCallback(async (key, data) => {
    try {
      await systemParamService.update(key, data);
      showNotification('System parameter updated successfully', 'success');
      await fetchParams();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchParams, showNotification]);
  return {
    systemParams,
    selectedParam,
    editableKeys,
    loading,
    error,
    fetchParams,
    selectParam,
    createParam,
    updateParam,
    isEditable,
  };
};