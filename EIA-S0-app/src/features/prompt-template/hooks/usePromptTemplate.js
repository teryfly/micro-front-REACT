/**
 * Prompt Template State Management Hook
 * Manages list data, CRUD operations, version history, and event simulation
 * @module usePromptTemplate
 */

import { useState, useEffect, useCallback } from 'react';
import { promptTemplateService } from '../services/promptTemplateService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { simulateEvent } from '../../../shared/utils/eventSimulator';
import { EVENT_TYPES } from '../../../shared/constants/eventTypes';

/**
 * Prompt Template state management hook
 * @returns {Object} Prompt Template state and actions
 * 
 * @example
 * const { promptTemplates, loading, createTemplate } = usePromptTemplate();
 */
export const usePromptTemplate = () => {
  const [promptTemplates, setPromptTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await promptTemplateService.getAll();
      setPromptTemplates(data);
    } catch (err) {
      setError(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Initial fetch on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const selectTemplate = useCallback(async (id) => {
    try {
      const template = await promptTemplateService.getById(id);
      setSelectedTemplate(template);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);

  const fetchVersionHistory = useCallback(async (id) => {
    try {
      const versions = await promptTemplateService.getVersions(id);
      setVersionHistory(versions);
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [showNotification]);

  const createTemplate = useCallback(async (data) => {
    try {
      const result = await promptTemplateService.create(data);
      
      simulateEvent(EVENT_TYPES.PROMPT_TEMPLATE_CREATED, {
        promptTemplateId: result.id,
        scope: data.scope,
        language: data.language,
        version: 1,
        aiServiceConfigId: data.aiServiceConfigId,
        operationType: 'CREATED',
      });
      
      showNotification('Prompt Template created successfully', 'success');
      await fetchTemplates();
      return result;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchTemplates, showNotification]);

  const updateTemplate = useCallback(async (id, data, overwrite = false) => {
    try {
      await promptTemplateService.update(id, data, overwrite);
      
      simulateEvent(EVENT_TYPES.PROMPT_TEMPLATE_UPDATED, {
        promptTemplateId: id,
        scope: data.scope,
        language: data.language,
        version: overwrite ? 'overwritten' : 'incremented',
        aiServiceConfigId: data.aiServiceConfigId,
        operationType: 'UPDATED',
      });
      
      const message = overwrite 
        ? 'Prompt Template overwritten successfully'
        : 'New version created successfully';
      
      showNotification(message, 'success');
      await fetchTemplates();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchTemplates, showNotification]);

  return {
    promptTemplates,
    selectedTemplate,
    versionHistory,
    loading,
    error,
    fetchTemplates,
    selectTemplate,
    fetchVersionHistory,
    createTemplate,
    updateTemplate,
  };
};