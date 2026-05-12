/**
 * Phase Entity Type Definitions
 * JSDoc types for IDE autocomplete and documentation
 * Based on Domain Model specification
 * @module phase.types
 */

/**
 * @typedef {Object} PhaseDefinition
 * @property {string} id - Unique identifier (UUID)
 * @property {string} phaseCode - Phase code (unique, immutable, max 64 chars)
 * @property {string} displayName - Display name (max 128 chars)
 * @property {number} order - Sort order (positive integer)
 * @property {Array<string>} allowedTransitions - Allowed transition phase codes
 * @property {Object} [properties] - Additional properties (JSON)
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */

/**
 * @typedef {Object} PhaseFormData
 * @property {string} phaseCode - Phase code
 * @property {string} displayName - Display name
 * @property {number} order - Sort order
 * @property {Array<string>} allowedTransitions - Allowed transition codes
 * @property {Object} properties - Additional properties
 */

/**
 * @typedef {Object} CreatePhaseDTO
 * @property {string} phaseCode - Phase code (required)
 * @property {string} displayName - Display name (required)
 * @property {number} order - Sort order (required)
 * @property {Array<string>} allowedTransitions - Allowed transitions
 * @property {Object} [properties] - Additional properties
 */

/**
 * @typedef {Object} UpdatePhaseDTO
 * @property {string} displayName - Display name (required)
 * @property {number} order - Sort order (required)
 * @property {Array<string>} allowedTransitions - Allowed transitions
 * @property {Object} [properties] - Additional properties
 */