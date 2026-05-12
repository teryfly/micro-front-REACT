/**
 * 子应用路由状态管理器
 * 保存和恢复每个子应用的路由状态
 */

class SubAppRouteManager {
  constructor() {
    // 路由状态存储: Map<appId, { pathname, search, hash, scrollPosition }>
    this.routeStateMap = new Map();
    
    // 从sessionStorage恢复状态
    this.restoreFromSession();
  }

  /**
   * 保存子应用路由状态
   * @param {string} appId - 应用ID
   * @param {Object} state - 路由状态
   */
  saveRouteState(appId, state) {
    const routeState = {
      pathname: state.pathname || '/',
      search: state.search || '',
      hash: state.hash || '',
      scrollPosition: state.scrollPosition || 0,
      timestamp: Date.now()
    };

    this.routeStateMap.set(appId, routeState);
    this.persistToSession();
    
    console.log(`[RouteManager] 保存路由状态: ${appId}`, routeState);
  }

  /**
   * 获取子应用路由状态
   * @param {string} appId - 应用ID
   * @returns {Object|null}
   */
  getRouteState(appId) {
    return this.routeStateMap.get(appId) || null;
  }

  /**
   * 清除子应用路由状态
   * @param {string} appId - 应用ID
   */
  clearRouteState(appId) {
    this.routeStateMap.delete(appId);
    this.persistToSession();
    console.log(`[RouteManager] 清除路由状态: ${appId}`);
  }

  /**
   * 持久化到sessionStorage
   */
  persistToSession() {
    try {
      const data = {};
      this.routeStateMap.forEach((state, appId) => {
        data[appId] = state;
      });
      sessionStorage.setItem('SUB_APP_ROUTES', JSON.stringify(data));
    } catch (error) {
      console.warn('[RouteManager] 持久化失败:', error);
    }
  }

  /**
   * 从sessionStorage恢复
   */
  restoreFromSession() {
    try {
      const data = sessionStorage.getItem('SUB_APP_ROUTES');
      if (data) {
        const parsed = JSON.parse(data);
        Object.entries(parsed).forEach(([appId, state]) => {
          this.routeStateMap.set(appId, state);
        });
        console.log('[RouteManager] 从session恢复路由状态');
      }
    } catch (error) {
      console.warn('[RouteManager] 恢复失败:', error);
    }
  }

  /**
   * 清除所有状态
   */
  clearAll() {
    this.routeStateMap.clear();
    sessionStorage.removeItem('SUB_APP_ROUTES');
    console.log('[RouteManager] 清除所有路由状态');
  }
}

// 导出单例
export default new SubAppRouteManager();