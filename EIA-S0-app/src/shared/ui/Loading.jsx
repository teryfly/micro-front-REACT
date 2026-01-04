import React from 'react';
import styles from './Loading.module.css';

/**
 * Loading spinner component
 * Displays animated spinner with optional message
 * 
 * @param {Object} props
 * @param {string} [props.message='Loading...'] - Loading message
 * @param {string} [props.size='medium'] - Spinner size (small/medium/large)
 * 
 * @example
 * <Loading message="Loading data..." size="large" />
 */
const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={styles.loadingContainer} role="status" aria-live="polite">
      <div className={`${styles.spinner} ${styles[size]}`} aria-hidden="true"></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Loading;