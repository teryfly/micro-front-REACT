/**
 * 子应用容器组件
 * 从菜单配置动态加载子应用
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { menuConfigService } from '../../services/menuConfigService';
import SubAppWrapper from './SubAppWrapper';
import UrlSyncManager from '../../router/UrlSyncManager';
import styles from './SubAppContainer.module.css';

export default function SubAppContainer() {
  const { appId: routeParam } = useParams();
  const location = useLocation();
  const [menuConfig, setMenuConfig] = useState(null);
  const [loadedApps, setLoadedApps] = useState(new Set());

  // Load menu configuration
  useEffect(() => {
    loadMenuConfig();
  }, []);

  const loadMenuConfig = async () => {
    try {
      const data = await menuConfigService.getUserMenuConfig();
      setMenuConfig(data.menuConfig);
    } catch (error) {
      console.error('[SubAppContainer] Failed to load menu config:', error);
    }
  };

  // Find current app config from menu
  const currentAppConfig = useMemo(() => {
    if (!menuConfig) return null;

    // Find by route match
    const app = menuConfig.items.find(item => {
      if (item.type !== 'subapp') return false;
      const appPrefix = `/app${item.config.route}`;
      return location.pathname === appPrefix || 
             location.pathname.startsWith(`${appPrefix}/`);
    });

    console.log('[SubAppContainer] Resolved app:', {
      routeParam,
      pathname: location.pathname,
      found: !!app,
      appId: app?.id,
    });

    return app;
  }, [menuConfig, location.pathname, routeParam]);

  // Parse sub-route
  const subRoute = useMemo(() => {
    if (!currentAppConfig) return '/';
    
    const appPrefix = `/app${currentAppConfig.config.route}`;
    let route = location.pathname.replace(appPrefix, '');
    
    if (!route.startsWith('/')) {
      route = '/' + route;
    }
    
    return route;
  }, [location.pathname, currentAppConfig]);

  // Add app to loaded set
  useEffect(() => {
    if (currentAppConfig) {
      console.log('[SubAppContainer] Adding app to loaded set:', currentAppConfig.id);
      setLoadedApps(prev => new Set([...prev, currentAppConfig.id]));
      UrlSyncManager.setCurrentApp(currentAppConfig.id);
    }
  }, [currentAppConfig]);

  if (!menuConfig) {
    return <div className={styles.loading}>加载配置中...</div>;
  }

  if (!currentAppConfig) {
    return (
      <div className={styles.error}>
        <h2>应用未找到</h2>
        <p>路由: {routeParam}</p>
        <p>路径: {location.pathname}</p>
      </div>
    );
  }

  const activeAppId = currentAppConfig.id;

  return (
    <div className={styles.container}>
      {Array.from(loadedApps).map(loadedAppId => {
        const appConfig = menuConfig.items.find(item => item.id === loadedAppId);
        if (!appConfig || appConfig.type !== 'subapp') {
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