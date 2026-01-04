/**
 * Error Code Constants
 * Backend error code mappings
 * @module constants/errorCodes
 */

export const ERROR_CODES = Object.freeze({
  40001: 'Invalid field value',
  40002: 'Phase not found',
  40003: 'Invalid phase transition',
  40004: 'Duplicate code - this code already exists',
  40005: 'Category is in use and cannot be deleted',
  40006: 'Invalid prompt template configuration',
  40007: 'Invalid AI service configuration',
  40401: 'Resource not found',
  50001: 'Internal server error',
});

export const getErrorMessage = (code) => 
  ERROR_CODES[code] || `Unknown error (code: ${code})`;

export const isValidationError = (code) => code >= 40001 && code <= 40099;
export const isNotFoundError = (code) => code >= 40401 && code <= 40499;
export const isServerError = (code) => code >= 50001 && code <= 50099;