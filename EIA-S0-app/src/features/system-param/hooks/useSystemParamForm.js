/**
 * System Parameter Form Hook
 * Manages form state with type-specific validation and editable control
 * @module useSystemParamForm
 */
import { useState, useCallback } from 'react';
import { validateJSON } from '../../../shared/utils/validation';
import { PARAM_TYPES } from '../constants/systemParam.constants';
/**
 * System Parameter form management hook
 * @param {Object} initialData - Initial form data
 * @param {Function} onSubmit - Form submission handler
 * @param {boolean} isEditMode - Whether this is edit mode or create mode
 * @param {Array<string>} editableKeys - Current list of editable parameter keys
 * @returns {Object} Form state and validation
 * 
 * @example
 * const { formData, errors, updateField, handleSubmit } = useSystemParamForm(
 *   null,
 *   async (data) => await createParam(data),
 *   false, // create mode
 *   editableKeys // current editable keys
 * );
 */
export const useSystemParamForm = (initialData, onSubmit, isEditMode = false, editableKeys = []) => {
  const defaultData = {
    key: '',
    value: '',
    type: PARAM_TYPES.STRING,
    description: '',
    editable: true, // Default to editable in create mode
  };
  const [formData, setFormData] = useState(initialData || defaultData);
  const [errors, setErrors] = useState({});
  const resetForm = useCallback(() => {
    setFormData(defaultData);
    setErrors({});
  }, []);
  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  const validate = () => {
    const newErrors = {};
    // Key validation (only for create mode)
    if (!isEditMode) {
      if (!formData.key) {
        newErrors.key = 'Parameter key is required';
      } else if (formData.key.length > 128) {
        newErrors.key = 'Key must be 128 characters or less';
      } else if (!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(formData.key)) {
        newErrors.key = 'Key must start with letter and contain only letters, numbers, dots, hyphens, or underscores';
      } else if (editableKeys.includes(formData.key)) {
        newErrors.key = 'A parameter with this key already exists';
      }
    }
    if (!formData.value) {
      newErrors.value = 'Value is required';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    // Type-specific validation
    if (formData.type === PARAM_TYPES.INT) {
      const intValue = parseInt(formData.value, 10);
      if (isNaN(intValue)) {
        newErrors.value = 'Value must be a valid integer';
      }
    } else if (formData.type === PARAM_TYPES.BOOL) {
      if (formData.value !== 'true' && formData.value !== 'false') {
        newErrors.value = 'Value must be true or false';
      }
    } else if (formData.type === PARAM_TYPES.JSON) {
      const jsonError = validateJSON(formData.value, 'Value');
      if (jsonError) {
        newErrors.value = jsonError;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit(formData);
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
    resetForm,
    isEditMode,
  };
};