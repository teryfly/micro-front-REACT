import React, { useState, useEffect, useRef } from 'react';
import { loadRemoteModule } from '../services/ModuleFederationRuntime';
import { AppRegistry } from '../services/AppRegistry';

/**
 * Renders a remote sub-app loaded at runtime via Module Federation.
 *
 * Props:
 *   appId         {string}  unique identifier (used as registry key)
 *   entryUrl      {string}  URL of remoteEntry.js
 *   containerName {string}  webpack container name
 *   modulePath    {string}  exposed path, default './EmbeddedApp'
 *   appProps      {object}  extra props forwarded to the remote component
 */
function DynamicRemoteApp({
  appId,
  entryUrl,
  containerName,
  modulePath = './EmbeddedApp',
  appProps = {},
}) {
  const [Component, setComponent] = useState(() => AppRegistry.get(appId) || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!AppRegistry.has(appId));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (AppRegistry.has(appId)) {
      setComponent(() => AppRegistry.get(appId));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    loadRemoteModule({ entryUrl, containerName, modulePath })
      .then((mod) => {
        if (!mountedRef.current) return;
        const Comp = mod.default || mod;
        AppRegistry.register(appId, Comp);
        setComponent(() => Comp);
        setLoading(false);
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        setError(err.message);
        setLoading(false);
      });
  }, [appId, entryUrl, containerName, modulePath]);

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
        <p style={{ color: '#666', margin: '0 0 16px', fontSize: 13 }}>{error}</p>
        <p style={{ color: '#999', fontSize: 12 }}>
          请确认子应用已启动：<code>{entryUrl}</code>
        </p>
        <button
          style={styles.retryBtn}
          onClick={() => {
            AppRegistry.invalidate(appId);
            setComponent(null);
            setLoading(true);
            setError(null);
          }}
        >
          重试
        </button>
      </div>
    );
  }

  if (!Component) return null;

  return <Component {...appProps} />;
}

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    color: '#666',
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
    marginTop: 16,
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
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = '@keyframes mfe-spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(styleEl);
}

export default DynamicRemoteApp;
