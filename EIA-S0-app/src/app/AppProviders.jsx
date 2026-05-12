import React from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { ApiProvider } from './providers/ApiProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { ModeProvider } from './providers/ModeContext';

/**
 * Combined provider wrapper
 * Provider hierarchy:
 * ModeProvider → AuthProvider → ApiProvider → NotificationProvider
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.embedded=false]  - injected by host app
 * @param {Object}  [props.eventBus=null]   - injected by host app
 * @param {string}  [props.token]           - initial auth token
 * @param {string}  [props.apiBaseUrl]      - API base URL override (Module Federation)
 * @param {string}  [props.baseURL]         - legacy alias for apiBaseUrl
 */
const AppProviders = ({ children, embedded = false, eventBus = null, token, apiBaseUrl, baseURL }) => {
  return (
    <ModeProvider embedded={embedded} eventBus={eventBus}>
      <AuthProvider initialToken={token}>
        <ApiProvider baseURL={apiBaseUrl || baseURL}>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ApiProvider>
      </AuthProvider>
    </ModeProvider>
  );
};

export default AppProviders;