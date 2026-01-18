/**
 * 全局通知 Context
 * 管理主应用及所有子应用的通知展示
 */
import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import Toast from '../components/Notification/Toast';
import styles from '../components/Notification/Toast.module.css';
import EventBus from '../communication/EventBus';
const NotificationContext = createContext(null);
export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  /**
   * 添加通知
   */
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);
  /**
   * 移除通知
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  /**
   * 监听来自子应用的通知事件
   */
  useEffect(() => {
    const handleSubAppNotification = (data) => {
      console.log('[NotificationProvider] 收到子应用通知:', data);
      const { message, type, duration } = data;
      addToast(message, type, duration);
    };
    // 监听子应用发出的标准展示事件
    const unsubscribeShow = EventBus.on('subapp:notification:show', handleSubAppNotification);
    // 监听子应用发出的错误事件 (兼容旧逻辑)
    const unsubscribeError = EventBus.on('subapp:notification:error', (data) => {
      handleSubAppNotification({ ...data, type: 'error' });
    });
    return () => {
      unsubscribeShow();
      unsubscribeError();
    };
  }, [addToast]);
  const value = { addToast, removeToast };
  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* 全局 Toast 容器 */}
      <div className={styles.container}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}