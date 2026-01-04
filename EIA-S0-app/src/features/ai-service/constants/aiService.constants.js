/**
 * AI Service Constants
 * Providers, default configurations, and validation limits
 * @module aiService.constants
 */

/**
 * Supported AI providers
 */
export const AI_PROVIDERS = Object.freeze({
  OPENAI: 'OpenAI',
  AZURE: 'Azure',
  LOCAL: 'Local',
});

/**
 * Default parameters configuration by provider
 */
export const DEFAULT_PARAMETERS = Object.freeze({
  [AI_PROVIDERS.OPENAI]: {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  [AI_PROVIDERS.AZURE]: {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 1.0,
    api_version: '2023-05-15',
  },
  [AI_PROVIDERS.LOCAL]: {
    temperature: 0.7,
    max_tokens: 2000,
    context_window: 4096,
  },
});

/**
 * Default retry policy configuration
 */
export const DEFAULT_RETRY_POLICY = Object.freeze({
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
});

/**
 * Default usage limits configuration
 */
export const DEFAULT_USAGE_LIMITS = Object.freeze({
  maxRequestsPerMinute: 60,
  maxTokensPerDay: 100000,
});

/**
 * Form field validation limits
 */
export const AI_SERVICE_LIMITS = Object.freeze({
  MODEL_NAME_MAX_LENGTH: 128,
});