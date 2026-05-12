import React from 'react';
import AppProviders from './AppProviders';
import AppRouter from './routes/AppRouter';

/**
 * Standalone Application Component
 * Full application with complete layout (Header + Sidebar + Content)
 * Used when running independently at http://localhost:7002
 *
 * @param {Object} props
 * @param {string} [props.token] - Authentication token (from URL params or localStorage)
 * @param {string} [props.baseURL] - API base URL override (from URL params)
 * 
 * @example
 * // Direct access scenario
 * http://localhost:7002/?token=abc123&apiBaseUrl=https://api.host.com
 */
function StandaloneApp({ token, baseURL }) {
  return (
    <AppProviders token={token} baseURL={baseURL} embedded={false}>
      <AppRouter />
    </AppProviders>
  );
}

export default StandaloneApp;