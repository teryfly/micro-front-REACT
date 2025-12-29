import React, { createContext, useState, useCallback } from 'react';
import Notification from '../../shared/ui/Notification';

/**
 * Notification context
 * Provides notification actions to child components
 */
export const NotificationContext = createContext(null);

/**
 * Notification Provider - Manages toast notifications
 * Displays notifications in top-right corner with auto-dismiss
 * Limits to 5 visible notifications at once
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * 
 * @example
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Show notification toast
   * Automatically dismisses after specified duration
   * 
   * @param {string} message - Notification message text
   * @param {string} [type='info'] - Notification type: 'success' | 'error' | 'warning' | 'info'
   * @param {number} [duration=3000] - Auto-dismiss duration in milliseconds
   * 
   * @example
   * const { showNotification } = useNotification();
   * showNotification('Operation successful!', 'success');
   * showNotification('Error occurred', 'error', 5000);
   */
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => {
      const newNotifications = [...prev, notification];
      
      // Limit to 5 notifications - remove oldest if exceeds
      if (newNotifications.length > 5) {
        newNotifications.shift();
      }
      
      return newNotifications;
    });

    // Auto-dismiss after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  /**
   * Clear all notifications
   * Removes all active notifications from display
   * 
   * @example
   * const { clearNotifications } = useNotification();
   * clearNotifications();
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = { showNotification, clearNotifications };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container - Fixed top-right position */}
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