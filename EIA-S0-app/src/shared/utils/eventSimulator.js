/**
 * Event Simulator Module
 * UI-only simulation of Kafka event publishing
 * WARNING: This is for UI feedback only, not real Kafka integration
 * @module eventSimulator
 */

import { EVENT_TYPES } from '../constants/eventTypes';

/**
 * Simulate Kafka event publishing (client-side only)
 * This is for UI feedback and debugging only.
 * Real events are published by backend after successful API operations.
 * 
 * @param {string} eventType - Event type from EVENT_TYPES constants
 * @param {Object} payload - Event payload data
 * @returns {Object} Simulated event object
 * 
 * @example
 * simulateEvent(EVENT_TYPES.DOCTYPE_CREATED, {
 *   docTypeId: 'uuid-123',
 *   docTypeCode: 'CONTRACT',
 *   operationType: 'CREATED',
 *   timestamp: new Date().toISOString()
 * });
 */
export const simulateEvent = (eventType, payload) => {
  const event = {
    eventId: crypto.randomUUID(),
    eventType,
    source: 'governance-bc',
    occurredAt: new Date().toISOString(),
    version: 1,
    payload,
  };

  // Log to console for debugging
  console.log('📡 Event Published (Simulated):', event);

  // Store in sessionStorage for event history display
  if (typeof sessionStorage !== 'undefined') {
    try {
      const events = JSON.parse(sessionStorage.getItem('simulated_events') || '[]');
      events.push(event);
      
      // Keep last 50 events to prevent memory issues
      if (events.length > 50) {
        events.shift();
      }
      
      sessionStorage.setItem('simulated_events', JSON.stringify(events));
    } catch (err) {
      console.error('Failed to store simulated event:', err);
    }
  }

  // Warn in production mode
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Event simulation is active in production mode. This is UI-only, not real Kafka.');
  }

  return event;
};

/**
 * Get simulated event history from sessionStorage
 * @returns {Array<Object>} Array of simulated events (max 50)
 * 
 * @example
 * const events = getEventHistory();
 * console.log(`Total events: ${events.length}`);
 */
export const getEventHistory = () => {
  if (typeof sessionStorage === 'undefined') return [];
  
  try {
    return JSON.parse(sessionStorage.getItem('simulated_events') || '[]');
  } catch (err) {
    console.error('Failed to get event history:', err);
    return [];
  }
};

/**
 * Clear all simulated event history
 * 
 * @example
 * clearEventHistory(); // Clear event history
 */
export const clearEventHistory = () => {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem('simulated_events');
      console.log('🗑️ Event history cleared');
    } catch (err) {
      console.error('Failed to clear event history:', err);
    }
  }
};

/**
 * Get event count by type
 * @param {string} eventType - Event type to count
 * @returns {number} Number of events of this type
 * 
 * @example
 * const count = getEventCountByType(EVENT_TYPES.DOCTYPE_CREATED);
 * console.log(`DocType created events: ${count}`);
 */
export const getEventCountByType = (eventType) => {
  const events = getEventHistory();
  return events.filter(e => e.eventType === eventType).length;
};