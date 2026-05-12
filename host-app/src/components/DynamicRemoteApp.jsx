/**
 * DynamicRemoteApp — lightweight opinionated wrapper over DynamicRemoteLoader.
 *
 * Use this component when you need to render a remote module directly without
 * the full SubAppWrapper context (e.g., a quick preview, a test page).
 * For production sub-app rendering use SubAppWrapper which provides theme,
 * eventBus, URL sync, and error boundary.
 *
 * Props:
 *   appId         {string}  unique id — used as AppRegistry key
 *   entryUrl      {string}  URL of remoteEntry.js
 *   containerName {string}  webpack container name
 *   modulePath    {string}  exposed path, default './EmbeddedApp'
 *   appProps      {object}  extra props forwarded to the remote component
 */
import React from 'react';
import AppRegistry from '../core/AppRegistry';
import { DynamicRemoteLoader } from '../core/DynamicRemoteLoader';

function DynamicRemoteApp({
  appId,
  entryUrl,
  containerName,
  modulePath = './EmbeddedApp',
  appProps = {},
}) {
  // Ensure the app is registered before DynamicRemoteLoader tries to load it
  if (!AppRegistry.has(appId)) {
    AppRegistry.registerApp({
      id: appId,
      name: containerName,
      displayName: appId,
      entryUrl,
    });
  }

  const appConfig = { id: appId, name: containerName, entryUrl };

  return (
    <DynamicRemoteLoader appConfig={appConfig} modulePath={modulePath}>
      {(Component, loading, error, retry) => {
        if (loading) {
          return (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p style={{ color: '#666', marginTop: 12 }}>正在加载 {appId}…</p>
            </div>
          );
        }

        if (error) {
          return (
            <div style={styles.error}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px' }}>子应用加载失败</h3>
              <p style={{ color: '#666', margin: '0 0 8px', fontSize: 13 }}>
                {error.message}
              </p>
              <p style={{ color: '#999', fontSize: 12, margin: '0 0 16px' }}>
                请确认子应用已启动：<code>{entryUrl}</code>
              </p>
              <button style={styles.retryBtn} onClick={retry}>
                重试
              </button>
            </div>
          );
        }

        if (!Component) return null;

        return <Component {...appProps} />;
      }}
    </DynamicRemoteLoader>
  );
}

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #1890ff',
    borderRadius: '50%',
    animation: 'mfe-spin 0.8s linear infinite',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    textAlign: 'center',
    padding: 32,
  },
  retryBtn: {
    padding: '8px 20px',
    background: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
};

// Inject spinner keyframes once
if (typeof document !== 'undefined' && !document.getElementById('mfe-spinner-style')) {
  const s = document.createElement('style');
  s.id = 'mfe-spinner-style';
  s.textContent = '@keyframes mfe-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}

export default DynamicRemoteApp;
