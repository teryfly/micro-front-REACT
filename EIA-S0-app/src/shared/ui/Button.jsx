import React from 'react';
import styles from './Button.module.css';

/**
 * Button component with loading states and variants
 * Supports multiple sizes, variants, and loading state with spinner
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type='button'] - Button type (button/submit/reset)
 * @param {string} [props.variant='primary'] - Button style variant (primary/secondary/danger)
 * @param {string} [props.size='medium'] - Button size (small/medium/large)
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.loading=false] - Loading state with spinner
 * 
 * @example
 * <Button onClick={handleClick} variant="primary" loading={isSubmitting}>
 *   Submit
 * </Button>
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ...props
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;