import React from 'react';
import styles from './Form.module.css';

/**
 * Input component with validation support
 * Displays label, error message, and supports various input types
 * 
 * @param {Object} props
 * @param {string} props.name - Input name and ID
 * @param {string} props.label - Input label
 * @param {string} [props.type='text'] - Input type (text/email/password/number)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Required field indicator
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.placeholder] - Placeholder text
 * @param {number} [props.maxLength] - Maximum length
 * 
 * @example
 * <Input
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={errors.email}
 *   required
 * />
 */
const Input = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  maxLength,
  ...props
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-label="required">*</span>}
      </label>
      
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
        {...props}
      />
      
      {error && (
        <span id={`${name}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;