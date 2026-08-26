/**
 * 应用入口组件
 * 集成所有Provider和路由
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from './config/ConfigContext';
import { ThemeProvider } from './theme/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, AuthGuard } from './auth';
import AppRouter from './router/AppRouter';
import { initializeMenuConfig } from './utils/menuConfigInit';
import './theme/globalStyles.css';

/**
 * 应用初始化组件
 */
function AppInitializer() {
  const [initialized, setInitialized] = React.useState(false);

  // Initialize menu configuration on mount
  React.useEffect(() => {
    initializeMenuConfig().then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        初始化应用配置中...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

/**
 * 根组件
 *
 * 鉴权顺序：AuthProvider 校验登录态 -> AuthGuard 拦截未登录/无权限
 * -> 通过后才初始化菜单配置与路由，保证所有业务请求都带上令牌。
 */
export default function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <AuthGuard>
              <AppInitializer />
            </AuthGuard>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}