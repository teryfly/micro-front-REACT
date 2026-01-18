/**
 * 应用注册中心
 * 管理所有子应用的注册、加载状态和组件缓存
 */

import { loadRemoteModule } from './ModuleFederationRuntime';

class AppRegistry {
  constructor() {
    // 应用注册表: Map<appId, { config, component, status }>
    this.registry = new Map();
    
    // 加载状态: Map<appId, 'pending' | 'loaded' | 'failed'>
    this.loadingStatus = new Map();
    
    // 组件缓存: Map<appId, ReactComponent>
    this.componentCache = new Map();
  }

  /**
   * 注册单个应用
   * @param {Object} appConfig - 应用配置
   * @returns {void}
   */
  registerApp(appConfig) {
    if (this.registry.has(appConfig.id)) {
      console.warn(`[AppRegistry] 应用 ${appConfig.id} 已注册，跳过`);
      return;
    }

    this.registry.set(appConfig.id, {
      config: appConfig,
      component: null,
      status: 'registered'
    });

    console.log(`[AppRegistry] 应用 ${appConfig.id} 注册成功`, {
      containerName: appConfig.name,
      entryUrl: appConfig.entryUrl,
    });
  }

  /**
   * 批量注册应用
   * @param {Array<Object>} appsConfig - 应用配置数组
   * @returns {void}
   */
  registerApps(appsConfig) {
    appsConfig.forEach(app => this.registerApp(app));
    console.log(`[AppRegistry] 批量注册完成，共 ${appsConfig.length} 个应用`);
  }

  /**
   * 获取应用配置
   * @param {string} appId - 应用ID
   * @returns {Object|null}
   */
  getAppConfig(appId) {
    const entry = this.registry.get(appId);
    return entry ? entry.config : null;
  }

  /**
   * 获取所有应用配置
   * @returns {Array<Object>}
   */
  getAllApps() {
    return Array.from(this.registry.values()).map(entry => entry.config);
  }

  /**
   * 加载应用组件
   * @param {string} appId - 应用ID
   * @param {string} modulePath - 模块路径（默认'./EmbeddedApp'）
   * @returns {Promise<ReactComponent>}
   */
  async loadAppComponent(appId, modulePath = './EmbeddedApp') {
    // FIX: 为每个modulePath单独缓存
    const cacheKey = `${appId}:${modulePath}`;
    
    // 检查缓存
    if (this.componentCache.has(cacheKey)) {
      console.log(`[AppRegistry] 从缓存获取组件: ${cacheKey}`);
      return this.componentCache.get(cacheKey);
    }

    const appEntry = this.registry.get(appId);
    if (!appEntry) {
      throw new Error(`应用 ${appId} 未注册`);
    }

    const { config } = appEntry;

    try {
      this.loadingStatus.set(appId, 'pending');
      console.log(`[AppRegistry] 开始加载应用组件:`, {
        appId,
        modulePath,
        containerName: config.name,
        entryUrl: config.entryUrl,
      });

      // 使用Module Federation加载远程组件
      const module = await loadRemoteModule(
        config.entryUrl,
        config.name,
        modulePath
      );

      console.log('[AppRegistry] Module loaded:', {
        appId,
        modulePath,
        moduleKeys: Object.keys(module),
        hasDefault: !!module.default,
      });

      const component = module.default || module;
      
      if (!component) {
        throw new Error(`模块 ${modulePath} 未导出有效组件`);
      }
      
      // 缓存组件
      this.componentCache.set(cacheKey, component);
      this.loadingStatus.set(appId, 'loaded');
      
      // 更新注册表
      appEntry.component = component;
      appEntry.status = 'loaded';

      console.log(`[AppRegistry] 应用组件加载成功:`, {
        appId,
        modulePath,
        componentName: component.name || 'Anonymous',
      });
      
      return component;

    } catch (error) {
      this.loadingStatus.set(appId, 'failed');
      appEntry.status = 'failed';
      console.error(`[AppRegistry] 应用组件加载失败: ${appId}`, {
        modulePath,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * 检查应用是否已加载
   * @param {string} appId - 应用ID
   * @returns {boolean}
   */
  isAppLoaded(appId) {
    return this.loadingStatus.get(appId) === 'loaded';
  }

  /**
   * 获取应用加载状态
   * @param {string} appId - 应用ID
   * @returns {string} 'pending' | 'loaded' | 'failed' | 'registered'
   */
  getAppStatus(appId) {
    return this.loadingStatus.get(appId) || 'registered';
  }

  /**
   * 清除应用缓存（用于热更新）
   * @param {string} appId - 应用ID
   * @returns {void}
   */
  clearAppCache(appId) {
    // FIX: Clear all cache entries for this appId
    const keysToDelete = [];
    for (const key of this.componentCache.keys()) {
      if (key.startsWith(`${appId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.componentCache.delete(key));
    this.loadingStatus.delete(appId);
    
    const entry = this.registry.get(appId);
    if (entry) {
      entry.component = null;
      entry.status = 'registered';
    }
    
    console.log(`[AppRegistry] 清除应用缓存: ${appId} (${keysToDelete.length} entries)`);
  }

  /**
   * 注销应用
   * @param {string} appId - 应用ID
   * @returns {void}
   */
  unregisterApp(appId) {
    this.clearAppCache(appId);
    this.registry.delete(appId);
    console.log(`[AppRegistry] 应用已注销: ${appId}`);
  }
}

// 导出单例
export default new AppRegistry();