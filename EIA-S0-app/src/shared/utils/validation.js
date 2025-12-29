/**
 * Validation Utilities Module
 * Reusable form validation functions
 * All validators return error message (string) or null
 * @module validation
 */

/**
 * Validate required field
 * @param {any} value - Field value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 * 
 * @example
 * validateRequired('', 'Name') // Returns: "Name is required"
 * validateRequired('John', 'Name') // Returns: null
 * validateRequired('  ', 'Name') // Returns: "Name cannot be empty"
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

/**
 * Validate string length
 * @param {string} value - String value to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 * 
 * @example
 * validateLength('ab', 3, 10, 'Code') // Returns: "Code must be at least 3 characters"
 * validateLength('hello', 3, 10, 'Code') // Returns: null
 * validateLength('very long text here', 3, 10, 'Code') // Returns: "Code must not exceed 10 characters"
 */
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

/**
 * Validate email format
 * @param {string} value - Email value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 * 
 * @example
 * validateEmail('invalid', 'Email') // Returns: "Email must be a valid email address"
 * validateEmail('[email protected]', 'Email') // Returns: null
 */
export const validateEmail = (value, fieldName) => {
  if (!value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `${fieldName} must be a valid email address`;
  }
  return null;
};

/**
 * Validate JSON format
 * @param {string} value - JSON string to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 * 
 * @example
 * validateJSON('{invalid}', 'Metadata') // Returns: "Metadata must be valid JSON"
 * validateJSON('{"valid": true}', 'Metadata') // Returns: null
 * validateJSON('', 'Metadata') // Returns: null (empty is allowed)
 */
export const validateJSON = (value, fieldName) => {
  if (!value || value.trim() === '') return null;
  
  try {
    JSON.parse(value);
    return null;
  } catch (err) {
    return `${fieldName} must be valid JSON`;
  }
};

/**
 * Validate unique code
 * @param {string} code - Code to validate
 * @param {Array<string>} existingCodes - List of existing codes
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 * 
 * @example
 * validateUniqueCode('CONTRACT', ['CONTRACT', 'INVOICE'], 'Code')
 * // Returns: "Code already exists"
 * validateUniqueCode('PROPOSAL', ['CONTRACT', 'INVOICE'], 'Code')
 * // Returns: null
 */
export const validateUniqueCode = (code, existingCodes, fieldName) => {
  if (!code) return null;
  
  if (existingCodes.includes(code)) {
    return `${fieldName} already exists`;
  }
  return null;
};

/**
 * Validate positive number
 * @param {number} value - Number to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 * 
 * @example
 * validatePositiveNumber(-1, 'Order') // Returns: "Order must be a positive number"
 * validatePositiveNumber(5, 'Order') // Returns: null
 */
