/**
 * Category Entity Type Definitions
 * JSDoc types for IDE autocomplete and documentation
 * Based on Domain Model specification
 * @module category.types
 */

/**
 * @typedef {Object} DocumentCategory
 * @property {string} id - Unique identifier (UUID)
 * @property {string} [parentId] - Parent category ID (null for root)
 * @property {string} name - Category name (max 128 chars)
 * @property {string} [description] - Optional description
 * @property {Array<DocumentCategory>} [children] - Child categories (recursive)
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */

/**
 * @typedef {Object} CategoryFormData
 * @property {string} name - Category name
 * @property {string} description - Description
 * @property {string} parentId - Parent category ID
 */

/**
 * @typedef {Object} TreeNodeProps
 * @property {DocumentCategory} node - Category node data
 * @property {number} level - Tree depth level
 * @property {boolean} isExpanded - Whether node is expanded
 * @property {Function} onToggle - Toggle handler
 * @property {Function} onEdit - Edit handler
 * @property {Function} onDelete - Delete handler
 * @property {Function} onAddChild - Add child handler
 */

/**
 * @typedef {Object} CreateCategoryDTO
 * @property {string} name - Category name (required)
 * @property {string} [description] - Description
 * @property {string} [parentId] - Parent category ID
 */

/**
 * @typedef {Object} UpdateCategoryDTO
 * @property {string} name - Category name (required)
 * @property {string} [description] - Description
 * @property {string} [parentId] - Parent category ID
 */