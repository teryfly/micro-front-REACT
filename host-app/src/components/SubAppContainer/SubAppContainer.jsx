/**
 * 子应用容器组件
 * 管理多个子应用实例的渲染和显示/隐藏
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useConfig } from '../../config/useConfig';
import SubAppWrapper from './SubAppWrapper';
import UrlSyncManager from '../../router/UrlSyncManager';
import styles from './SubAppContainer.module.css';

export default function SubAppContainer() {
  // 注意：这里的 appId 实际上是路由参数，可能是 ID 也可能是 route 路径段
  const { appId: routeParam } = useParams();
  const location = useLocation();
  const { getAppConfig, getAppByRoute } = useConfig();
  
  // 已加载的应用实例集合
  const [loadedApps, setLoadedApps] = useState(new Set());

  // FIX: Log route params
  useEffect(() => {
    console.log('[SubAppContainer] Route params:', {
      routeParam,
      pathname: location.pathname,
    });
  }, [routeParam, location.pathname]);

  // FIX: 解析当前应用配置
  // 优先尝试通过路由匹配，然后尝试作为ID匹配
  const currentAppConfig = useMemo(() => {
    // 尝试1: 通过完整路径匹配
    // location.pathname 是 /app/governance
    let config = getAppByRoute(location.pathname);
    
    // 尝试2: 如果路径匹配失败，尝试用参数作为ID查找
    if (!config && routeParam) {
      config = getAppConfig(routeParam);
    }

    console.log('[SubAppContainer] Resolved app config:', {
      routeParam,
      path: location.pathname,
      found: !!config,
      appId: config?.id,
      appName: config?.displayName
    });
    
    return config;
  }, [routeParam, location.pathname, getAppConfig, getAppByRoute]);

  // 解析子路由
  const subRoute = useMemo(() => {
    if (!currentAppConfig) return '/';
    
    // 从完整路径中移除应用前缀
    // 例如 /app/governance/doctype -> /doctype
    const appPrefix = `/app${currentAppConfig.route}`;
    let route = location.pathname.replace(appPrefix, '');
    
    // 确保以 / 开头
    if (!route.startsWith('/')) {
      route = '/' + route;
    }
    
    return route;
  }, [location.pathname, currentAppConfig]);

  // 添加应用到已加载集合
  useEffect(() => {
    if (currentAppConfig) {
      console.log('[SubAppContainer] Adding app to loaded set:', currentAppConfig.id);
      setLoadedApps(prev => new Set([...prev, currentAppConfig.id]));
      UrlSyncManager.setCurrentApp(currentAppConfig.id);
    }
  }, [currentAppConfig]);

  if (!currentAppConfig) {
    console.error('[SubAppContainer] App config not found for route:', routeParam);
    return (
      <div className={styles.error}>
        <h2>应用未找到</h2>
        <p>无法解析路由: {routeParam}</p>
        <p>当前路径: {location.pathname}</p>
      </div>
    );
  }

  // 当前激活的应用ID
  const activeAppId = currentAppConfig.id;

  return (
    <div className={styles.container}>
      {Array.from(loadedApps).map(loadedAppId => {
        const appConfig = getAppConfig(loadedAppId);
        if (!appConfig) {
          return null;
        }

        const isActive = loadedAppId === activeAppId;

        return (
          <div
            key={loadedAppId}
            className={styles.appWrapper}
            style={{ 
              display: isActive ? 'block' : 'none',
              zIndex: isActive ? 1 : 0 
            }}
            data-app-id={loadedAppId}
          >
            <SubAppWrapper
              appConfig={appConfig}
              isActive={isActive}
              subRoute={isActive ? subRoute : '/'}
            />
          </div>
        );
      })}
    </div>
  );
}