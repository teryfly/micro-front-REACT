import React from 'react';
import AppProviders from './app/AppProviders';
import AppRouter from './app/routes/AppRouter';

/**
 * Main application component
 * Can run standalone or embedded via Module Federation.
 *
 * @param {Object} props
 * @param {string} [props.token] - Authentication token (from host app)
 * @param {string} [props.baseURL] - API base URL override (from host app)
 */
function App({ token, baseURL }) {
  return (
    <AppProviders token={token} baseURL={baseURL}>
      <AppRouter />
    </AppProviders>
  );
}

export default App;