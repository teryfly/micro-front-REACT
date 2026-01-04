/**
 * AI Service Entity Type Definitions
 * JSDoc types for IDE autocomplete and documentation
 * Based on Domain Model specification
 * @module aiService.types
 */

/**
 * @typedef {Object} AIServiceConfig
 * @property {string} id - Unique identifier (UUID)
 * @property {string} provider - AI provider (OpenAI | Azure | Local)
 * @property {string} modelName - Model identifier (e.g., gpt-4)
 * @property {Object} parameters - Model parameters (JSON)
 * @property {Object} retryPolicy - Retry policy configuration (JSON)
 * @property {Object} [usageLimits] - Usage limits (JSON, optional)
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */

/**
 * @typedef {Object} AIServiceFormData
 * @property {string} provider - Selected provider
 * @property {string} modelName - Model name
 * @property {string} parameters - JSON string
 * @property {string} retryPolicy - JSON string
 * @property {string} usageLimits - JSON string
 */

/**
 * @typedef {Object} RetryPolicy
 * @property {number} maxAttempts - Maximum retry attempts
 * @property {number} initialDelay - Initial delay in ms
 * @property {number} maxDelay - Maximum delay in ms
 * @property {number} backoffMultiplier - Backoff multiplier
 */

/**
 * @typedef {Object} UsageLimits
 * @property {number} maxRequestsPerMinute - Max requests per minute
 * @property {number} maxTokensPerDay - Max tokens per day
 */

/**
 * @typedef {Object} CreateAIServiceDTO
 * @property {string} provider - AI provider
 * @property {string} modelName - Model name
 * @property {Object} parameters - Parameters object
 * @property {Object} retryPolicy - Retry policy object
 * @property {Object} [usageLimits] - Usage limits object
 */

/**
 * @typedef {Object} UpdateAIServiceDTO
 * @property {string} provider - AI provider
 * @property {string} modelName - Model name
 * @property {Object} parameters - Parameters object
 * @property {Object} retryPolicy - Retry policy object
 * @property {Object} [usageLimits] - Usage limits object
 */