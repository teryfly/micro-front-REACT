/**
 * Application Constants
 * @module constants/app
 */

export const APP_CONFIG = Object.freeze({
  NAME: 'Governance BC',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
});

export const ENTITY_STATUS = Object.freeze({
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
});

export const OPERATION_TYPES = Object.freeze({
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  DISABLED: 'DISABLED',
});

export const NOTIFICATION_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
});

export const MODAL_SIZES = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
});

export const TABLE_ACTIONS = Object.freeze({
  EDIT: 'edit',
  DELETE: 'delete',
  VIEW: 'view',
  DISABLE: 'disable',
  ENABLE: 'enable',
});

export const FORM_MODES = Object.freeze({
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
});