export const validatePositiveNumber = (value, fieldName) => {
  if (value === null || value === undefined) return null;
  
  if (typeof value !== 'number' || value < 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

/**
 * Compose multiple validators
 * @param {...Function} validators - Validator functions to compose
 * @returns {Function} Composed validator function
 * 
 * @example
 * const validator = composeValidators(
 *   (v) => validateRequired(v, 'Name'),
 *   (v) => validateLength(v, 3, 50, 'Name')
 * );
 * validator('ab') // Returns: "Name must be at least 3 characters"
 * validator('John Doe') // Returns: null
 */
export const composeValidators = (...validators) => (value, fieldName) => {
  for (const validator of validators) {
    const error = validator(value, fieldName);
    if (error) return error;
  }
  return null;
};

/**
 * Validate DocType form data
 * @param {Object} values - Form values to validate
 * @param {string} values.code - DocType code
 * @param {string} values.name - DocType name
 * @param {Array<string>} values.allowedPhases - Allowed phase codes
 * @param {string} values.defaultPhase - Default phase code
 * @returns {Object} Errors object { fieldName: errorMessage }
 * 
 * @example
 * validateDocType({ code: '', name: 'Test', allowedPhases: ['DRAFT'], defaultPhase: 'REVIEW' })
 * // Returns: { code: 'Code is required', defaultPhase: 'Default phase must be in allowed phases' }
 */
export const validateDocType = (values) => {
  const errors = {};

  // Required fields
  const codeError = validateRequired(values.code, 'Code');
  if (codeError) errors.code = codeError;

  const nameError = validateRequired(values.name, 'Name');
  if (nameError) errors.name = nameError;

  // Length validations
  if (!errors.code) {
    const codeLengthError = validateLength(values.code, 1, 64, 'Code');
    if (codeLengthError) errors.code = codeLengthError;
  }

  if (!errors.name) {
    const nameLengthError = validateLength(values.name, 1, 128, 'Name');
    if (nameLengthError) errors.name = nameLengthError;
  }

  // Business rules
  if (values.allowedPhases && values.allowedPhases.length === 0) {
    errors.allowedPhases = 'At least one phase must be selected';
  }

  if (values.defaultPhase && values.allowedPhases && !values.allowedPhases.includes(values.defaultPhase)) {
    errors.defaultPhase = 'Default phase must be in allowed phases';
  }

  // Optional JSON fields
  if (values.metadata) {
    const metadataError = validateJSON(values.metadata, 'Metadata');
    if (metadataError) errors.metadata = metadataError;
  }

  if (values.customFields) {
    const customFieldsError = validateJSON(values.customFields, 'Custom Fields');
    if (customFieldsError) errors.customFields = customFieldsError;
  }

  return errors;
};

/**
 * Validate Phase form data
 * @param {Object} values - Form values to validate
 * @param {string} values.phaseCode - Phase code
 * @param {string} values.displayName - Display name
 * @param {number} values.order - Display order
 * @returns {Object} Errors object
 * 
 * @example
 * validatePhase({ phaseCode: '', displayName: 'Draft', order: -1 })
 * // Returns: { phaseCode: 'Phase Code is required', order: 'Order must be a positive number' }
 */
export const validatePhase = (values) => {
  const errors = {};

  const codeError = validateRequired(values.phaseCode, 'Phase Code');
  if (codeError) errors.phaseCode = codeError;

  const nameError = validateRequired(values.displayName, 'Display Name');
  if (nameError) errors.displayName = nameError;

  if (!errors.phaseCode) {
    const codeLengthError = validateLength(values.phaseCode, 1, 64, 'Phase Code');
    if (codeLengthError) errors.phaseCode = codeLengthError;
  }

  if (values.order !== undefined && values.order !== null) {
    const orderError = validatePositiveNumber(values.order, 'Order');
    if (orderError) errors.order = orderError;
  }

  if (values.properties) {
    const propertiesError = validateJSON(values.properties, 'Properties');
    if (propertiesError) errors.properties = propertiesError;
  }

  return errors;
};

/**
 * Validate PromptTemplate form data
 * @param {Object} values - Form values to validate
 * @param {string} values.scope - Template scope
 * @param {string} values.content - Template content
 * @param {string} values.language - Language code
 * @param {string} values.aiServiceConfigId - AI Service Config ID
 * @returns {Object} Errors object
 * 
 * @example
 * validatePromptTemplate({ scope: '', content: 'Test', language: 'en', aiServiceConfigId: null })
 * // Returns: { scope: 'Scope is required', aiServiceConfigId: 'AI Service Config is required' }
 */
export const validatePromptTemplate = (values) => {
  const errors = {};

  const scopeError = validateRequired(values.scope, 'Scope');
  if (scopeError) errors.scope = scopeError;

  const contentError = validateRequired(values.content, 'Content');
  if (contentError) errors.content = contentError;

  const languageError = validateRequired(values.language, 'Language');
  if (languageError) errors.language = languageError;

  const aiServiceError = validateRequired(values.aiServiceConfigId, 'AI Service Config');
  if (aiServiceError) errors.aiServiceConfigId = aiServiceError;

  return errors;
};

/**
 * Validate Category form data
 * @param {Object} values - Form values to validate
 * @param {string} values.name - Category name
 * @returns {Object} Errors object
 * 
 * @example
 * validateCategory({ name: '' })
 * // Returns: { name: 'Name is required' }
 */
export const validateCategory = (values) => {
  const errors = {};

  const nameError = validateRequired(values.name, 'Name');
  if (nameError) errors.name = nameError;

  if (!errors.name) {
    const nameLengthError = validateLength(values.name, 1, 128, 'Name');
    if (nameLengthError) errors.name = nameLengthError;
  }

  return errors;
};

/**
 * Validate Role form data
 * @param {Object} values - Form values to validate
 * @param {string} values.name - Role name
 * @returns {Object} Errors object
 * 
 * @example
 * validateRole({ name: '' })
 * // Returns: { name: 'Name is required' }
 */
export const validateRole = (values) => {
  const errors = {};

  const nameError = validateRequired(values.name, 'Name');
  if (nameError) errors.name = nameError;

  if (!errors.name) {
    const nameLengthError = validateLength(values.name, 1, 64, 'Name');
    if (nameLengthError) errors.name = nameLengthError;
  }

  return errors;
};