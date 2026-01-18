/**
 * 应用入口组件
 * 集成所有Provider和路由
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from './config/ConfigContext';
import { ThemeProvider } from './theme/ThemeContext';
// FIX: Import NotificationProvider
import { NotificationProvider } from './context/NotificationContext'; 
import AppRouter from './router/AppRouter';
import AppRegistry from './core/AppRegistry';
import { useConfig } from './config/useConfig';
import { usePreloadApps } from './core/useAppLoader';
import './theme/globalStyles.css';
/**
 * 应用初始化组件
 */
function AppInitializer() {
  const { config, apps, loading, error } = useConfig();
  // Log initialization state
  React.useEffect(() => {
    console.log('[AppInitializer] State:', {
      hasConfig: !!config,
      appsCount: apps?.length || 0,
      loading,
      hasError: !!error,
    });
  }, [config, apps, loading, error]);
  // 注册所有应用
  React.useEffect(() => {
    if (apps && apps.length > 0) {
      console.log('[AppInitializer] Registering apps:', apps.map(a => a.id));
      AppRegistry.registerApps(apps);
    }
  }, [apps]);
  // 预加载应用
  usePreloadApps(apps);
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        加载配置中...
      </div>
    );
  }
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '40px'
      }}>
        <h2 style={{ color: '#ff4d4f' }}>配置加载失败</h2>
        <p>{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '16px',
            padding: '10px 24px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#1890ff',
            color: '#ffffff'
          }}
        >
          重新加载
        </button>
      </div>
    );
  }
  console.log('[AppInitializer] Rendering AppRouter');
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
/**
 * 根组件
 */
export default function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        {/* FIX: Wrap with NotificationProvider */}
        <NotificationProvider>
          <AppInitializer />
        </NotificationProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}