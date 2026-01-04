import React from 'react';
import styles from './Form.module.css';

/**
 * TextArea component for multi-line text input
 * 
 * @param {Object} props
 * @param {string} props.name - TextArea name and ID
 * @param {string} props.label - TextArea label
 * @param {string} props.value - TextArea value
 * @param {Function} props.onChange - Change handler
 * @param {number} [props.rows=4] - Number of visible text rows
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.placeholder] - Placeholder text
 * @param {number} [props.maxLength] - Maximum length
 * 
 * @example
 * <TextArea
 *   name="description"
 *   label="Description"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   rows={6}
 * />
 */
const TextArea = ({
  name,
  label,
  value,
  onChange,
  rows = 4,
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
      
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`${styles.textarea} ${error ? styles.inputError : ''}`}
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

export default TextArea;