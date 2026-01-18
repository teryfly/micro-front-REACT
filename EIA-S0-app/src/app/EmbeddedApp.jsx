import React from 'react';
import PropTypes from 'prop-types';
import AppProviders from './AppProviders';
import AppRouter from './routes/AppRouter';
import DebugPanel from './DebugPanel';

/**
 * Embedded Application Component
 * Simplified application for embedding in host app (no Header)
 * Receives configuration from host app via props
 *
 * @param {Object} props - All props from host app
 */
function EmbeddedApp(props) {
  // Log all received props immediately for debugging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔵 [EmbeddedApp] Component mounted with props:', {
        embedded: props.embedded,
        hasTheme: !!props.theme,
        hasEventBus: !!props.eventBus,
        basePath: props.basePath,
        appId: props.appId,
        allPropKeys: Object.keys(props),
      });
    }
  }, []);

  const {
    embedded = true,
    theme,
    basePath = '',
    onRouteChange,
    eventBus,
    token,
    userInfo,
    apiBaseUrl,
    appId = 'eia-s0-app',
    version = '1.0.0',
  } = props;

  // Validate and normalize props
  const normalizedProps = React.useMemo(() => {
    const normalized = {
      embedded,
      theme: theme || null,
      basePath,
      onRouteChange: onRouteChange || (() => {}),
      eventBus: eventBus || null,
      token: userInfo?.token || token || null,
      userInfo: userInfo || null,
      apiBaseUrl: apiBaseUrl || null,
      appId,
      version,
    };

    // Enhanced validation logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 [EmbeddedApp] Props Validation:', {
        '✅ embedded': typeof normalized.embedded === 'boolean' ? `${normalized.embedded}` : '❌ INVALID',
        '✅ theme': normalized.theme ? `Object(${Object.keys(normalized.theme).length} vars)` : '⚠️ undefined',
        '✅ basePath': normalized.basePath,
        '✅ onRouteChange': typeof normalized.onRouteChange === 'function' ? '✅ function' : '❌ INVALID',
        '✅ eventBus': normalized.eventBus ? 'Object' : '⚠️ undefined',
        '⚠️ token': normalized.token || 'undefined (using localStorage fallback)',
        '⚠️ userInfo': normalized.userInfo || 'undefined',
        '✅ apiBaseUrl': normalized.apiBaseUrl || '⚠️ undefined (using env config)',
        '✅ appId': normalized.appId,
        '✅ version': normalized.version,
      });

      // Validate embedded prop explicitly
      if (normalized.embedded !== true) {
        console.error('❌ [EmbeddedApp] CRITICAL: embedded prop is not true!', {
          received: normalized.embedded,
          type: typeof normalized.embedded,
        });
      }
    }

    return normalized;
  }, [embedded, theme, basePath, onRouteChange, eventBus, token, userInfo, apiBaseUrl, appId, version]);

  return (
    <AppProviders {...normalizedProps}>
      <AppRouter 
        basePath={normalizedProps.basePath}
        onRouteChange={normalizedProps.onRouteChange}
      />
      
      {/* FIX: Pass received props to DebugPanel */}
      <DebugPanel receivedProps={props} />
    </AppProviders>
  );
}

EmbeddedApp.propTypes = {
  // ========== Mode Control ==========
  embedded: PropTypes.bool,

  // ========== Theme Configuration ==========
  theme: PropTypes.objectOf(PropTypes.string),

  // ========== Router Configuration ==========
  basePath: PropTypes.string,
  onRouteChange: PropTypes.func,

  // ========== Authentication Configuration ==========
  token: PropTypes.string,
  userInfo: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    permissions: PropTypes.arrayOf(PropTypes.string),
    token: PropTypes.string,
  }),

  // ========== API Configuration ==========
  apiBaseUrl: PropTypes.string,

  // ========== Communication Configuration ==========
  eventBus: PropTypes.shape({
    on: PropTypes.func,
    emit: PropTypes.func,
    off: PropTypes.func,
    once: PropTypes.func,
  }),

  // ========== Metadata ==========
  appId: PropTypes.string,
  version: PropTypes.string,
};

EmbeddedApp.defaultProps = {
  embedded: true,
  basePath: '',
  theme: null,
  onRouteChange: () => {},
  eventBus: null,
  token: null,
  userInfo: null,
  apiBaseUrl: null,
  appId: 'eia-s0-app',
  version: '1.0.0',
};

export default EmbeddedApp;