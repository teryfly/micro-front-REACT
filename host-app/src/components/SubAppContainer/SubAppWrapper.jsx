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
import { useAuth, getAuthorizationHeader, getAccessToken } from '../../auth';

export default function SubAppWrapper({ appConfig, isActive, subRoute }) {
  const navigate = useNavigate();
  const { theme, themeVars } = useTheme();
  const { user, tokenType, expiresAt, scopes, handleUnauthorized } = useAuth();

  useEffect(() => {
    console.log('[SubAppWrapper] Mounted:', {
      appId: appConfig.id,
      route: appConfig.config.route,
      isActive,
      subRoute,
    });
  }, [appConfig.id, appConfig.config.route, isActive, subRoute]);

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
          // 修复：传入用户配置的路由(config.route)用于构建URL，而不是内部ID
          UrlSyncManager.syncFromSubApp(
            appConfig.id,
            appConfig.config.route, 
            message.payload.path,
            navigate
          );
        }
      }
    );

    return unsubscribe;
  }, [appConfig.id, appConfig.config.route, isActive, navigate]);

  // 登录态变化时同步给子应用（子应用可直接复用主应用令牌）
  useEffect(() => {
    if (!isActive) return;

    PostMessageBridge.sendToSubApp(appConfig.id, MessageTypes.AUTH_STATE_UPDATE, {
      accessToken: getAccessToken(),
      authorization: getAuthorizationHeader(),
      tokenType,
      expiresAt,
      scopes,
      user,
    });
  }, [appConfig.id, isActive, tokenType, expiresAt, scopes, user]);

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

  // Route change callback (passed as prop to subapp)
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
      extractedPath: fullPath,
      targetPrefix: appConfig.config.route
    });

    // 修复：传入用户配置的路由(config.route)用于构建URL
    UrlSyncManager.syncFromSubApp(
      appConfig.id, 
      appConfig.config.route, 
      fullPath, 
      navigate
    );
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
    // 传递业务ID给子应用，而不是系统ID
    appId: appConfig.config.appId, 
    // 同时传递系统ID，以备不时之需
    instanceId: appConfig.id,
    version: '1.0.0',
    // 单点登录信息：子应用直接复用主应用令牌，无需重复登录
    auth: {
      user,
      scopes,
      expiresAt,
      tokenType,
      /** 实时获取令牌，避免闭包拿到过期值 */
      getAccessToken,
      /** 直接用于请求头：Authorization: Bearer xxx */
      getAuthorization: getAuthorizationHeader,
      /** 子应用接口 401 时回调主应用重新走单点登录 */
      onUnauthorized: handleUnauthorized,
    }
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