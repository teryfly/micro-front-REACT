/**
 * Prompt Template Form Hook
 * Manages multi-step form state, validation, and content handling
 * @module usePromptTemplateForm
 */

import { useState, useCallback } from 'react';
import { TEMPLATE_DEFAULTS, TEMPLATE_LIMITS } from '../constants/promptTemplate.constants';

/**
 * Prompt Template form management hook
 * @param {Object} initialData - Initial form data
 * @param {Function} onSubmit - Form submission handler
 * @returns {Object} Form state and step navigation
 * 
 * @example
 * const { formData, currentStep, nextStep, handleSubmit } = usePromptTemplateForm(
 *   null,
 *   async (data) => await createTemplate(data)
 * );
 */
export const usePromptTemplateForm = (initialData, onSubmit) => {
  const [formData, setFormData] = useState(initialData || TEMPLATE_DEFAULTS);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const resetForm = useCallback(() => {
    setFormData(TEMPLATE_DEFAULTS);
    setCurrentStep(1);
    setErrors({});
  }, []);

  const updateField = (name, value) => {
    setFormData(prev => {
      const current = prev || TEMPLATE_DEFAULTS;
      return { ...current, [name]: value };
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const data = formData || TEMPLATE_DEFAULTS;
    
    if (step === 1) {
      if (!data.agentName) {
        newErrors.agentName = 'Agent name is required';
      }
      if (!data.scope) {
        newErrors.scope = 'Scope is required';
      }
      if (!data.language) {
        newErrors.language = 'Language is required';
      }
      if (!data.aiServiceConfigId) {
        newErrors.aiServiceConfigId = 'AI Service is required';
      }
    } else if (step === 2) {
      if (!data.content || data.content.trim() === '') {
        newErrors.content = 'Content is required';
      }
      if (data.content && data.content.length > TEMPLATE_LIMITS.CONTENT_MAX_LENGTH) {
        newErrors.content = `Content exceeds maximum length (${TEMPLATE_LIMITS.CONTENT_MAX_LENGTH} characters)`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        const data = formData || TEMPLATE_DEFAULTS;
        await onSubmit(data);
        
        // Reset form on success
        resetForm();
      } catch (err) {
        // Error handled by onSubmit
      }
    }
  };

  return {
    formData: formData || TEMPLATE_DEFAULTS,
    currentStep,
    errors,
    updateField,
    nextStep,
    prevStep,
    handleSubmit,
    setFormData,
    resetForm,
  };
};