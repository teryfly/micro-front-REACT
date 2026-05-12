import React, { useMemo } from 'react';
import { detectRunMode, RUN_MODES } from './shared/utils/modeDetector';

/**
 * Main Application Entry Point
 * Mode dispatcher - renders different root components based on running mode
 *
 * @param {Object} props - All props from host app (Module Federation)
 * @param {boolean} [props.embedded] - Embedded mode flag
 * @param {Object} [props.theme] - Theme object from host app
 * @param {string} [props.basePath] - Router base path
 * @param {Function} [props.onRouteChange] - Route change callback
 * @param {Object} [props.eventBus] - Global event bus
 * @param {Object} [props.userInfo] - User information
 * @param {string} [props.token] - Authentication token
 * @param {string} [props.apiBaseUrl] - API base URL
 * 
 * @example
 * // Standalone mode (direct access)
 * <App />
 * 
 * // Embedded mode (loaded by host app)
 * <App 
 *   embedded={true}
 *   theme={hostTheme}
 *   basePath="/app/governance"
 *   eventBus={eventBus}
 * />
 */
function App(props) {
  // Detect running mode
  const { mode, source } = useMemo(() => detectRunMode(props), [props.embedded]);

  // Log mode detection result (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 [App Entry]', {
      mode,
      source,
      receivedProps: Object.keys(props),
    });
  }

  // Lazy load mode-specific components
  const StandaloneApp = React.lazy(() => import('./app/StandaloneApp'));
  const EmbeddedApp = React.lazy(() => import('./app/EmbeddedApp'));

  // Render based on mode
  return (
    <React.Suspense fallback={<div>Loading application...</div>}>
      {mode === RUN_MODES.EMBEDDED ? (
        <EmbeddedApp {...props} />
      ) : (
        <StandaloneApp {...props} />
      )}
    </React.Suspense>
  );
}

export default App;