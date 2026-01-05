/**
 * Prompt Template Entity Type Definitions
 * JSDoc types for IDE autocomplete and documentation
 * Based on Domain Model specification
 * @module promptTemplate.types
 */

/**
 * @typedef {Object} PromptTemplate
 * @property {string} id - Unique identifier (UUID)
 * @property {string} agentName - Agent name (identifies purpose, max 64 chars)
 * @property {string} scope - Template scope (DocType | System | Task)
 * @property {string} content - Template content (prompt text, max 32000 chars)
 * @property {number} version - Version number (auto-increment starting from 1)
 * @property {string} language - Language code (e.g., "en", "zh")
 * @property {string} aiServiceConfigId - AI service configuration UUID
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */

/**
 * @typedef {Object} PromptTemplateFormData
 * @property {string} agentName - Agent name
 * @property {string} scope - Template scope
 * @property {string} content - Template content
 * @property {string} language - Language code
 * @property {string} aiServiceConfigId - AI service ID
 * @property {boolean} overwrite - Overwrite current version flag
 * @property {number} version - Current version number (for edit mode)
 */

/**
 * @typedef {Object} PromptTemplateVersion
 * @property {number} version - Version number
 * @property {string} content - Content at this version
 * @property {string} updatedAt - Update timestamp
 * @property {string} language - Language at this version
 */

/**
 * @typedef {Object} CreatePromptTemplateDTO
 * @property {string} agentName - Agent name (required)
 * @property {string} scope - Template scope (required)
 * @property {string} content - Template content (required)
 * @property {string} language - Language code (required)
 * @property {string} aiServiceConfigId - AI service ID (required)
 */

/**
 * @typedef {Object} UpdatePromptTemplateDTO
 * @property {string} agentName - Agent name (required)
 * @property {string} scope - Template scope (required)
 * @property {string} content - Template content (required)
 * @property {string} language - Language code (required)
 * @property {string} aiServiceConfigId - AI service ID (required)
 */