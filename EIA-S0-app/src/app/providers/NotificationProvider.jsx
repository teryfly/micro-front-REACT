import React, { createContext, useState, useCallback, useEffect } from 'react';
import Notification from '../../shared/ui/Notification';

/**
 * Notification context
 * Provides notification actions to child components
 */
export const NotificationContext = createContext(null);

/**
 * Notification Provider - Manages toast notifications
 * Supports both local notifications and cross-app notifications (embedded mode)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.embedded=false] - Embedded mode flag
 * @param {Object} [props.eventBus] - Event bus for cross-app notifications
 */
export const NotificationProvider = ({ children, embedded = false, eventBus = null }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Show notification toast
   * In embedded mode, delegates to host app via EventBus
   * 
   * @param {string} message - Notification message text
   * @param {string} [type='info'] - Notification type: 'success' | 'error' | 'warning' | 'info'
   * @param {number} [duration=3000] - Auto-dismiss duration in milliseconds
   */
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    // FIX: If embedded, delegate ALL notifications to host app and return
    if (embedded && eventBus) {
      console.log('📤 [Notification] Delegating to host:', { message, type });
      eventBus.emit('subapp:notification:show', {
        message,
        type,
        duration,
        source: 'eia-s0-app',
        timestamp: new Date().toISOString(),
      });
      return; // Do not render local notification
    }

    // Standalone mode: render local notification
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => {
      const newNotifications = [...prev, notification];
      if (newNotifications.length > 5) {
        newNotifications.shift();
      }
      return newNotifications;
    });

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, [embedded, eventBus]);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = { showNotification, clearNotifications };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container - Only renders in Standalone mode because notifications array stays empty in embedded */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {notifications.map(notification => (
          <Notification 
            key={notification.id} 
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};