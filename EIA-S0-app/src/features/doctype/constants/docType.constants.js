/**
 * DocType-Specific Constants
 * Field limits, status values, and default form data
 * @module docType.constants
 */

/**
 * DocType status enumeration
 */
export const DOCTYPE_STATUS = Object.freeze({
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
});

/**
 * Form field validation limits
 * Based on SRS and database schema constraints
 */
export const DOCTYPE_LIMITS = Object.freeze({
  CODE_MIN_LENGTH: 1,
  CODE_MAX_LENGTH: 64,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 128,
  DESCRIPTION_MAX_LENGTH: 500,
  MIN_ALLOWED_PHASES: 1,
});

/**
 * Default form values for create/reset
 */
export const DOCTYPE_DEFAULTS = Object.freeze({
  code: '',
  name: '',
  description: '',
  categoryId: '',
  aiDraftPromptTemplateId: '',
  allowedPhases: [],
  defaultPhase: '',
  metadata: {},
  customFields: {},
});