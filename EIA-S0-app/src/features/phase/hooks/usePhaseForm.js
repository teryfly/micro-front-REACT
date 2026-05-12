/**
 * Phase Form Management Hook
 * Manages form state and validation
 * @module usePhaseForm
 */

import { useState } from 'react';

/**
 * Phase form management hook
 * @param {Object} initialData - Initial form data
 * @param {Function} onSubmit - Form submission handler
 * @returns {Object} Form state and handlers
 * 
 * @example
 * const { formData, errors, updateField, handleSubmit } = usePhaseForm(
 *   null,
 *   async (data) => await createPhase(data)
 * );
 */
export const usePhaseForm = (initialData, onSubmit) => {
  const defaultData = {
    phaseCode: '',
    displayName: '',
    order: 0,
    allowedTransitions: [],
    properties: {},
  };

  const [formData, setFormData] = useState(initialData || defaultData);
  const [errors, setErrors] = useState({});

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.phaseCode) {
      newErrors.phaseCode = 'Phase code is required';
    }
    
    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (formData.order < 0) {
      newErrors.order = 'Order must be a positive number';
    }
    
    if (formData.allowedTransitions.includes(formData.phaseCode)) {
      newErrors.allowedTransitions = 'Phase cannot transition to itself';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit(formData);
        setFormData(defaultData);
        setErrors({});
      } catch (err) {
        // Error handled by onSubmit
      }
    }
  };

  return {
    formData,
    errors,
    updateField,
    handleSubmit,
    setFormData,
  };
};