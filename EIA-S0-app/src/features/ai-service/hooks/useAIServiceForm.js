/**
 * AI Service Form Hook
 * Manages multi-step form state, validation, and JSON handling
 * @module useAIServiceForm
 */

import { useState, useCallback } from 'react';
import { 
  AI_PROVIDERS, 
  DEFAULT_PARAMETERS, 
  DEFAULT_RETRY_POLICY,
  DEFAULT_USAGE_LIMITS 
} from '../constants/aiService.constants';

/**
 * AI Service form management hook
 * @param {Object} initialData - Initial form data
 * @param {Function} onSubmit - Form submission handler
 * @returns {Object} Form state and step navigation
 * 
 * @example
 * const { formData, currentStep, nextStep, handleSubmit } = useAIServiceForm(
 *   null,
 *   async (data) => await createAIService(data)
 * );
 */
export const useAIServiceForm = (initialData, onSubmit) => {
  const defaultData = {
    provider: AI_PROVIDERS.OPENAI,
    modelName: '',
    parameters: JSON.stringify(DEFAULT_PARAMETERS[AI_PROVIDERS.OPENAI], null, 2),
    retryPolicy: JSON.stringify(DEFAULT_RETRY_POLICY, null, 2),
    usageLimits: JSON.stringify(DEFAULT_USAGE_LIMITS, null, 2),
  };

  const [formData, setFormData] = useState(initialData || defaultData);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const resetForm = useCallback(() => {
    setFormData(defaultData);
    setCurrentStep(1);
    setErrors({});
  }, []);

  const updateField = (name, value) => {
    setFormData(prev => {
      // Guard against null state
      const current = prev || defaultData;
      
      const updated = { ...current, [name]: value };
      
      // Auto-update default parameters when provider changes
      if (name === 'provider') {
        updated.parameters = JSON.stringify(DEFAULT_PARAMETERS[value], null, 2);
      }
      
      return updated;
    });
    
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const data = formData || defaultData;
    
    if (step === 1) {
      if (!data.provider) {
        newErrors.provider = 'Provider is required';
      }
      if (!data.modelName) {
        newErrors.modelName = 'Model name is required';
      }
    } else if (step === 2) {
      // Validate JSON syntax for all JSON fields
      try {
        JSON.parse(data.parameters);
      } catch (err) {
        newErrors.parameters = 'Invalid JSON: ' + err.message;
      }
      
      try {
        JSON.parse(data.retryPolicy);
      } catch (err) {
        newErrors.retryPolicy = 'Invalid JSON: ' + err.message;
      }
      
      if (data.usageLimits) {
        try {
          JSON.parse(data.usageLimits);
        } catch (err) {
          newErrors.usageLimits = 'Invalid JSON: ' + err.message;
        }
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
        const data = formData || defaultData;
        
        // Parse JSON strings to objects before submission
        const submitData = {
          provider: data.provider,
          modelName: data.modelName,
          parameters: JSON.parse(data.parameters),
          retryPolicy: JSON.parse(data.retryPolicy),
          usageLimits: data.usageLimits ? JSON.parse(data.usageLimits) : null,
        };
        
        await onSubmit(submitData);
        
        // Reset form on success
        resetForm();
      } catch (err) {
        // Error handled by onSubmit
      }
    }
  };

  return {
    formData: formData || defaultData, // Always return valid object
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