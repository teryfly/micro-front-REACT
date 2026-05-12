/**
 * PostMessage桥接器
 * 封装window.postMessage通信
 */

import { createMessage, validateMessage, isMessageForMe } from './messageProtocol';

class PostMessageBridge {
  constructor() {
    this.listeners = new Map();
    this.allowedOrigins = new Set([
      'http://localhost:7001',
      'http://localhost:7002',
      'http://localhost:7000'
    ]);
    
    this.init();
  }

  /**
   * 初始化消息监听
   */
  init() {
    window.addEventListener('message', this.handleMessage.bind(this));
    console.log('[PostMessageBridge] 初始化完成');
  }

  /**
   * 处理接收到的消息
   * @param {MessageEvent} event
   */
  handleMessage(event) {
    // 验证来源
    if (!this.isOriginAllowed(event.origin)) {
      console.warn('[PostMessageBridge] 消息来源未授权:', event.origin);
      return;
    }

    const message = event.data;

    // 验证消息格式
    if (!validateMessage(message)) {
      return;
    }

    console.log('[PostMessageBridge] 收到消息:', message);

    // 触发对应类型的监听器
    const handlers = this.listeners.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message, event);
      } catch (error) {
        console.error('[PostMessageBridge] 消息处理错误:', error);
      }
    });
  }

  /**
   * 检查来源是否允许
   * @param {string} origin
   * @returns {boolean}
   */
  isOriginAllowed(origin) {
    // 开发环境允许所有localhost
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return true;
    }
    
    return this.allowedOrigins.has(origin);
  }

  /**
   * 添加允许的来源
   * @param {string} origin
   */
  addAllowedOrigin(origin) {
    this.allowedOrigins.add(origin);
  }

  /**
   * 监听特定类型的消息
   * @param {string} type - 消息类型
   * @param {Function} handler - 处理函数
   * @returns {Function} 取消监听函数
   */
  listen(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type).push(handler);
    
    return () => {
      const handlers = this.listeners.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * 向子应用发送消息
   * @param {string} appId - 目标应用ID
   * @param {string} type - 消息类型
   * @param {any} payload - 消息数据
   */
  sendToSubApp(appId, type, payload) {
    const message = createMessage(type, payload, 'host-app', appId);
    
    // 获取子应用的iframe或window对象
    const subAppWindow = this.getSubAppWindow(appId);
    
    if (subAppWindow) {
      subAppWindow.postMessage(message, '*');
      console.log(`[PostMessageBridge] 发送消息到 ${appId}:`, message);
    } else {
      console.warn(`[PostMessageBridge] 未找到子应用窗口: ${appId}`);
    }
  }

  /**
   * 广播消息到所有子应用
   * @param {string} type - 消息类型
   * @param {any} payload - 消息数据
   */
  broadcast(type, payload) {
    const message = createMessage(type, payload, 'host-app', '*');
    window.postMessage(message, '*');
    console.log('[PostMessageBridge] 广播消息:', message);
  }

  /**
   * 获取子应用的window对象
   * @param {string} appId - 应用ID
   * @returns {Window|null}
   */
  getSubAppWindow(appId) {
    // 在当前实现中，子应用在同一个window中
    // 如果使用iframe，这里需要查找iframe的contentWindow
    return window;
  }
}

// 导出单例
export default new PostMessageBridge();