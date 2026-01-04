/**
 * Phase State Management Hook
 * Manages Phase list, CRUD operations, and event simulation
 * @module usePhase
 */
import { useState, useEffect, useCallback } from 'react';
import { phaseService } from '../services/phaseService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { simulateEvent } from '../../../shared/utils/eventSimulator';
import { EVENT_TYPES } from '../../../shared/constants/eventTypes';
/**
 * Phase state management hook
 * @returns {Object} Phase state and CRUD actions
 * 
 * @example
 * const { phases, loading, createPhase, updatePhaseOrders } = usePhase();
 */
export const usePhase = () => {
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const fetchPhases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await phaseService.getAll();
      const sorted = data.sort((a, b) => a.order - b.order);
      setPhases(sorted);
    } catch (err) {
      setError(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);
  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);
  const selectPhase = useCallback(async (id) => {
    try {
      const phase = await phaseService.getById(id);
      setSelectedPhase(phase);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);
  const createPhase = useCallback(async (data) => {
    try {
      const result = await phaseService.create(data);
      simulateEvent(EVENT_TYPES.PHASE_CREATED, {
        phaseId: result.id,
        phaseCode: data.phaseCode,
        name: data.displayName,
        isActive: true,
        operationType: 'CREATED',
      });
      showNotification('Phase created successfully', 'success');
      await fetchPhases();
      return result;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchPhases, showNotification]);
  const updatePhase = useCallback(async (id, data) => {
    try {
      await phaseService.update(id, data);
      simulateEvent(EVENT_TYPES.PHASE_UPDATED, {
        phaseId: id,
        name: data.displayName,
        isActive: true,
        operationType: 'UPDATED',
      });
      showNotification('Phase updated successfully', 'success');
      await fetchPhases();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchPhases, showNotification]);
  const deletePhase = useCallback(async (id) => {
    try {
      await phaseService.delete(id);
      simulateEvent(EVENT_TYPES.PHASE_DELETED, {
        phaseId: id,
        isActive: false,
        operationType: 'DELETED',
      });
      showNotification('Phase deleted successfully', 'success');
      await fetchPhases();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchPhases, showNotification]);
  // FIX: Pass full phase objects to updateOrders to prevent data loss
  const updatePhaseOrders = useCallback(async (reorderedPhases) => {
    try {
      // NOTE: We pass the complete reorderedPhases array here.
      // The service layer needs the full object (displayName, allowedTransitions, etc.)
      // to construct a valid PUT request, as the backend expects a full resource update.
      await phaseService.updateOrders(reorderedPhases);
      simulateEvent(EVENT_TYPES.PHASE_UPDATED, {
        operationType: 'REORDERED',
        count: reorderedPhases.length,
      });
      showNotification('Phase order updated successfully', 'success');
      await fetchPhases();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchPhases, showNotification]);
  return {
    phases,
    selectedPhase,
    loading,
    error,
    fetchPhases,
    selectPhase,
    createPhase,
    updatePhase,
    deletePhase,
    updatePhaseOrders,
  };
};