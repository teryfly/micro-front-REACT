/**
 * 配置Context
 * 提供全局配置访问能力
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loadConfig, checkConfigUpdate } from './ConfigLoader';

export const ConfigContext = createContext(null);

/**
 * 配置Provider组件
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载配置
  const loadAppConfig = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const loadedConfig = await loadConfig(options);
      setConfig(loadedConfig);
    } catch (err) {
      setError(err);
      console.error('[ConfigProvider] 配置加载失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载配置
  useEffect(() => {
    loadAppConfig();
  }, [loadAppConfig]);

  // 生产环境定时检查配置更新
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !config) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const hasUpdate = await checkConfigUpdate();
        if (hasUpdate) {
          console.log('[ConfigProvider] 检测到配置更新');
          // 可以在这里显示提示用户刷新的UI
          if (window.confirm('检测到新版本配置，是否刷新页面？')) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('[ConfigProvider] 检查更新失败:', error);
      }
    }, 5 * 60 * 1000); // 每5分钟检查一次

    return () => clearInterval(interval);
  }, [config]);

  // 重新加载配置
  const reloadConfig = useCallback(() => {
    loadAppConfig({ useCache: false });
  }, [loadAppConfig]);

  const value = {
    config,
    loading,
    error,
    reloadConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}