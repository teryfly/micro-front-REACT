/**
 * Error Code Constants Module
 * Backend error code mappings for consistent error messages
 * Based on: S0 - REST API 规范
 * @module errorCodes
 */

/**
 * Error code to user message mapping
 * All error codes from backend API specification
 */
export const ERROR_CODES = Object.freeze({
  // Validation errors (400xx)
  40001: 'Invalid field value',
  40002: 'Phase not found',
  40003: 'Invalid phase transition',
  40004: 'Duplicate code - this code already exists',
  40005: 'Category is in use and cannot be deleted',
  40006: 'Invalid prompt template configuration',
  40007: 'Invalid AI service configuration',

  // Not found errors (404xx)
  40401: 'Resource not found',

  // Server errors (500xx)
  50001: 'Internal server error',
});

/**
 * Get error message by code
 * @param {number} code - Error code from backend
 * @returns {string} User-friendly error message
 * 
 * @example
 * getErrorMessage(40004) // Returns: "Duplicate code - this code already exists"
 * getErrorMessage(99999) // Returns: "Unknown error (code: 99999)"
 */
export const getErrorMessage = (code) => {
  return ERROR_CODES[code] || `Unknown error (code: ${code})`;
};

/**
 * Check if error code is validation error (40001-40099)
 * @param {number} code - Error code
 * @returns {boolean} True if validation error
 * 
 * @example
 * isValidationError(40001) // Returns: true
 * isValidationError(50001) // Returns: false
 */
export const isValidationError = (code) => {
  return code >= 40001 && code <= 40099;
};

/**
 * Check if error code is not found error (40401-40499)
 * @param {number} code - Error code
 * @returns {boolean} True if not found error
 * 
 * @example
 * isNotFoundError(40401) // Returns: true
 * isNotFoundError(40001) // Returns: false
 */
export const isNotFoundError = (code) => {
  return code >= 40401 && code <= 40499;
};

/**
 * Check if error code is server error (50001-50099)
 * @param {number} code - Error code
 * @returns {boolean} True if server error
 * 
 * @example
 * isServerError(50001) // Returns: true
 * isServerError(40001) // Returns: false
 */
export const isServerError = (code) => {
  return code >= 50001 && code <= 50099;
};