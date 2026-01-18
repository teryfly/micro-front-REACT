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
 * 
 * @example
 * <NotificationProvider embedded={true} eventBus={eventBus}>
 *   <App />
 * </NotificationProvider>
 */
export const NotificationProvider = ({ children, embedded = false, eventBus = null }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Show notification toast
   * In embedded mode, also sends error notifications to host app
   * 
   * @param {string} message - Notification message text
   * @param {string} [type='info'] - Notification type: 'success' | 'error' | 'warning' | 'info'
   * @param {number} [duration=3000] - Auto-dismiss duration in milliseconds
   */
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => {
      const newNotifications = [...prev, notification];
      
      // Limit to 5 notifications
      if (newNotifications.length > 5) {
        newNotifications.shift();
      }
      
      return newNotifications;
    });

    // Auto-dismiss after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);

    // Send error notifications to host app (embedded mode)
    if (embedded && eventBus && type === 'error') {
      eventBus.emit('subapp:notification:error', {
        message,
        source: 'eia-s0-app',
        timestamp: new Date().toISOString(),
      });
    }
  }, [embedded, eventBus]);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Listen for global notifications from host app (embedded mode)
   */
  useEffect(() => {
    if (!embedded || !eventBus) return;

    const handleGlobalNotification = (data) => {
      const { message, type = 'info', duration = 3000 } = data;
      showNotification(message, type, duration);
    };

    // Listen for both host and local notification events
    eventBus.on('host:notification:global', handleGlobalNotification);
    eventBus.on('local:notification:show', handleGlobalNotification);

    return () => {
      eventBus.off('host:notification:global', handleGlobalNotification);
      eventBus.off('local:notification:show', handleGlobalNotification);
    };
  }, [embedded, eventBus, showNotification]);

  const value = { showNotification, clearNotifications };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
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