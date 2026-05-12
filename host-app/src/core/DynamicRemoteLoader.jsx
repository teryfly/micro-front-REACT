/**
 * 动态Remote加载器
 * 封装远程组件的懒加载逻辑，提供加载状态和错误处理
 */

import React, { useState, useEffect, useCallback } from 'react';
import AppRegistry from './AppRegistry';

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

/**
 * 动态Remote加载器组件
 * @param {Object} props
 * @param {Object} props.appConfig - 应用配置
 * @param {string} props.modulePath - 模块路径（默认'./EmbeddedApp'）
 * @param {Function} props.children - 渲染函数 (component, loading, error, retry)
 */
export function DynamicRemoteLoader({ 
  appConfig, 
  modulePath = './EmbeddedApp',
  children 
}) {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // FIX: Log initial state
  useEffect(() => {
    console.log('[DynamicRemoteLoader] Initialized:', {
      appId: appConfig.id,
      modulePath,
      entryUrl: appConfig.entryUrl,
      containerName: appConfig.name,
    });
  }, [appConfig.id, modulePath]);

  // 加载组件
  const loadComponent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[DynamicRemoteLoader] Loading component:', {
        appId: appConfig.id,
        modulePath,
        attempt: retryCount + 1,
      });

      const loadedComponent = await AppRegistry.loadAppComponent(
        appConfig.id,
        modulePath
      );

      console.log('[DynamicRemoteLoader] Component loaded:', {
        appId: appConfig.id,
        componentType: typeof loadedComponent,
        componentName: loadedComponent?.name || 'Anonymous',
      });

      setComponent(() => loadedComponent);
      setLoading(false);

    } catch (err) {
      console.error('[DynamicRemoteLoader] 加载失败:', {
        appId: appConfig.id,
        modulePath,
        error: err.message,
        stack: err.stack,
      });
      
      setError(err);
      setLoading(false);

      // 自动重试
      if (retryCount < MAX_RETRY_COUNT) {
        console.log(`[DynamicRemoteLoader] ${RETRY_DELAY}ms后重试 (${retryCount + 1}/${MAX_RETRY_COUNT})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, RETRY_DELAY);
      } else {
        console.error(`[DynamicRemoteLoader] 已达到最大重试次数 (${MAX_RETRY_COUNT})`);
      }
    }
  }, [appConfig.id, appConfig.name, modulePath, retryCount]);

  // 初始加载
  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  // 手动重试
  const retry = useCallback(() => {
    console.log('[DynamicRemoteLoader] Manual retry triggered');
    setRetryCount(0);
    loadComponent();
  }, [loadComponent]);

  // FIX: Log render state
  useEffect(() => {
    console.log('[DynamicRemoteLoader] Render state:', {
      appId: appConfig.id,
      hasComponent: !!component,
      loading,
      hasError: !!error,
    });
  }, [component, loading, error, appConfig.id]);

  return children(component, loading, error, retry);
}

/**
 * 高阶组件：包装远程组件
 * @param {Object} appConfig - 应用配置
 * @param {string} modulePath - 模块路径
 * @returns {React.Component}
 */
export function withDynamicRemote(appConfig, modulePath = './EmbeddedApp') {
  return function WrappedComponent(props) {
    return (
      <DynamicRemoteLoader appConfig={appConfig} modulePath={modulePath}>
        {(Component, loading, error, retry) => {
          if (loading) {
            return <div>Loading {appConfig.displayName}...</div>;
          }

          if (error) {
            return (
              <div>
                <p>加载失败: {error.message}</p>
                <button onClick={retry}>重试</button>
              </div>
            );
          }

          if (!Component) {
            return <div>组件未找到</div>;
          }

          return <Component {...props} />;
        }}
      </DynamicRemoteLoader>
    );
  };
}