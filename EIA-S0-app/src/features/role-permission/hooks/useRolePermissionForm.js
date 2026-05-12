/**
 * Role Permission Form Hook
 * Manages form state with validation
 * @module useRolePermissionForm
 */

import { useState } from 'react';
import { ROLE_LIMITS } from '../constants/rolePermission.constants';

/**
 * Role Permission form management hook
 * @param {Object} initialData - Initial form data
 * @param {Function} onSubmit - Form submission handler
 * @returns {Object} Form state and validation
 * 
 * @example
 * const { formData, errors, updateField, handleSubmit } = useRolePermissionForm(
 *   null,
 *   async (data) => await createRole(data)
 * );
 */
export const useRolePermissionForm = (initialData, onSubmit) => {
  const defaultData = {
    name: '',
    description: '',
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
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Role name is required';
    }
    
    if (formData.name && formData.name.length > ROLE_LIMITS.ROLE_NAME_MAX_LENGTH) {
      newErrors.name = `Role name must not exceed ${ROLE_LIMITS.ROLE_NAME_MAX_LENGTH} characters`;
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