import React, { useEffect, useState } from 'react';
import styles from './Notification.module.css';

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

  const typeStyles = {
    success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
    error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
    warning: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
    info: { backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
  };

  const fallbackStyles = {
    notification: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      minWidth: '250px',
      maxWidth: '400px',
      ...typeStyles[type],
    },
    icon: { fontSize: '18px', flexShrink: 0 },
    message: { flex: 1, fontSize: '14px', wordBreak: 'break-word' },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      padding: 0,
      width: '24px',
      height: '24px',
      color: 'inherit',
    },
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div 
      className={styles ? `${styles.notification} ${styles[type]}` : ''}
      style={!styles ? fallbackStyles.notification : undefined}
      role="alert" 
      aria-live="polite"
    >
      <span 
        className={styles?.icon}
        style={!styles ? fallbackStyles.icon : undefined}
        aria-hidden="true"
      >
        {icons[type]}
      </span>
      <span 
        className={styles?.message}
        style={!styles ? fallbackStyles.message : undefined}
      >
        {message}
      </span>
      <button
        className={styles?.closeButton}
        style={!styles ? fallbackStyles.closeButton : undefined}
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