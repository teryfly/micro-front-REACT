import React, { createContext, useMemo, useEffect } from 'react';
import apiClient from '../../shared/api/apiClient';

/**
 * API client context
 * Provides access to the configured API client instance
 */
export const ApiContext = createContext(null);

/**
 * API Provider - Provides API client to all child components
 * Supports dynamic base URL configuration for both standalone and embedded modes
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.baseURL] - Base URL from URL params (standalone)
 * @param {string} [props.externalBaseURL] - Base URL from host app (embedded)
 * @param {boolean} [props.embedded=false] - Embedded mode flag
 * @param {Object} [props.eventBus] - Event bus for config updates
 * 
 * @example
 * // Standalone mode
 * <ApiProvider baseURL="https://api.local.com">
 *   <App />
 * </ApiProvider>
 * 
 * // Embedded mode
 * <ApiProvider 
 *   externalBaseURL="https://api.production.com"
 *   embedded={true}
 *   eventBus={eventBus}
 * >
 *   <App />
 * </ApiProvider>
 */
export const ApiProvider = ({ 
  children, 
  baseURL: localBaseURL,
  externalBaseURL,
  embedded = false,
  eventBus = null,
}) => {
  // Priority: externalBaseURL > localBaseURL > env default
  const finalBaseURL = externalBaseURL || localBaseURL;

  /**
   * Configure base URL on mount and when it changes
   */
  useMemo(() => {
    if (finalBaseURL) {
      const instance = apiClient.getInstance();
      if (instance) {
        instance.defaults.baseURL = finalBaseURL;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 [ApiProvider] Base URL configured:', {
            baseURL: finalBaseURL,
            source: externalBaseURL ? 'host-app' : 'local',
          });
        }
      }
    }
  }, [finalBaseURL, externalBaseURL]);

  /**
   * Listen for API base URL changes from host app (embedded mode)
   */
  useEffect(() => {
    if (!embedded || !eventBus) return;

    const handleApiBaseUrlChange = (data) => {
      const { apiBaseUrl } = data;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [ApiProvider] Base URL changed via EventBus:', apiBaseUrl);
      }

      const instance = apiClient.getInstance();
      if (instance && apiBaseUrl) {
        instance.defaults.baseURL = apiBaseUrl;
      }
    };

    // Listen for both host and local events
    eventBus.on('host:config:apiBaseUrl:changed', handleApiBaseUrlChange);
    eventBus.on('local:config:apiBaseUrl:changed', handleApiBaseUrlChange);

    return () => {
      eventBus.off('host:config:apiBaseUrl:changed', handleApiBaseUrlChange);
      eventBus.off('local:config:apiBaseUrl:changed', handleApiBaseUrlChange);
    };
  }, [embedded, eventBus]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ apiClient }), []);

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};