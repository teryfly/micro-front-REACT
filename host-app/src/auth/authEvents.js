/**
 * 鉴权相关的全局事件名
 * 由 httpClient 等非 React 模块派发，AuthProvider 监听后驱动状态机
 *
 * @module auth/authEvents
 */

export const AUTH_EVENTS = {
  /** 令牌失效（401） */
  UNAUTHORIZED: 'sso:unauthorized',
  /** 权限不足（403） */
  FORBIDDEN: 'sso:forbidden',
  /** 主应用登录态变化，供子应用监听 */
  AUTH_CHANGE: 'host:auth-change',
};

/**
 * 派发鉴权事件
 * @param {string} eventName
 * @param {string} reason
 */
export function emitAuthEvent(eventName, reason) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName, { detail: { reason } }));
}

export default AUTH_EVENTS;
