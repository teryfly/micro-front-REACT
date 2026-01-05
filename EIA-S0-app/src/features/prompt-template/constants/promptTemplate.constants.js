/**
 * Prompt Template Constants
 * Scopes, languages, validation limits, and defaults
 * @module promptTemplate.constants
 */

/**
 * Template scope enumeration
 */
export const TEMPLATE_SCOPES = Object.freeze({
  DOCTYPE: 'DocType',
  SYSTEM: 'System',
  TASK: 'Task',
});

/**
 * Supported language codes
 */
export const TEMPLATE_LANGUAGES = Object.freeze({
  ENGLISH: 'en',
  CHINESE: 'zh',
  JAPANESE: 'ja',
  KOREAN: 'ko',
  FRENCH: 'fr',
  SPANISH: 'es',
  GERMAN: 'de',
});

/**
 * Form field validation limits
 */
export const TEMPLATE_LIMITS = Object.freeze({
  AGENT_NAME_MAX_LENGTH: 64,
  CONTENT_MAX_LENGTH: 32000, // From SystemParameter specification
  LANGUAGE_MAX_LENGTH: 16,
});

/**
 * Default form values
 */
export const TEMPLATE_DEFAULTS = Object.freeze({
  agentName: '',
  scope: TEMPLATE_SCOPES.DOCTYPE,
  content: '',
  language: TEMPLATE_LANGUAGES.ENGLISH,
  aiServiceConfigId: '',
  overwrite: false,
});