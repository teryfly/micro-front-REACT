import { useContext } from 'react';
import { NotificationContext } from '../../app/providers/NotificationProvider';

/**
 * Hook to access notification context
 * Provides notification actions to components
 * 
 * @returns {Object} Notification context value
 * @returns {Function} return.showNotification - Show notification function
 * @returns {Function} return.clearNotifications - Clear all notifications function
 * 
 * @throws {Error} If used outside NotificationProvider
 * 
 * @example
 * const { showNotification } = useNotification();
 * 
 * // Show success notification
 * showNotification('Operation successful!', 'success');
 * 
 * // Show error with custom duration
 * showNotification('Error occurred', 'error', 5000);
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  
  return context;
};