/**
 * 主路由组件
 * 配置应用的路由结构
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useConfig } from '../config/useConfig';
import MainLayout from '../layouts/MainLayout';
import SubAppContainer from '../components/SubAppContainer/SubAppContainer';
import NotFoundPage from '../components/NotFoundPage';
import TestPage from '../components/TestPage';

/**
 * 应用路由组件
 */
export default function AppRouter() {
  const { defaultApp, loading, apps } = useConfig();
  const location = useLocation();

  // FIX: Log route changes
  useEffect(() => {
    console.log('[AppRouter] Location changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location.pathname, location.search, location.hash]);

  // FIX: Log router state
  useEffect(() => {
    console.log('[AppRouter] Router state:', {
      loading,
      hasDefaultApp: !!defaultApp,
      defaultAppId: defaultApp?.id,
      defaultAppRoute: defaultApp?.route,
      totalApps: apps?.length || 0,
    });
  }, [loading, defaultApp, apps]);

  if (loading) {
    console.log('[AppRouter] Still loading config...');
    return <div>加载配置中...</div>;
  }

  if (!defaultApp) {
    console.error('[AppRouter] No default app found!');
    return <div>未找到可用应用</div>;
  }

  const defaultPath = `/app${defaultApp.route}`;
  console.log('[AppRouter] Rendering routes with default path:', defaultPath);

  // FIX: Wrap all routes in MainLayout to ensure TopMenuBar has router context
  return (
    <MainLayout>
      <Routes>
        {/* 根路径重定向到默认应用 */}
        <Route 
          path="/" 
          element={<Navigate to={defaultPath} replace />} 
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