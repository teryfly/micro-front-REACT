/**
 * 主路由组件
 * 配置应用的路由结构
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { menuConfigService } from '../services/menuConfigService';
import AppRegistry from '../core/AppRegistry';
import MainLayout from '../layouts/MainLayout';
import SubAppContainer from '../components/SubAppContainer/SubAppContainer';
import ExternalLinkContainer from '../components/SubAppContainer/ExternalLinkContainer';
import MenuConfigPage from '../pages/MenuConfigPage';
import NotFoundPage from '../components/NotFoundPage';
import TestPage from '../components/TestPage';

/**
 * 应用路由组件
 */
export default function AppRouter() {
  const location = useLocation();
  const [defaultRoute, setDefaultRoute] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Load menu config and register apps
  useEffect(() => {
    loadMenuConfigAndRegisterApps();
  }, []);

  const loadMenuConfigAndRegisterApps = async () => {
    try {
      const data = await menuConfigService.getUserMenuConfig();
      const menuConfig = data.menuConfig;

      // Register all subapps to AppRegistry
      const subapps = menuConfig.items.filter(item => item.type === 'subapp');
      
      subapps.forEach(item => {
        const appConfig = {
          id: item.config.appId,
          name: item.config.containerName,
          displayName: item.label,
          entryUrl: item.config.entryUrl,
          route: item.config.route,
          enabled: true,
        };

        AppRegistry.registerApp(appConfig);
        console.log('[AppRouter] Registered app:', appConfig);
      });

      // Set default route
      const defaultApp = menuConfig.items.find(
        item => item.id === menuConfig.defaultAppId
      );
      
      if (defaultApp && defaultApp.type === 'subapp') {
        setDefaultRoute(`/app${defaultApp.config.route}`);
      } else {
        const firstSubApp = subapps[0];
        setDefaultRoute(firstSubApp ? `/app${firstSubApp.config.route}` : '/menu-config');
      }
    } catch (error) {
      console.error('[AppRouter] Failed to load menu config:', error);
      setDefaultRoute('/menu-config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AppRouter] Location changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location.pathname, location.search, location.hash]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        加载应用配置中...
      </div>
    );
  }

  return (
    <MainLayout>
      <Routes>
        {/* 根路径重定向到默认应用 */}
        <Route 
          path="/" 
          element={<Navigate to={defaultRoute} replace />} 
        />

        {/* 菜单配置页面 */}
        <Route 
          path="/menu-config" 
          element={<MenuConfigPage />} 
        />

        {/* 外部链接iframe容器 */}
        <Route 
          path="/external/:encodedUrl" 
          element={<ExternalLinkContainer />} 
        />

        {/* 测试路由 */}
        <Route 
          path="/test" 
          element={<TestPage />} 
        />

        {/* 子应用路由 */}
        <Route 
          path="/app/:appId/*" 
          element={<SubAppContainer />} 
        />

        {/* 404页面 */}
        <Route 
          path="*" 
          element={<NotFoundPage />} 
        />
      </Routes>
    </MainLayout>
  );
}