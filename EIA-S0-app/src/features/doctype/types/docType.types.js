/**
 * DocType Entity Type Definitions
 * JSDoc types for IDE autocomplete and documentation
 * Based on Domain Model specification
 * @module docType.types
 */

/**
 * @typedef {Object} DocType
 * @property {string} id - Unique identifier (UUID)
 * @property {string} code - Document type code (unique, immutable, max 64 chars)
 * @property {string} name - Display name (max 128 chars)
 * @property {string} [description] - Optional description
 * @property {Array<string>} allowedPhases - List of allowed phase codes
 * @property {string} defaultPhase - Default phase code (must be in allowedPhases)
 * @property {string} [categoryId] - Category UUID reference
 * @property {string} [aiDraftPromptTemplateId] - AI prompt template UUID reference
 * @property {Object} [metadata] - Additional metadata (JSON)
 * @property {Object} [customFields] - Custom fields (JSON)
 * @property {string} createdAt - Creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */

/**
 * @typedef {Object} DocTypeFormData
 * @property {string} code - Document type code
 * @property {string} name - Display name
 * @property {string} description - Description
 * @property {string} categoryId - Category ID
 * @property {string} aiDraftPromptTemplateId - AI template ID
 * @property {Array<string>} allowedPhases - Allowed phase codes
 * @property {string} defaultPhase - Default phase code
 * @property {Object} metadata - Metadata object
 * @property {Object} customFields - Custom fields object
 */

/**
 * @typedef {Object} CreateDocTypeDTO
 * @property {string} code - Document type code (required)
 * @property {string} name - Display name (required)
 * @property {string} [description] - Description
 * @property {Array<string>} allowedPhases - Allowed phases (required)
 * @property {string} defaultPhase - Default phase (required)
 * @property {string} [categoryId] - Category ID
 * @property {string} [aiDraftPromptTemplateId] - AI template ID
 * @property {Object} [metadata] - Metadata
 * @property {Object} [customFields] - Custom fields
 */

/**
 * @typedef {Object} UpdateDocTypeDTO
 * @property {string} name - Display name (required)
 * @property {string} [description] - Description
 * @property {Array<string>} allowedPhases - Allowed phases (required)
 * @property {string} defaultPhase - Default phase (required)
 * @property {string} [categoryId] - Category ID
 * @property {string} [aiDraftPromptTemplateId] - AI template ID
 * @property {Object} [metadata] - Metadata
 * @property {Object} [customFields] - Custom fields
 */