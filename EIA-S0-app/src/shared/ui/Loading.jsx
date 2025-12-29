import React from 'react';

/**
 * Loading spinner component
 * Displays animated spinner with optional message
 * 
 * @param {Object} props
 * @param {string} [props.message='Loading...'] - Loading message
 * @param {string} [props.size='medium'] - Spinner size (small/medium/large)
 */
const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  const sizes = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '60px', height: '60px', borderWidth: '4px' },
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    gap: '16px',
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
    <div style={containerStyle} role="status" aria-live="polite">
      <div style={spinnerStyle} aria-hidden="true"></div>
      {message && <p style={messageStyle}>{message}</p>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;