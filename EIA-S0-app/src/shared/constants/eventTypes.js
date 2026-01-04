/**
 * Event Type Constants
 * Kafka event type definitions for simulation display
 * Based on: S0 - Governance BC 消息队列与事件驱动架构规范
 * @module eventTypes
 */

/**
 * Kafka event types for Governance BC
 * Note: These are for UI simulation only. Real events are published by backend.
 */
export const EVENT_TYPES = Object.freeze({
  // DocType events
  DOCTYPE_CREATED: 'governance.doctype.changed.v1',
  DOCTYPE_UPDATED: 'governance.doctype.changed.v1',
  DOCTYPE_DELETED: 'governance.doctype.changed.v1',

  // Phase events
  PHASE_CREATED: 'governance.phase.changed.v1',
  PHASE_UPDATED: 'governance.phase.changed.v1',
  PHASE_DELETED: 'governance.phase.changed.v1',

  // PromptTemplate events
  PROMPT_TEMPLATE_CREATED: 'governance.prompttemplate.changed.v1',
  PROMPT_TEMPLATE_UPDATED: 'governance.prompttemplate.changed.v1',

  // AIServiceConfig events
  AI_SERVICE_CREATED: 'governance.aiserviceconfig.changed.v1',
  AI_SERVICE_UPDATED: 'governance.aiserviceconfig.changed.v1',

  // RolePermission events
  ROLE_PERMISSION_UPDATED: 'governance.rolepermission.changed.v1',

  // DocumentCategory events
  CATEGORY_CREATED: 'governance.documentcategory.changed.v1',
  CATEGORY_UPDATED: 'governance.documentcategory.changed.v1',
  CATEGORY_DELETED: 'governance.documentcategory.changed.v1',

  // Internal events (consumed by S0)
  REFRESH_CACHE: 'governance.refreshcache.v1',
  SYNC_REQUEST: 'governance.syncrequest.v1',
});

/**
 * Get event type by entity and operation
 * @param {string} entity - Entity name (e.g., 'doctype', 'phase')
 * @param {string} operation - Operation type (e.g., 'created', 'updated')
 * @returns {string|null} Event type or null if not found
 * 
 * @example
 * getEventType('doctype', 'created') // Returns: 'governance.doctype.changed.v1'
 */
export const getEventType = (entity, operation) => {
  const key = `${entity.toUpperCase()}_${operation.toUpperCase()}`;
  return EVENT_TYPES[key] || null;
};