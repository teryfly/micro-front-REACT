/**
 * System Parameter Entity Type Definitions
 * JSDoc types for IDE autocomplete and documentation
 * Based on Domain Model specification
 * @module systemParam.types
 */

/**
 * @typedef {Object} SystemParameter
 * @property {string} key - Parameter key (unique, max 128 chars)
 * @property {string} value - Parameter value (string representation, max 256 chars)
 * @property {string} type - Parameter type (string | int | bool | json)
 * @property {string} [description] - Parameter description
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */

/**
 * @typedef {Object} SystemParamFormData
 * @property {string} key - Parameter key
 * @property {string} value - Parameter value
 * @property {string} type - Parameter type
 * @property {string} description - Parameter description
 */

/**
 * @typedef {Object} UpdateSystemParamDTO
 * @property {string} value - New parameter value
 * @property {string} type - Parameter type
 * @property {string} [description] - Parameter description
 */