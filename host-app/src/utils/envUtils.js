/**
 * 环境工具函数
 */

/**
 * 获取当前环境
 * @returns {string}
 */
export function getEnv() {
  return process.env.NODE_ENV || 'development';
}

/**
 * 是否为开发环境
 * @returns {boolean}
 */
export function isDevelopment() {
  return getEnv() === 'development';
}

/**
 * 是否为生产环境
 * @returns {boolean}
 */
export function isProduction() {
  return getEnv() === 'production';
}

/**
 * 获取公共路径
 * @returns {string}
 */
export function getPublicPath() {
  return process.env.REACT_APP_PUBLIC_PATH || '/';
}

/**
 * 获取配置URL
 * @returns {string}
 */
export function getConfigUrl() {
  return process.env.REACT_APP_CONFIG_URL || '/apps-config.json';
}