/**
 * Validation Utilities
 * Reusable form validation functions
 * @module utils/validation
 */

export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} cannot be empty`;
  }
  return null;
};

export const validateLength = (value, min, max, fieldName) => {
  if (!value) return null;
  
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must not exceed ${max} characters`;
  }
  return null;
};

export const validateEmail = (value, fieldName) => {
  if (!value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `${fieldName} must be a valid email address`;
  }
  return null;
};

export const validateJSON = (value, fieldName) => {
  if (!value || value.trim() === '') return null;
  
  try {
    JSON.parse(value);
    return null;
  } catch (err) {
    return `${fieldName} must be valid JSON`;
  }
};

export const validatePositiveNumber = (value, fieldName) => {
  if (value === null || value === undefined) return null;
  
  if (typeof value !== 'number' || value < 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

export const composeValidators = (...validators) => (value, fieldName) => {
  for (const validator of validators) {
    const error = validator(value, fieldName);
    if (error) return error;
  }
  return null;
};