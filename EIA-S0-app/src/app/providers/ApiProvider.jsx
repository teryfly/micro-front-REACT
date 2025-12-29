import React, { createContext, useMemo } from 'react';
import apiClient from '../../shared/api/apiClient';

/**
 * API client context
 * Provides access to the configured API client instance
 */
export const ApiContext = createContext(null);

/**
 * API Provider - Provides API client to all child components
 * Supports dynamic base URL configuration for Module Federation scenarios
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.baseURL] - Optional base URL override for API client
 * 
 * @example
 * <ApiProvider baseURL="https://api.production.com">
 *   <App />
 * </ApiProvider>
 */
export const ApiProvider = ({ children, baseURL }) => {
  // Configure base URL if provided (for Module Federation)
  // This allows the host application to override the API endpoint
  useMemo(() => {
    if (baseURL) {
      const instance = apiClient.getInstance();
      if (instance) {
        instance.defaults.baseURL = baseURL;
      }
    }
  }, [baseURL]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ apiClient }), []);

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};