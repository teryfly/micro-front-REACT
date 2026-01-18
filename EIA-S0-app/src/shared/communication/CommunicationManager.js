/**
 * Communication Manager
 * Unified interface for EventBus and postMessage communication
 * Automatically selects appropriate communication method
 * @module CommunicationManager
 */

/**
 * Communication Manager Class
 * Handles both EventBus (preferred) and postMessage (fallback) communication
 */
export class CommunicationManager {
  /**
   * @param {Object} eventBus - Event bus instance from host app
   * @param {string} [targetOrigin='*'] - Target origin for postMessage
   * @param {string} [appId='eia-s0-app'] - Application identifier
   */
  constructor(eventBus = null, targetOrigin = '*', appId = 'eia-s0-app') {
    this.eventBus = eventBus;
    this.targetOrigin = targetOrigin;
    this.appId = appId;
    this.messageHandlers = new Map();
    this.messageLog = [];
    this.maxLogSize = 100;

    // Initialize postMessage listener if no EventBus
    if (!this.eventBus) {
      this.initPostMessageListener();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📡 [CommunicationManager] Initialized:', {
        hasEventBus: !!this.eventBus,
        communicationMethod: this.eventBus ? 'EventBus' : 'postMessage',
        appId: this.appId,
      });
    }
  }

  /**
   * Initialize postMessage listener
   * @private
   */
  initPostMessageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('message', (event) => {
      // Validate message origin in production
      if (process.env.NODE_ENV === 'production' && this.targetOrigin !== '*') {
        if (event.origin !== this.targetOrigin) {
          return;
        }
      }

      // Validate message format
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      const { type, payload, source } = event.data;

      // Ignore messages from self
      if (source === this.appId) {
        return;
      }

      // Log message
      this.logMessage('received', type, payload, 'postMessage');

      // Dispatch to handlers
      this.dispatchMessage(type, payload);
    });
  }

  /**
   * Send message to host app
   * @param {string} eventType - Event type
   * @param {Object} payload - Message payload
   * 
   * @example
   * commManager.send('subapp:ready', { version: '1.0.0' });
   */
  send(eventType, payload = {}) {
    const message = {
      type: eventType,
      payload,
      source: this.appId,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    if (this.eventBus) {
      // Use EventBus (preferred)
      this.eventBus.emit(eventType, payload);
      this.logMessage('sent', eventType, payload, 'EventBus');
    } else {
      // Fallback to postMessage
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage(message, this.targetOrigin);
        this.logMessage('sent', eventType, payload, 'postMessage');
      }
    }
  }

  /**
   * Listen for messages
   * @param {string} eventType - Event type to listen for
   * @param {Function} handler - Message handler function
   * 
   * @example
   * commManager.listen('host:theme:changed', (payload) => {
   *   updateTheme(payload.theme);
   * });
   */
  listen(eventType, handler) {
    if (this.eventBus) {
      // Use EventBus
      this.eventBus.on(eventType, handler);
    } else {
      // Use internal handler map for postMessage
      if (!this.messageHandlers.has(eventType)) {
        this.messageHandlers.set(eventType, []);
      }
      this.messageHandlers.get(eventType).push(handler);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('👂 [CommunicationManager] Listening for:', eventType);
    }
  }

  /**
   * Stop listening for messages
   * @param {string} eventType - Event type
   * @param {Function} handler - Handler to remove
   */
  unlisten(eventType, handler) {
    if (this.eventBus) {
      this.eventBus.off(eventType, handler);
    } else {
      const handlers = this.messageHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  /**
   * Listen once for a message
   * @param {string} eventType - Event type
   * @param {Function} handler - Message handler
   */
  once(eventType, handler) {
    const onceHandler = (payload) => {
      handler(payload);
      this.unlisten(eventType, onceHandler);
    };
    this.listen(eventType, onceHandler);
  }

  /**
   * Dispatch message to registered handlers
   * @private
   */
  dispatchMessage(eventType, payload) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[CommunicationManager] Handler error for ${eventType}:`, err);
        }
      });
    }
  }

  /**
   * Log message for debugging
   * @private
   */
  logMessage(direction, type, payload, method) {
    if (process.env.NODE_ENV !== 'development') return;

    const log = {
      direction, // 'sent' | 'received'
      type,
      payload,
      method, // 'EventBus' | 'postMessage'
      timestamp: new Date().toISOString(),
    };

    this.messageLog.push(log);

    // Limit log size
    if (this.messageLog.length > this.maxLogSize) {
      this.messageLog.shift();
    }

    const icon = direction === 'sent' ? '📤' : '📥';
    console.log(`${icon} [${method}] ${type}`, payload);
  }

  /**
   * Get message log (for debugging)
   * @returns {Array} Message log
   */
  getMessageLog() {
    return [...this.messageLog];
  }

  /**
   * Clear message log
   */
  clearMessageLog() {
    this.messageLog = [];
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ [CommunicationManager] Message log cleared');
    }
  }

  /**
   * Generate unique message ID
   * @private
   */
  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destroy communication manager
   * Cleanup all listeners
   */
  destroy() {
    if (this.eventBus) {
      // EventBus cleanup handled by individual components
    }
    this.messageHandlers.clear();
    this.messageLog = [];
  }
}

/**
 * Create communication manager instance
 * @param {Object} eventBus - Event bus from host app
 * @param {string} targetOrigin - Target origin for postMessage
 * @param {string} appId - Application ID
 * @returns {CommunicationManager} Communication manager instance
 */
export const createCommunicationManager = (eventBus, targetOrigin, appId) => {
  return new CommunicationManager(eventBus, targetOrigin, appId);
};