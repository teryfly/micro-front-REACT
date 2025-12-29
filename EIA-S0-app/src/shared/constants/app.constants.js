/**
 * Application-Level Constants
 * General configuration and enumerations for the application
 * @module app.constants
 */

/**
 * Application configuration
 */
export const APP_CONFIG = Object.freeze({
  NAME: 'Governance BC',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
});

/**
 * Entity status enumeration
 * Used across all entities that support enable/disable
 */
export const ENTITY_STATUS = Object.freeze({
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
});

/**
 * Operation types for event payloads
 * Corresponds to Kafka event operation types
 */
export const OPERATION_TYPES = Object.freeze({
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  DISABLED: 'DISABLED',
});

/**
 * Notification types for UI feedback
 */
export const NOTIFICATION_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
});

/**
 * Modal dialog sizes
 */
export const MODAL_SIZES = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
});

/**
 * Table action types
 */
export const TABLE_ACTIONS = Object.freeze({
  EDIT: 'edit',
  DELETE: 'delete',
  VIEW: 'view',
  DISABLE: 'disable',
  ENABLE: 'enable',
});

/**
 * Form modes
 */
export const FORM_MODES = Object.freeze({
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
});