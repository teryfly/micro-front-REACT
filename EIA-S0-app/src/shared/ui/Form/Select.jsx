import React from 'react';
import styles from './Form.module.css';

/**
 * Select dropdown component
 * 
 * @param {Object} props
 * @param {string} props.name - Select name and ID
 * @param {string} props.label - Select label
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array<Object>} props.options - Options array [{value, label}]
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.placeholder='Select...'] - Placeholder option text
 * 
 * @example
 * <Select
 *   name="country"
 *   label="Country"
 *   value={country}
 *   onChange={(e) => setCountry(e.target.value)}
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'ca', label: 'Canada' }
 *   ]}
 * />
 */
const Select = ({
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select...',
  ...props
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-label="required">*</span>}
      </label>
      
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`${styles.select} ${error ? styles.inputError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <span id={`${name}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;