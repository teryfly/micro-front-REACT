import React, { useEffect, useState } from 'react';
import styles from './Notification.module.css';

/**
 * Toast notification component
 * Auto-dismisses after specified duration
 * 
 * @param {Object} props
 * @param {string} props.message - Notification message
 * @param {string} [props.type='info'] - Notification type (success/error/warning/info)
 * @param {number} [props.duration=3000] - Auto-dismiss duration in milliseconds
 * @param {Function} [props.onClose] - Close handler
 * 
 * @example
 * <Notification
 *   message="Operation successful!"
 *   type="success"
 *   duration={3000}
 *   onClose={() => console.log('closed')}
 * />
 */
const Notification = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div 
      className={`${styles.notification} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
        type="button"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;