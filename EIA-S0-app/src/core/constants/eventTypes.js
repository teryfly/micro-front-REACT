/**
 * Event Type Constants
 * Kafka event types for UI simulation
 * @module constants/eventTypes
 */

export const EVENT_TYPES = Object.freeze({
  DOCTYPE_CREATED: 'governance.doctype.changed.v1',
  DOCTYPE_UPDATED: 'governance.doctype.changed.v1',
  DOCTYPE_DELETED: 'governance.doctype.changed.v1',
  
  PHASE_CREATED: 'governance.phase.changed.v1',
  PHASE_UPDATED: 'governance.phase.changed.v1',
  PHASE_DELETED: 'governance.phase.changed.v1',
  
  PROMPT_TEMPLATE_CREATED: 'governance.prompttemplate.changed.v1',
  PROMPT_TEMPLATE_UPDATED: 'governance.prompttemplate.changed.v1',
  
  AI_SERVICE_CREATED: 'governance.aiserviceconfig.changed.v1',
  AI_SERVICE_UPDATED: 'governance.aiserviceconfig.changed.v1',
  
  ROLE_PERMISSION_UPDATED: 'governance.rolepermission.changed.v1',
  
  CATEGORY_CREATED: 'governance.documentcategory.changed.v1',
  CATEGORY_UPDATED: 'governance.documentcategory.changed.v1',
  CATEGORY_DELETED: 'governance.documentcategory.changed.v1',
  
  REFRESH_CACHE: 'governance.refreshcache.v1',
  SYNC_REQUEST: 'governance.syncrequest.v1',
});

export const getEventType = (entity, operation) => {
  const key = `${entity.toUpperCase()}_${operation.toUpperCase()}`;
  return EVENT_TYPES[key] || null;
};