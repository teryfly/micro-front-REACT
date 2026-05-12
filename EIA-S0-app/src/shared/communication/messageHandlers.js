/**
 * Message Handlers
 * Standard message processing functions for host-subapp communication
 * @module messageHandlers
 */

import { applyThemeVariables } from '../utils/styleAdapter';

/**
 * Message handler registry
 * Maps event types to handler functions
 */
export const messageHandlers = {
  'host:theme:changed': handleThemeChange,
  'host:route:sync': handleRouteSync,
  'host:auth:logout': handleAuthLogout,
  'host:notification:global': handleGlobalNotification,
  'host:config:update': handleConfigUpdate,
  'host:config:apiBaseUrl:changed': handleApiBaseUrlChange,
};

/**
 * Handle theme change event
 * @param {Object} payload - Message payload
 * @param {Object} payload.theme - New theme object
 * @param {CommunicationManager} commManager - Communication manager instance
 */
export function handleThemeChange(payload, commManager) {
  const { theme } = payload;
  
  if (!theme || typeof theme !== 'object') {
    console.error('[MessageHandler] Invalid theme object:', theme);
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 [MessageHandler] Applying new theme:', {
      variableCount: Object.keys(theme).length,
    });
  }

  applyThemeVariables(theme);

  // Emit local event for components to react
  commManager.send('local:theme:changed', { theme });
}

/**
 * Handle route sync event
 * Note: Actual navigation handled by useRouteSync hook
 * This handler is for additional processing if needed
 * @param {Object} payload - Route state
 * @param {CommunicationManager} commManager - Communication manager instance
 */
export function handleRouteSync(payload, commManager) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔀 [MessageHandler] Route sync received:', payload);
  }
  
  // Route navigation handled by useRouteSync hook
  // This handler can be used for additional side effects
}

/**
 * Handle auth logout event
 * Note: Actual logout handled by AuthProvider
 * @param {Object} payload - Logout payload
 * @param {CommunicationManager} commManager - Communication manager instance
 */
export function handleAuthLogout(payload, commManager) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚪 [MessageHandler] Logout event received');
  }

  // Logout handled by AuthProvider listener
  // This handler can be used for cleanup tasks
  
  // Clear local storage (if needed)
  try {
    sessionStorage.clear();
  } catch (err) {
    console.error('[MessageHandler] Failed to clear session storage:', err);
  }
}

/**
 * Handle global notification event
 * @param {Object} payload - Notification data
 * @param {string} payload.message - Notification message
 * @param {string} payload.type - Notification type
 * @param {number} [payload.duration] - Display duration
 * @param {CommunicationManager} commManager - Communication manager instance
 */
export function handleGlobalNotification(payload, commManager) {
  const { message, type = 'info', duration = 3000 } = payload;

  if (process.env.NODE_ENV === 'development') {
    console.log('🔔 [MessageHandler] Global notification:', { message, type });
  }

  // Emit local notification event
  commManager.send('local:notification:show', { message, type, duration });
}

/**
 * Handle configuration update event
 * @param {Object} payload - Config update data
 * @param {CommunicationManager} commManager - Communication manager instance
 */
export function handleConfigUpdate(payload, commManager) {
  const { config } = payload;

  if (process.env.NODE_ENV === 'development') {
    console.log('⚙️ [MessageHandler] Config update received:', config);
  }

  // Process specific config updates
  if (config.apiBaseUrl) {
    handleApiBaseUrlChange({ apiBaseUrl: config.apiBaseUrl }, commManager);
  }
}

/**
 * Handle API base URL change event
 * @param {Object} payload - API URL data
 * @param {string} payload.apiBaseUrl - New API base URL
 * @param {CommunicationManager} commManager - Communication manager instance
 */
export function handleApiBaseUrlChange(payload, commManager) {
  const { apiBaseUrl } = payload;

  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 [MessageHandler] API base URL changed:', apiBaseUrl);
  }

  // Emit local event for ApiProvider to handle
  commManager.send('local:config:apiBaseUrl:changed', { apiBaseUrl });
}

/**
 * Register all message handlers
 * @param {CommunicationManager} commManager - Communication manager instance
 * 
 * @example
 * registerMessageHandlers(commManager);
 */
export function registerMessageHandlers(commManager) {
  Object.entries(messageHandlers).forEach(([eventType, handler]) => {
    commManager.listen(eventType, (payload) => {
      handler(payload, commManager);
    });
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [MessageHandler] Registered handlers:', Object.keys(messageHandlers));
  }
}