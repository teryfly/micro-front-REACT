import React from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { ApiProvider } from './providers/ApiProvider';
import { NotificationProvider } from './providers/NotificationProvider';

/**
 * Combined provider wrapper
 * Combines all context providers in correct nesting order:
 * AuthProvider → ApiProvider → NotificationProvider
 * 
 * Provider hierarchy rationale:
 * 1. AuthProvider is outermost - token must be available before API calls
 * 2. ApiProvider is second - needs auth context for token injection
 * 3. NotificationProvider is innermost - displays feedback from API calls
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components (typically App)
 * @param {string} [props.token] - Initial auth token (for Module Federation)
 * @param {string} [props.baseURL] - API base URL (for Module Federation)
 * 
 * @example
 * <AppProviders token={hostToken} baseURL="https://api.production.com">
 *   <App />
 * </AppProviders>
 */
const AppProviders = ({ children, token, baseURL }) => {
  return (
    <AuthProvider initialToken={token}>
      <ApiProvider baseURL={baseURL}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ApiProvider>
    </AuthProvider>
  );
};

export default AppProviders;