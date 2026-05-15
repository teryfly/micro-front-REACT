import React from 'react';
import styles from './Badge.module.css';

/**
 * Badge component for status display
 * Small colored label for status indicators
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.type='default'] - Badge type (success/error/warning/info/default)
 * 
 * @example
 * <Badge type="success">Active</Badge>
 * <Badge type="error">Disabled</Badge>
 */
const Badge = ({ children, type = 'default' }) => {
  return (
    <span className={`${styles.badge} ${styles[type]}`}>
      {children}
    </span>
  );
};

export default Badge;