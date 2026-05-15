/**
 * DocType State Management Hook
 * Manages DocType list, CRUD operations, and event simulation
 * @module useDocType
 */

import { useState, useEffect, useCallback } from 'react';
import { docTypeService } from '../services/docTypeService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { simulateEvent } from '../../../shared/utils/eventSimulator';
import { EVENT_TYPES } from '../../../shared/constants/eventTypes';

/**
 * DocType state management hook
 * @returns {Object} DocType state and CRUD actions
 * 
 * @example
 * const { docTypes, loading, createDocType, updateDocType } = useDocType();
 */
export const useDocType = () => {
  const [docTypes, setDocTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchDocTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await docTypeService.getAll();
      setDocTypes(data);
    } catch (err) {
      setError(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchDocTypes();
  }, [fetchDocTypes]);

  const selectDocType = useCallback(async (id) => {
    try {
      const docType = await docTypeService.getById(id);
      setSelectedDocType(docType);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);

  const createDocType = useCallback(async (data) => {
    try {
      const result = await docTypeService.create(data);
      
      simulateEvent(EVENT_TYPES.DOCTYPE_CREATED, {
        docTypeId: result.id,
        docTypeCode: data.code,
        name: data.name,
        status: 'ENABLED',
        operationType: 'CREATED',
      });
      
      showNotification('DocType created successfully', 'success');
      await fetchDocTypes();
      return result;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchDocTypes, showNotification]);

  const updateDocType = useCallback(async (id, data) => {
    try {
      await docTypeService.update(id, data);
      
      simulateEvent(EVENT_TYPES.DOCTYPE_UPDATED, {
        docTypeId: id,
        name: data.name,
        status: 'ENABLED',
        operationType: 'UPDATED',
      });
      
      showNotification('DocType updated successfully', 'success');
      await fetchDocTypes();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchDocTypes, showNotification]);

  const deleteDocType = useCallback(async (id) => {
    try {
      await docTypeService.delete(id);
      
      simulateEvent(EVENT_TYPES.DOCTYPE_DELETED, {
        docTypeId: id,
        status: 'DISABLED',
        operationType: 'DELETED',
      });
      
      showNotification('DocType deleted successfully', 'success');
      await fetchDocTypes();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchDocTypes, showNotification]);

  return {
    docTypes,
    selectedDocType,
    loading,
    error,
    fetchDocTypes,
    selectDocType,
    createDocType,
    updateDocType,
    deleteDocType,
  };
};