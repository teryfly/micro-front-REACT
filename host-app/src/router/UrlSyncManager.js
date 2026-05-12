/**
 * URL同步管理器
 * 实现主应用与子应用路由的双向同步
 */

import SubAppRouteManager from './SubAppRouteManager';

class UrlSyncManager {
  constructor() {
    this.listeners = new Map();
    this.currentAppId = null;
  }

  /**
   * 解析主应用URL，提取appId和子路由
   * @param {string} pathname - 当前路径
   * @returns {Object} { appId, subRoute }
   */
  parseUrl(pathname) {
    // URL格式: /app/:appId/subRoute
    const match = pathname.match(/^\/app\/([^/]+)(\/.*)?$/);
    
    if (!match) {
      return { appId: null, subRoute: '/' };
    }

    return {
      appId: match[1],
      subRoute: match[2] || '/'
    };
  }

  /**
   * 构建主应用URL
   * @param {string} routePrefix - 应用路由前缀 (例如 "/governance" 或 "governance")
   * @param {string} subRoute - 子路由
   * @returns {string}
   */
  buildUrl(routePrefix, subRoute) {
    // 确保 routePrefix 不包含开头的 /app (如果传入了)
    let cleanPrefix = routePrefix.replace(/^\/app/, '');
    
    // 确保以 / 开头
    if (!cleanPrefix.startsWith('/')) {
      cleanPrefix = '/' + cleanPrefix;
    }

    const cleanSubRoute = subRoute.startsWith('/') ? subRoute : `/${subRoute}`;
    
    // 最终格式: /app/governance/sub/path
    return `/app${cleanPrefix}${cleanSubRoute}`;
  }

  /**
   * 同步URL到子应用
   * @param {string} appId - 应用ID (系统注册ID)
   * @param {string} subRoute - 子路由
   */
  syncToSubApp(appId, subRoute) {
    const listener = this.listeners.get(appId);
    if (listener) {
      console.log(`[UrlSync] 通知子应用路由变化: ${appId} -> ${subRoute}`);
      listener(subRoute);
    }
  }

  /**
   * 从子应用同步URL到主应用
   * @param {string} appId - 应用ID (系统注册ID，用于状态存储)
   * @param {string} routePrefix - 应用路由前缀 (用户配置的路由，用于URL构建)
   * @param {string} subRoute - 子路由
   * @param {Function} navigate - React Router navigate函数
   */
  syncFromSubApp(appId, routePrefix, subRoute, navigate) {
    const newUrl = this.buildUrl(routePrefix, subRoute);
    
    // 避免重复跳转
    if (window.location.pathname === newUrl) {
      return;
    }

    console.log(`[UrlSync] 子应用路由变化，更新主应用URL: ${newUrl}`);
    
    // 使用replace避免触发重新加载
    navigate(newUrl, { replace: true });
    
    // 保存路由状态 (使用唯一ID作为key)
    SubAppRouteManager.saveRouteState(appId, {
      pathname: subRoute,
      search: '',
      hash: ''
    });
  }

  /**
   * 注册子应用路由监听器
   * @param {string} appId - 应用ID
   * @param {Function} listener - 路由变化回调
   */
  registerListener(appId, listener) {
    this.listeners.set(appId, listener);
    console.log(`[UrlSync] 注册路由监听器: ${appId}`);
  }

  /**
   * 注销子应用路由监听器
   * @param {string} appId - 应用ID
   */
  unregisterListener(appId) {
    this.listeners.delete(appId);
    console.log(`[UrlSync] 注销路由监听器: ${appId}`);
  }

  /**
   * 设置当前激活的应用
   * @param {string} appId - 应用ID
   */
  setCurrentApp(appId) {
    this.currentAppId = appId;
  }

  /**
   * 获取当前激活的应用
   * @returns {string|null}
   */
  getCurrentApp() {
    return this.currentAppId;
  }
}

// 导出单例
export default new UrlSyncManager();