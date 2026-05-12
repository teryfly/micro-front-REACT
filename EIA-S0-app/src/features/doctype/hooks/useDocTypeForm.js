/**
 * DocType Multi-Step Form Hook
 * Manages 2-step form state and validation
 * @module useDocTypeForm
 */

import { useState } from 'react';
import { DOCTYPE_DEFAULTS } from '../constants/docType.constants';

/**
 * DocType form management hook
 * @param {Object} initialData - Initial form data
 * @param {Function} onSubmit - Form submission handler
 * @returns {Object} Form state and step navigation
 * 
 * @example
 * const { formData, currentStep, nextStep, handleSubmit } = useDocTypeForm(
 *   null,
 *   async (data) => await createDocType(data)
 * );
 */
export const useDocTypeForm = (initialData, onSubmit) => {
  const [formData, setFormData] = useState(initialData || DOCTYPE_DEFAULTS);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      const stepErrors = {};
      
      if (!formData.code) stepErrors.code = 'Code is required';
      if (!formData.name) stepErrors.name = 'Name is required';
      
      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    } else if (step === 2) {
      const stepErrors = {};
      
      if (!formData.allowedPhases || formData.allowedPhases.length === 0) {
        stepErrors.allowedPhases = 'At least one phase must be selected';
      }
      
      if (!formData.defaultPhase) {
        stepErrors.defaultPhase = 'Default phase is required';
      } else if (!formData.allowedPhases.includes(formData.defaultPhase)) {
        stepErrors.defaultPhase = 'Default phase must be in allowed phases';
      }
      
      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }
    
    return true;
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
        // Transform form data to match Swagger spec
        const submitData = {
          code: formData.code,
          name: formData.name,
          description: formData.description || null,
          allowedPhases: formData.allowedPhases,
          defaultPhase: formData.defaultPhase,
          // Only include categoryId if it's a valid UUID (not empty string)
          categoryId: formData.categoryId && formData.categoryId.trim() !== '' 
            ? formData.categoryId 
            : null,
          // Only include aiDraftPromptTemplateId if it's a valid UUID (not empty string)
          aiDraftPromptTemplateId: formData.aiDraftPromptTemplateId && formData.aiDraftPromptTemplateId.trim() !== '' 
            ? formData.aiDraftPromptTemplateId 
            : null,
          metadata: formData.metadata || {},
          customFields: formData.customFields || {},
        };

        await onSubmit(submitData);
        setFormData(DOCTYPE_DEFAULTS);
        setCurrentStep(1);
        setErrors({});
      } catch (err) {
        // Error handled by onSubmit
      }
    }
  };

  return {
    formData,
    currentStep,
    errors,
    updateField,
    nextStep,
    prevStep,
    handleSubmit,
    setFormData,
  };
};