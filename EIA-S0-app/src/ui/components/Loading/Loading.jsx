import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  // Fallback styles in case CSS module fails to load
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    gap: '16px',
  };

  const sizes = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '60px', height: '60px', borderWidth: '4px' },
  };

  const spinnerStyle = {
    ...sizes[size],
    border: `${sizes[size].borderWidth} solid #e0e0e0`,
    borderTopColor: '#4CAF50',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const messageStyle = {
    margin: 0,
    fontSize: '14px',
    color: '#999',
  };

  return (
    <div 
      className={styles?.loadingContainer} 
      style={!styles ? containerStyle : undefined}
      role="status" 
      aria-live="polite"
    >
      <div 
        className={styles ? `${styles.spinner} ${styles[size]}` : undefined}
        style={!styles ? spinnerStyle : undefined}
        aria-hidden="true"
      />
      {message && (
        <p 
          className={styles?.message}
          style={!styles ? messageStyle : undefined}
        >
          {message}
        </p>
      )}
      {!styles && (
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}
    </div>
  );
};

export default Loading;