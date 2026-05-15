import React from 'react';
import styles from './ErrorMessage.module.css';

/**
 * Error message component
 * Displays error message with optional retry button
 * 
 * @param {Object} props
 * @param {string} props.message - Error message text
 * @param {Function} [props.onRetry] - Retry handler (shows retry button if provided)
 * 
 * @example
 * <ErrorMessage
 *   message="Failed to load data"
 *   onRetry={() => refetch()}
 * />
 */
const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className={styles.errorContainer} role="alert">
      <div className={styles.icon} aria-hidden="true">⚠️</div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;