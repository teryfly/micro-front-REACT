/**
 * 子应用包装器组件
 * 处理props注入和生命周期管理
 */

import React, { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicRemoteLoader } from '../../core/DynamicRemoteLoader';
import { useTheme } from '../../theme/ThemeContext';
import SubAppErrorBoundary from './SubAppErrorBoundary';
import SubAppSkeleton from './SubAppSkeleton';
import UrlSyncManager from '../../router/UrlSyncManager';
import EventBus from '../../communication/EventBus';
import PostMessageBridge from '../../communication/PostMessageBridge';
import { MessageTypes } from '../../communication/messageProtocol';

export default function SubAppWrapper({ appConfig, isActive, subRoute }) {
  const navigate = useNavigate();
  const { theme, themeVars } = useTheme();

  useEffect(() => {
    console.log('[SubAppWrapper] Mounted:', {
      appId: appConfig.id,
      isActive,
      subRoute,
    });
  }, [appConfig.id, isActive, subRoute]);

  // Register route sync listener
  useEffect(() => {
    if (isActive) {
      const listener = (newRoute) => {
        console.log(`[SubAppWrapper] 路由同步到子应用 ${appConfig.id}:`, newRoute);
      };
      
      UrlSyncManager.registerListener(appConfig.id, listener);
      
      return () => {
        UrlSyncManager.unregisterListener(appConfig.id);
      };
    }
  }, [appConfig.id, isActive]);

  // Listen for subapp route changes
  useEffect(() => {
    const unsubscribe = PostMessageBridge.listen(
      MessageTypes.ROUTE_CHANGE,
      (message) => {
        if (message.source === appConfig.id && isActive) {
          UrlSyncManager.syncFromSubApp(
            appConfig.id,
            message.payload.path,
            navigate
          );
        }
      }
    );

    return unsubscribe;
  }, [appConfig.id, isActive, navigate]);

  // App mount/unmount notification
  useEffect(() => {
    if (isActive) {
      EventBus.emit('app:mounted', { appId: appConfig.id });
      PostMessageBridge.sendToSubApp(
        appConfig.id,
        MessageTypes.APP_MOUNTED,
        { appId: appConfig.id }
      );
    }

    return () => {
      EventBus.emit('app:unmounted', { appId: appConfig.id });
    };
  }, [appConfig.id, isActive]);

  // Route change callback
  const handleRouteChange = (routeState) => {
    if (!isActive) return;

    let path = routeState;
    let search = '';
    let hash = '';

    if (typeof routeState === 'object' && routeState !== null) {
      path = routeState.pathname || '/';
      search = routeState.search || '';
      hash = routeState.hash || '';
    }

    const fullPath = `${path}${search}${hash}`;
    
    console.log('[SubAppWrapper] Route change from subapp:', {
      received: routeState,
      extractedPath: fullPath
    });

    UrlSyncManager.syncFromSubApp(appConfig.id, fullPath, navigate);
  };

  // Injected props for subapp
  const injectedProps = {
    embedded: true,
    theme: themeVars,
    basePath: `/app${appConfig.config.route}`,
    currentRoute: subRoute,
    onRouteChange: handleRouteChange,
    eventBus: EventBus,
    postMessage: (type, payload) => {
      PostMessageBridge.sendToSubApp(appConfig.id, type, payload);
    },
    appId: appConfig.id,
    version: '1.0.0'
  };

  const modulePath = './EmbeddedApp';

  // Convert menu config format to old appConfig format
  const legacyAppConfig = {
    id: appConfig.id,
    name: appConfig.config.containerName,
    displayName: appConfig.label,
    entryUrl: appConfig.config.entryUrl,
    route: appConfig.config.route,
  };

  return (
    <SubAppErrorBoundary appConfig={legacyAppConfig}>
      <Suspense fallback={<SubAppSkeleton appName={appConfig.label} />}>
        <DynamicRemoteLoader appConfig={legacyAppConfig} modulePath={modulePath}>
          {(Component, loading, error, retry) => {
            if (loading) {
              return <SubAppSkeleton appName={appConfig.label} />;
            }

            if (error) {
              return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>应用加载失败</h2>
                  <p>{error.message}</p>
                  <button onClick={retry}>重试</button>
                </div>
              );
            }

            if (!Component) {
              return <div>组件未找到</div>;
            }

            return <Component {...injectedProps} />;
          }}
        </DynamicRemoteLoader>
      </Suspense>
    </SubAppErrorBoundary>
  );
}