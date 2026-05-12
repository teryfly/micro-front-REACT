/**
 * Role Permission Entity Type Definitions
 * JSDoc types aligned with Swagger specification
 * Based on Domain Model and Swagger API
 * @module rolePermission.types
 */

/**
 * @typedef {Object} Role
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Role name (unique, max 64 chars)
 * @property {string} [description] - Role description
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */

/**
 * @typedef {Object} RolePermission
 * @property {string} roleId - Role UUID
 * @property {Array<string>} permissions - Permission ID array
 * @property {Object} [mappingRules] - Additional mapping rules (JSON)
 */

/**
 * @typedef {Object} Permission
 * @property {string} id - Permission ID (e.g., "doctype.view")
 * @property {string} name - Permission display name
 * @property {string} category - Permission category
 * @property {string} description - Permission description
 */

/**
 * @typedef {Object} RoleFormData
 * @property {string} name - Role name
 * @property {string} description - Role description
 */

/**
 * @typedef {Object} CreateRoleRequest
 * @property {string} name - Role name (required)
 * @property {string} [description] - Role description
 */

/**
 * @typedef {Object} UpdateRoleRequest
 * @property {string} name - Role name (required)
 * @property {string} [description] - Role description
 */

/**
 * @typedef {Object} UpdateRolePermissionRequest
 * @property {Array<string>} permissions - Permission ID array
 * @property {Object} [mappingRules] - Mapping rules JSON
 */