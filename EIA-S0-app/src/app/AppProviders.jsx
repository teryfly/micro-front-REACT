import React, { useEffect, useMemo } from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { ApiProvider } from './providers/ApiProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ModeProvider } from './providers/ModeContext';
import { CommunicationProvider } from './providers/CommunicationContext';
import { createCommunicationManager } from '../shared/communication/CommunicationManager';
import { registerMessageHandlers } from '../shared/communication/messageHandlers';
import { getEnv } from '../shared/utils/env';

/**
 * Combined provider wrapper
 * Adapts to both standalone and embedded modes
 * Combines all context providers in correct nesting order
 * 
 * Provider hierarchy:
 * 1. ModeProvider (outermost) - mode information needed by all
 * 2. CommunicationProvider - communication needed for theme/auth sync
 * 3. ThemeProvider - theme variables needed for UI
 * 4. AuthProvider - authentication needed for API
 * 5. ApiProvider - API client needs auth token
 * 6. NotificationProvider (innermost) - displays feedback from operations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.embedded=false] - Embedded mode flag
 * @param {Object} [props.theme] - External theme from host app
 * @param {Object} [props.eventBus] - Event bus from host app
 * @param {string} [props.token] - Auth token from host app or URL
 * @param {Object} [props.userInfo] - User info from host app
 * @param {string} [props.baseURL] - API base URL from URL params
 * @param {string} [props.apiBaseUrl] - API base URL from host app
 */
const AppProviders = ({ 
  children, 
  // Original props (standalone mode)
  token: localToken, 
  baseURL: localBaseURL,
  // New props (embedded mode)
  embedded = false,
  theme: externalTheme,
  eventBus,
  userInfo: externalUserInfo,
  apiBaseUrl: externalApiBaseUrl,
}) => {
  // Props priority handling
  const finalToken = externalUserInfo?.token || localToken;
  const finalBaseURL = externalApiBaseUrl || localBaseURL;
  const finalUserInfo = externalUserInfo || null;

  // Create communication manager instance
  const commManager = useMemo(() => {
    if (!embedded) return null;
    
    // FIX: Use getEnv instead of process.env directly
    const hostOrigin = getEnv('REACT_APP_HOST_ORIGIN', '*');
    
    const manager = createCommunicationManager(
      eventBus,
      hostOrigin,
      'eia-s0-app'
    );

    // Register standard message handlers
    registerMessageHandlers(manager);

    return manager;
  }, [embedded, eventBus]);

  /**
   * Send app ready event on mount (embedded mode)
   */
  useEffect(() => {
    if (embedded && commManager) {
      commManager.send('subapp:ready', {
        appId: 'eia-s0-app',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }
  }, [embedded, commManager]);

  /**
   * Send app unmount event on cleanup (embedded mode)
   */
  useEffect(() => {
    return () => {
      if (embedded && commManager) {
        commManager.send('subapp:unmounted', {
          appId: 'eia-s0-app',
          timestamp: new Date().toISOString(),
        });
        commManager.destroy();
      }
    };
  }, [embedded, commManager]);

  return (
    <ModeProvider embedded={embedded} eventBus={eventBus}>
      <CommunicationProvider commManager={commManager}>
        <ThemeProvider theme={externalTheme} eventBus={eventBus} embedded={embedded}>
          <AuthProvider 
            initialToken={finalToken} 
            userInfo={finalUserInfo}
            embedded={embedded}
            eventBus={eventBus}
          >
            <ApiProvider 
              baseURL={finalBaseURL}
              externalBaseURL={externalApiBaseUrl}
              embedded={embedded}
              eventBus={eventBus}
            >
              <NotificationProvider embedded={embedded} eventBus={eventBus}>
                {children}
              </NotificationProvider>
            </ApiProvider>
          </AuthProvider>
        </ThemeProvider>
      </CommunicationProvider>
    </ModeProvider>
  );
};

export default AppProviders;