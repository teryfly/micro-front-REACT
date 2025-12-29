import React from 'react';

/**
 * Error message component
 * Displays error message with optional retry button
 */
const ErrorMessage = ({ message, onRetry }) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    gap: '16px',
    backgroundColor: '#fff3f3',
    border: '1px solid #ffcccc',
    borderRadius: '4px',
  };

  const iconStyle = {
    fontSize: '32px',
  };

  const messageStyle = {
    margin: 0,
    fontSize: '14px',
    color: '#f44336',
    textAlign: 'center',
    maxWidth: '400px',
  };

  const retryButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  };

  return (
    <div style={containerStyle} role="alert">
      <div style={iconStyle} aria-hidden="true">⚠️</div>
      <p style={messageStyle}>{message}</p>
      {onRetry && (
        <button style={retryButtonStyle} onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;