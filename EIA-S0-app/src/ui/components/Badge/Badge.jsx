import React from 'react';
import styles from './Badge.module.css';

const Badge = ({ children, type = 'default', className = '' }) => {
  // Fallback styles in case CSS module fails to load
  const typeStyles = {
    default: { backgroundColor: '#e0e0e0', color: '#333' },
    success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
    error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
    warning: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
    info: { backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
  };

  const baseStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '12px',
    whiteSpace: 'nowrap',
    lineHeight: 1.5,
  };

  const fallbackStyle = {
    ...baseStyle,
    ...typeStyles[type],
  };

  return (
    <span 
      className={styles ? `${styles.badge} ${styles[type]} ${className}` : className}
      style={!styles ? fallbackStyle : undefined}
    >
      {children}
    </span>
  );
};

export default Badge;