/**
 * 消息协议定义
 * 标准化主子应用间的postMessage通信格式
 */

/**
 * 消息类型枚举
 */
export const MessageTypes = {
  // 主题相关
  THEME_CHANGE: 'THEME_CHANGE',
  
  // 路由相关
  ROUTE_CHANGE: 'ROUTE_CHANGE',
  RESTORE_ROUTE: 'RESTORE_ROUTE',
  
  // 应用生命周期
  APP_MOUNTED: 'APP_MOUNTED',
  APP_UNMOUNTED: 'APP_UNMOUNTED',
  
  // 数据通信
  DATA_REQUEST: 'DATA_REQUEST',
  DATA_RESPONSE: 'DATA_RESPONSE',
  
  // 全局状态
  GLOBAL_STATE_UPDATE: 'GLOBAL_STATE_UPDATE'
};

/**
 * 创建标准消息对象
 * @param {string} type - 消息类型
 * @param {any} payload - 消息数据
 * @param {string} source - 发送方标识
 * @param {string} target - 接收方标识
 * @returns {Object}
 */
export function createMessage(type, payload, source = 'host-app', target = '*') {
  return {
    type,
    payload,
    source,
    target,
    timestamp: Date.now(),
    id: `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

/**
 * 验证消息格式
 * @param {Object} message - 消息对象
 * @returns {boolean}
 */
export function validateMessage(message) {
  return (
    message &&
    typeof message === 'object' &&
    message.type &&
    message.source &&
    message.timestamp
  );
}

/**
 * 检查消息是否为目标接收
 * @param {Object} message - 消息对象
 * @param {string} currentAppId - 当前应用ID
 * @returns {boolean}
 */
export function isMessageForMe(message, currentAppId) {
  return (
    message.target === '*' ||
    message.target === currentAppId ||
    message.target === 'host-app'
  );
}