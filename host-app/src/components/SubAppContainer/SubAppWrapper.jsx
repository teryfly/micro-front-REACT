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

  // FIX: Log when wrapper mounts
  useEffect(() => {
    console.log('[SubAppWrapper] Mounted:', {
      appId: appConfig.id,
      isActive,
      subRoute,
    });
  }, [appConfig.id, isActive, subRoute]);

  // 注册路由同步监听器
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

  // 监听子应用路由变化消息
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

  // 应用挂载/卸载通知
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

  // 路由变化回调（子应用调用）
  const handleRouteChange = (routeState) => {
    if (!isActive) return;

    // FIX: Handle both string path and route state object
    let path = routeState;
    let search = '';
    let hash = '';

    if (typeof routeState === 'object' && routeState !== null) {
      path = routeState.pathname || '/';
      search = routeState.search || '';
      hash = routeState.hash || '';
    }

    // Construct full path
    const fullPath = `${path}${search}${hash}`;
    
    console.log('[SubAppWrapper] Route change from subapp:', {
      received: routeState,
      extractedPath: fullPath
    });

    UrlSyncManager.syncFromSubApp(appConfig.id, fullPath, navigate);
  };

  // 注入到子应用的props
  const injectedProps = {
    embedded: true,
    theme: themeVars,
    basePath: `/app${appConfig.route}`,
    currentRoute: subRoute,
    onRouteChange: handleRouteChange,
    eventBus: EventBus,
    postMessage: (type, payload) => {
      PostMessageBridge.sendToSubApp(appConfig.id, type, payload);
    },
    appId: appConfig.id,
    version: '1.0.0'
  };

  // FIX: Use ./EmbeddedApp for embedded mode
  const modulePath = './EmbeddedApp';

  console.log('[SubAppWrapper] Rendering with config:', {
    appId: appConfig.id,
    modulePath,
    isActive,
    injectedProps: {
      embedded: injectedProps.embedded,
      hasTheme: !!injectedProps.theme,
      hasEventBus: !!injectedProps.eventBus,
    }
  });

  return (
    <SubAppErrorBoundary appConfig={appConfig}>
      <Suspense fallback={<SubAppSkeleton appName={appConfig.displayName} />}>
        <DynamicRemoteLoader appConfig={appConfig} modulePath={modulePath}>
          {(Component, loading, error, retry) => {
            console.log('[SubAppWrapper] DynamicRemoteLoader render:', {
              appId: appConfig.id,
              hasComponent: !!Component,
              loading,
              hasError: !!error,
            });

            if (loading) {
              return <SubAppSkeleton appName={appConfig.displayName} />;
            }

            if (error) {
              console.error('[SubAppWrapper] Component load error:', error);
              return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>应用加载失败</h2>
                  <p>{error.message}</p>
                  <button onClick={retry}>重试</button>
                </div>
              );
            }

            if (!Component) {
              console.error('[SubAppWrapper] Component is null/undefined');
              return <div>组件未找到</div>;
            }

            console.log('[SubAppWrapper] Rendering component with props:', {
              appId: appConfig.id,
              componentName: Component.name || 'Anonymous',
              propsKeys: Object.keys(injectedProps),
            });

            return <Component {...injectedProps} />;
          }}
        </DynamicRemoteLoader>
      </Suspense>
    </SubAppErrorBoundary>
  );
}