/**
 * Event Simulator
 * UI-only simulation of Kafka event publishing
 * @module utils/eventSimulator
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

  console.log('📡 Event Published (Simulated):', event);

  if (typeof sessionStorage !== 'undefined') {
    try {
      const events = JSON.parse(sessionStorage.getItem('simulated_events') || '[]');
      events.push(event);
      
      if (events.length > 50) {
        events.shift();
      }
      
      sessionStorage.setItem('simulated_events', JSON.stringify(events));
    } catch (err) {
      console.error('Failed to store simulated event:', err);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Event simulation is active in production mode. This is UI-only, not real Kafka.');
  }

  return event;
};

export const getEventHistory = () => {
  if (typeof sessionStorage === 'undefined') return [];
  
  try {
    return JSON.parse(sessionStorage.getItem('simulated_events') || '[]');
  } catch (err) {
    console.error('Failed to get event history:', err);
    return [];
  }
};

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