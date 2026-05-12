/**
 * 全局事件总线
 * 实现发布-订阅模式，用于主子应用通信
 */

class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   * @returns {Function} 取消订阅函数
   */
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event).push(handler);
    
    console.log(`[EventBus] 订阅事件: ${event}`);
    
    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  /**
   * 取消订阅
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  off(event, handler) {
    if (!this.events.has(event)) {
      return;
    }
    
    const handlers = this.events.get(event);
    const index = handlers.indexOf(handler);
    
    if (index > -1) {
      handlers.splice(index, 1);
      console.log(`[EventBus] 取消订阅: ${event}`);
    }
    
    // 如果没有监听器了，删除事件
    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {any} data - 事件数据
   */
  emit(event, data) {
    if (!this.events.has(event)) {
      return;
    }
    
    console.log(`[EventBus] 发布事件: ${event}`, data);
    
    const handlers = this.events.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] 事件处理器执行错误: ${event}`, error);
      }
    });
  }

  /**
   * 一次性订阅
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  once(event, handler) {
    const wrappedHandler = (data) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    
    this.on(event, wrappedHandler);
  }

  /**
   * 清除所有事件监听器
   */
  clear() {
    this.events.clear();
    console.log('[EventBus] 清除所有事件监听器');
  }

  /**
   * 获取事件监听器数量
   * @param {string} event - 事件名称
   * @returns {number}
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
}

// 创建全局单例并挂载到window
const eventBus = new EventBus();
window.__MICRO_APP_EVENT_BUS__ = eventBus;

export default eventBus;