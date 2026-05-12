/**
 * 配置访问Hook
 * 提供便捷的配置访问API
 */
import { useContext, useMemo, useCallback } from 'react';
import { ConfigContext } from './ConfigContext';

/**
 * 使用配置Hook
 * @returns {Object} 配置对象和工具方法
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  
  const { config, loading, error, reloadConfig } = context;
  
  // 获取所有启用的应用
  const apps = useMemo(() => {
    if (!config) return [];
    return config.apps || [];
  }, [config]);
  
  // 获取单个应用配置
  const getAppConfig = useCallback((appId) => {
    if (!config) return null;
    return config.apps.find(app => app.id === appId);
  }, [config]);

  // FIX: 新增：通过路由路径获取应用配置
  const getAppByRoute = useCallback((routePath) => {
    if (!config) return null;
    // 移除开头的 /app 前缀如果存在
    const cleanPath = routePath.replace(/^\/app/, '');
    
    // 查找匹配路由的应用
    // 例如：路径 /governance/doctype 应该匹配 route: "/governance"
    return config.apps.find(app => {
      // 精确匹配
      if (app.route === cleanPath) return true;
      // 前缀匹配 (确保是完整路径段)
      return cleanPath.startsWith(`${app.route}/`);
    });
  }, [config]);

  // 获取默认激活的应用
  const defaultApp = useMemo(() => {
    if (!config) return null;
    return config.apps.find(app => app.defaultActive) || config.apps[0];
  }, [config]);
  
  // 获取菜单分组
  const menuGroups = useMemo(() => {
    if (!config) return [];
    return (config.menuGroups || []).sort((a, b) => a.order - b.order);
  }, [config]);
  
  // 按分组组织应用
  const appsByGroup = useMemo(() => {
    if (!config) return {};
    const grouped = {};
    config.apps.forEach(app => {
      const groupName = app.group || '其他';
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(app);
    });
    return grouped;
  }, [config]);
  
  return {
    config,
    loading,
    error,
    apps,
    getAppConfig,
    getAppByRoute, // Export new helper
    defaultApp,
    menuGroups,
    appsByGroup,
    reloadConfig
  };
}