/**
 * 应用加载状态管理Hook
 * 提供统一的应用加载状态访问接口
 */

import { useState, useEffect, useCallback } from 'react';
import AppRegistry from './AppRegistry';

/**
 * 使用应用加载器Hook
 * @param {string} appId - 应用ID
 * @param {string} modulePath - 模块路径
 * @returns {Object} { component, loading, error, retry, status }
 */
export function useAppLoader(appId, modulePath = './EmbeddedApp') {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedComponent = await AppRegistry.loadAppComponent(appId, modulePath);
      setComponent(() => loadedComponent);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [appId, modulePath, retryTrigger]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setRetryTrigger(prev => prev + 1);
  }, []);

  const status = AppRegistry.getAppStatus(appId);

  return {
    component,
    loading,
    error,
    retry,
    status
  };
}

/**
 * 批量预加载应用Hook
 * @param {Array<Object>} apps - 应用配置数组
 * @returns {Object} { preloading, preloadError }
 */
export function usePreloadApps(apps) {
  const [preloading, setPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState(null);

  useEffect(() => {
    if (!apps || apps.length === 0) return;

    const preload = async () => {
      setPreloading(true);
      setPreloadError(null);

      try {
        // FIX: 预加载使用 ./EmbeddedApp 而不是 ./App
        const appsToPreload = apps.slice(0, 3);
        
        console.log('[usePreloadApps] 开始预加载应用:', appsToPreload.map(a => a.id));
        
        await Promise.allSettled(
          appsToPreload.map(app => 
            AppRegistry.loadAppComponent(app.id, './EmbeddedApp').catch(err => {
              console.warn(`[usePreloadApps] 预加载失败: ${app.id}`, err);
            })
          )
        );
        
        console.log('[usePreloadApps] 预加载完成');
      } catch (err) {
        setPreloadError(err);
      } finally {
        setPreloading(false);
      }
    };

    // 延迟预加载，避免阻塞首屏
    const timer = setTimeout(preload, 1000);
    return () => clearTimeout(timer);

  }, [apps]);

  return { preloading, preloadError };
}