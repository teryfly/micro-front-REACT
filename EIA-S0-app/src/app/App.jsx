import React from 'react';
import AppProviders from './AppProviders';
import AppRouter from './routes/AppRouter';

/**
 * Main application component
 * Entry point for both standalone and Module Federation modes
 * 
 * Features:
 * - Accepts token and baseURL props for embedded scenarios
 * - Wraps application with context providers
 * - Configures routing and layout
 * 
 * Module Federation Usage:
 * - Standalone: <App />
 * - Embedded: <App token={userToken} baseURL={apiUrl} />
 * 
 * @param {Object} props
 * @param {string} [props.token] - Authentication token (from host app)
 * @param {string} [props.baseURL] - API base URL (from host app)
 * 
 * @example
 * // Standalone mode
 * <App />
 * 
 * @example
 * // Module Federation mode
 * <App token="eyJhbGc..." baseURL="https://api.production.com" />
 */
function App({ token, baseURL }) {
  return (
    <AppProviders token={token} baseURL={baseURL}>
      <AppRouter />
    </AppProviders>
  );
}

export default App;