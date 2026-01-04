/**
 * AI Service State Management Hook
 * Manages list data, CRUD operations, and event simulation
 * @module useAIService
 */

import { useState, useEffect, useCallback } from 'react';
import { aiServiceService } from '../services/aiServiceService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { simulateEvent } from '../../../shared/utils/eventSimulator';
import { EVENT_TYPES } from '../../../shared/constants/eventTypes';

/**
 * AI Service state management hook
 * @returns {Object} AI Service state and actions
 * 
 * @example
 * const { aiServices, loading, createAIService } = useAIService();
 */
export const useAIService = () => {
  const [aiServices, setAIServices] = useState([]);
  const [selectedAIService, setSelectedAIService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchAIServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiServiceService.getAll();
      setAIServices(data);
    } catch (err) {
      setError(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAIServices();
  }, [fetchAIServices]);

  const selectAIService = useCallback(async (id) => {
    try {
      const aiService = await aiServiceService.getById(id);
      setSelectedAIService(aiService);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);

  const createAIService = useCallback(async (data) => {
    try {
      const result = await aiServiceService.create(data);
      
      simulateEvent(EVENT_TYPES.AI_SERVICE_CREATED, {
        configId: result.id,
        provider: data.provider,
        modelName: data.modelName,
        operationType: 'CREATED',
      });
      
      showNotification('AI Service created successfully', 'success');
      await fetchAIServices();
      return result;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchAIServices, showNotification]);

  const updateAIService = useCallback(async (id, data) => {
    try {
      await aiServiceService.update(id, data);
      
      simulateEvent(EVENT_TYPES.AI_SERVICE_UPDATED, {
        configId: id,
        provider: data.provider,
        modelName: data.modelName,
        operationType: 'UPDATED',
      });
      
      showNotification('AI Service updated successfully', 'success');
      await fetchAIServices();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchAIServices, showNotification]);

  return {
    aiServices,
    selectedAIService,
    loading,
    error,
    fetchAIServices,
    selectAIService,
    createAIService,
    updateAIService,
  };
};