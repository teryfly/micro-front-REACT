/**
 * System Parameter Constants
 * Parameter types, labels, and validation limits
 * @module systemParam.constants
 */

/**
 * Parameter type enumeration
 */
export const PARAM_TYPES = Object.freeze({
  STRING: 'string',
  INT: 'int',
  BOOL: 'bool',
  JSON: 'json',
});

/**
 * Type display labels for UI
 */
export const PARAM_TYPE_LABELS = Object.freeze({
  [PARAM_TYPES.STRING]: 'String',
  [PARAM_TYPES.INT]: 'Integer',
  [PARAM_TYPES.BOOL]: 'Boolean',
  [PARAM_TYPES.JSON]: 'JSON',
});

/**
 * Form field validation limits
 */
export const PARAM_LIMITS = Object.freeze({
  VALUE_MAX_LENGTH: 256,
  KEY_MAX_LENGTH: 128,
});

/**
 * Default system parameter values (from specification)
 */
export const SYSTEM_PARAM_DEFAULTS = Object.freeze({
  'system.defaultAiModel': {
    value: 'gpt-4o-mini',
    type: PARAM_TYPES.STRING,
    description: 'Default AI model for generation',
  },
  'system.allowDraftWithoutTemplate': {
    value: 'false',
    type: PARAM_TYPES.BOOL,
    description: 'Allow draft creation without template',
  },
  'system.maxPromptLength': {
    value: '32000',
    type: PARAM_TYPES.INT,
    description: 'Max prompt template content length',
  },
  'system.disablePhaseDeletion': {
    value: 'true',
    type: PARAM_TYPES.BOOL,
    description: 'Prevent phase deletion',
  },
  'system.defaultPhaseOrderStep': {
    value: '10',
    type: PARAM_TYPES.INT,
    description: 'Phase order increment step',
  },
  'system.category.maxDepth': {
    value: '5',
    type: PARAM_TYPES.INT,
    description: 'Max category tree depth',
  },
  'system.enableRoleDynamicReload': {
    value: 'true',
    type: PARAM_TYPES.BOOL,
    description: 'Enable dynamic role reload',
  },
  'system.parameter.editableKeys': {
    value: '[]',
    type: PARAM_TYPES.JSON,
    description: 'Keys that can be edited from UI',
  },
  'system.ai.retryLimit': {
    value: '3',
    type: PARAM_TYPES.INT,
    description: 'Default AI retry limit',
  },
  'system.ai.tokenLimit': {
    value: '16000',
    type: PARAM_TYPES.INT,
    description: 'AI token limit',
  },
  'system.tenant.defaultLimit': {
    value: '500',
    type: PARAM_TYPES.INT,
    description: 'Default tenant quota',
  },
  'system.featureFlags': {
    value: '{}',
    type: PARAM_TYPES.JSON,
    description: 'Platform feature flags',
  },
});