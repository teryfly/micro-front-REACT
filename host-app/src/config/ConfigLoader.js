/**
 * 配置加载器
 * 负责从JSON文件或配置中心加载应用配置
 */

import { validateAndFilter } from './ConfigValidator';

const CONFIG_CACHE_KEY = 'MICRO_APP_CONFIG_CACHE';
const CONFIG_VERSION_KEY = 'MICRO_APP_CONFIG_VERSION';

/**
 * 获取当前运行环境
 * @returns {string} 'development' | 'production'
 */
function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

/**
 * 从缓存加载配置
 * @returns {Object|null}
 */
function loadFromCache() {
  try {
    const cached = localStorage.getItem(CONFIG_CACHE_KEY);
    if (cached) {
      const config = JSON.parse(cached);
      console.log('[ConfigLoader] 从缓存加载配置');
      return config;
    }
  } catch (error) {
    console.warn('[ConfigLoader] 缓存读取失败:', error);
  }
  return null;
}

/**
 * 保存配置到缓存
 * @param {Object} config - 配置对象
 */
function saveToCache(config) {
  try {
    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
    localStorage.setItem(CONFIG_VERSION_KEY, config.version);
    console.log('[ConfigLoader] 配置已缓存');
  } catch (error) {
    console.warn('[ConfigLoader] 缓存保存失败:', error);
  }
}

/**
 * 从URL加载配置
 * @param {string} url - 配置文件URL
 * @returns {Promise<Object>}
 */
async function fetchConfig(url) {
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  });

  if (!response.ok) {
    throw new Error(`配置加载失败: HTTP ${response.status}`);
  }

  const config = await response.json();
  return config;
}

/**
 * 加载应用配置
 * @param {Object} options - 加载选项
 * @param {string} options.url - 配置文件URL（可选）
 * @param {boolean} options.useCache - 是否使用缓存（默认true）
 * @returns {Promise<Object>} 验证后的配置对象
 */
export async function loadConfig(options = {}) {
  const {
    url = '/apps-config.json',
    useCache = true
  } = options;

  try {
    // 尝试从缓存加载（仅生产环境）
    if (useCache && getEnvironment() === 'production') {
      const cached = loadFromCache();
      if (cached) {
        return cached;
      }
    }

    console.log('[ConfigLoader] 开始加载配置...');
    
    // 从URL加载配置
    const rawConfig = await fetchConfig(url);
    
    // 验证配置
    const validatedConfig = validateAndFilter(rawConfig);
    
    // 根据环境选择entry地址
    const processedConfig = processConfigForEnvironment(validatedConfig);
    
    // 保存到缓存
    if (useCache) {
      saveToCache(processedConfig);
    }

    console.log('[ConfigLoader] 配置加载成功:', processedConfig);
    return processedConfig;

  } catch (error) {
    console.error('[ConfigLoader] 配置加载失败:', error);
    
    // 尝试使用缓存降级
    const cached = loadFromCache();
    if (cached) {
      console.warn('[ConfigLoader] 使用缓存配置降级');
      return cached;
    }

    throw error;
  }
}

/**
 * 处理配置中的环境相关字段
 * @param {Object} config - 原始配置
 * @returns {Object} 处理后的配置
 */
function processConfigForEnvironment(config) {
  const env = getEnvironment();
  
  const processedApps = config.apps.map(app => ({
    ...app,
    entryUrl: app.entry[env] || app.entry.development
  }));

  return {
    ...config,
    apps: processedApps,
    environment: env
  };
}

/**
 * 清除配置缓存
 */
export function clearConfigCache() {
  try {
    localStorage.removeItem(CONFIG_CACHE_KEY);
    localStorage.removeItem(CONFIG_VERSION_KEY);
    console.log('[ConfigLoader] 缓存已清除');
  } catch (error) {
    console.warn('[ConfigLoader] 缓存清除失败:', error);
  }
}

/**
 * 检查配置更新（用于生产环境轮询）
 * @param {string} url - 配置文件URL
 * @returns {Promise<boolean>} 是否有新版本
 */
export async function checkConfigUpdate(url = '/apps-config.json') {
  try {
    const currentVersion = localStorage.getItem(CONFIG_VERSION_KEY);
    const config = await fetchConfig(url);
    
    return config.version !== currentVersion;
  } catch (error) {
    console.error('[ConfigLoader] 检查更新失败:', error);
    return false;
  }
}