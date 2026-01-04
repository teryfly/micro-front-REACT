import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  // Fallback styles if CSS module fails to load
  const baseStyle = {
    border: 'none',
    borderRadius: '4px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: 500,
    opacity: disabled ? 0.6 : 1,
    whiteSpace: 'nowrap',
  };

  const variants = {
    primary: { backgroundColor: '#4CAF50', color: 'white' },
    secondary: { backgroundColor: '#f0f0f0', color: '#333' },
    danger: { backgroundColor: '#f44336', color: 'white' },
  };

  const sizes = {
    small: { padding: '6px 12px', fontSize: '12px' },
    medium: { padding: '10px 20px', fontSize: '14px' },
    large: { padding: '14px 28px', fontSize: '16px' },
  };

  const fallbackStyle = {
    ...baseStyle,
    ...variants[variant],
    ...sizes[size],
    position: loading ? 'relative' : 'static',
    color: loading ? 'transparent' : variants[variant].color,
  };

  const spinnerStyle = {
    position: 'absolute',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  };

  const classNames = styles 
    ? [styles.button, styles[variant], styles[size], loading && styles.loading, className]
        .filter(Boolean)
        .join(' ')
    : className;

  return (
    <>
      <button
        type={type}
        className={classNames}
        style={!styles ? fallbackStyle : undefined}
        onClick={onClick}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span 
            className={styles?.spinner}
            style={!styles ? spinnerStyle : undefined}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
      {!styles && loading && (
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}
    </>
  );
};

export default Button;