import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';
const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};
export default function Toast({ id, message, type = 'info', duration = 3000, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);
  const handleClose = () => {
    setIsExiting(true);
    // Wait for animation if we add exit animation later
    onClose(id);
  };
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{icons[type]}</span>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button className={styles.closeBtn} onClick={handleClose}>×</button>
    </div>
  );
}