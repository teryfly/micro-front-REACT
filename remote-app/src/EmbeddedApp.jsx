/**
 * Embedded Application Component for remote-app
 * Simplified application for embedding in host app (no Header)
 */

import React, { useEffect } from 'react';
import App from './App';

export default function EmbeddedApp(props) {
  useEffect(() => {
    console.log('[remote-app EmbeddedApp] Mounted with props:', {
      embedded: props.embedded,
      hasEventBus: !!props.eventBus,
      basePath: props.basePath,
    });
  }, []);

  const {
    embedded = true,
    theme,
    basePath = '',
    onRouteChange,
    eventBus,
    appId = 'remote-app-1',
  } = props;

  // Apply theme if provided
  useEffect(() => {
    if (theme && typeof theme === 'object') {
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [theme]);

  // Send ready event
  useEffect(() => {
    if (embedded && eventBus) {
      eventBus.emit('subapp:ready', {
        appId,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }
  }, [embedded, eventBus, appId]);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: 'var(--color-bg, #ffffff)',
      minHeight: '100%',
    }}>
      <App embedded={embedded} />
    </div>
  );
}