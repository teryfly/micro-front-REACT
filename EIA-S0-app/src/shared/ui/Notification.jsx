import React, { useEffect, useState } from 'react';

/**
 * Toast notification component
 * Auto-dismisses after specified duration
 */
const Notification = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsAnimating(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7',
    },
    info: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb',
    },
  };

  const notificationStyle = {
    ...typeStyles[type],
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    minWidth: '250px',
    maxWidth: '400px',
    transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
    opacity: isAnimating ? 1 : 0,
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  };

  const iconStyle = {
    fontSize: '18px',
    flexShrink: 0,
  };

  const messageStyle = {
    flex: 1,
    fontSize: '14px',
    wordBreak: 'break-word',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: 0,
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    flexShrink: 0,
    color: 'inherit',
  };

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
    <div style={notificationStyle} role="alert" aria-live="polite">
      <span style={iconStyle} aria-hidden="true">{icons[type]}</span>
      <span style={messageStyle}>{message}</span>
      <button
        style={closeButtonStyle}
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