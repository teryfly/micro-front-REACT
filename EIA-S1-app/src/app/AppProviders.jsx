import React from 'react';
import { ThemeProvider } from './providers/ThemeContext';
import { ApiProvider } from './providers/ApiContext';
import { NotificationProvider } from './providers/NotificationContext';

/**
 * AppProviders — wraps the entire app with all required contexts.
 *
 * Provider order:
 *   ThemeProvider  (CSS vars, primaryColor)
 *   ApiProvider    (sets axios baseURL)
 *   NotificationProvider (toast system)
 */
function AppProviders({ children, theme, eventBus, apiBaseUrl }) {
  return (
    <ThemeProvider theme={theme} eventBus={eventBus}>
      <ApiProvider apiBaseUrl={apiBaseUrl}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
