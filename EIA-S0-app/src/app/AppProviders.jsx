import React from 'react';
import { ModeProvider } from './providers/ModeContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { ApiProvider } from './providers/ApiProvider';
import { NotificationProvider } from './providers/NotificationProvider';

/**
 * Combined provider wrapper
 * Provider hierarchy:
 * ModeProvider → ThemeProvider → AuthProvider → ApiProvider → NotificationProvider
 *
 * - ModeProvider is outermost so every child can call useMode()
 * - ThemeProvider applies host-app theme CSS variables when embedded
 */
const AppProviders = ({ children, token, baseURL, apiBaseUrl, embedded = false, eventBus = null, theme = null }) => {
  return (
    <ModeProvider embedded={embedded} eventBus={eventBus}>
      <ThemeProvider theme={theme} embedded={embedded} eventBus={eventBus}>
        <AuthProvider initialToken={token}>
          <ApiProvider baseURL={apiBaseUrl || baseURL}>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ApiProvider>
        </AuthProvider>
      </ThemeProvider>
    </ModeProvider>
  );
};

export default AppProviders;