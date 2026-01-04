import React from 'react';
import styles from './Form.module.css';

export const Form = ({ onSubmit, children, loading = false, className = '', ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && onSubmit) onSubmit(e);
  };

  const fallbackStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  return (
    <form 
      className={styles?.form || className} 
      style={!styles ? fallbackStyle : undefined}
      onSubmit={handleSubmit} 
      {...props}
    >
      <fieldset disabled={loading} style={{ border: 'none', padding: 0, margin: 0 }}>
        {children}
      </fieldset>
    </form>
  );
};

export const Input = ({
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
  className = '',
  ...props
}) => {
  const fallbackStyles = {
    formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '14px', fontWeight: 500, color: '#333' },
    input: {
      padding: '10px 12px',
      fontSize: '14px',
      border: `1px solid ${error ? '#f44336' : '#ddd'}`,
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      color: '#333',
    },
    error: { fontSize: '12px', color: '#f44336', marginTop: '2px' },
  };

  return (
    <div 
      className={styles?.formGroup}
      style={!styles ? fallbackStyles.formGroup : undefined}
    >
      {label && (
        <label 
          htmlFor={name} 
          className={styles?.label}
          style={!styles ? fallbackStyles.label : undefined}
        >
          {label}
          {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
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
        className={styles ? `${styles.input} ${error ? styles.inputError : ''} ${className}` : className}
        style={!styles ? fallbackStyles.input : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
        {...props}
      />
      
      {error && (
        <span 
          id={`${name}-error`} 
          className={styles?.errorText}
          style={!styles ? fallbackStyles.error : undefined}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export const Select = ({
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select...',
  className = '',
  ...props
}) => {
  const fallbackStyles = {
    formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '14px', fontWeight: 500, color: '#333' },
    select: {
      padding: '10px 12px',
      fontSize: '14px',
      border: `1px solid ${error ? '#f44336' : '#ddd'}`,
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      color: '#333',
      cursor: 'pointer',
    },
    error: { fontSize: '12px', color: '#f44336', marginTop: '2px' },
  };

  return (
    <div 
      className={styles?.formGroup}
      style={!styles ? fallbackStyles.formGroup : undefined}
    >
      {label && (
        <label 
          htmlFor={name} 
          className={styles?.label}
          style={!styles ? fallbackStyles.label : undefined}
        >
          {label}
          {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={styles ? `${styles.select} ${error ? styles.inputError : ''} ${className}` : className}
        style={!styles ? fallbackStyles.select : undefined}
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
        <span 
          id={`${name}-error`} 
          className={styles?.errorText}
          style={!styles ? fallbackStyles.error : undefined}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export const TextArea = ({
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
  className = '',
  ...props
}) => {
  const fallbackStyles = {
    formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '14px', fontWeight: 500, color: '#333' },
    textarea: {
      padding: '10px 12px',
      fontSize: '14px',
      border: `1px solid ${error ? '#f44336' : '#ddd'}`,
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      color: '#333',
      resize: 'vertical',
      minHeight: '80px',
    },
    error: { fontSize: '12px', color: '#f44336', marginTop: '2px' },
  };

  return (
    <div 
      className={styles?.formGroup}
      style={!styles ? fallbackStyles.formGroup : undefined}
    >
      {label && (
        <label 
          htmlFor={name} 
          className={styles?.label}
          style={!styles ? fallbackStyles.label : undefined}
        >
          {label}
          {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={styles ? `${styles.textarea} ${error ? styles.inputError : ''} ${className}` : className}
        style={!styles ? fallbackStyles.textarea : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
        {...props}
      />
      
      {error && (
        <span 
          id={`${name}-error`} 
          className={styles?.errorText}
          style={!styles ? fallbackStyles.error : undefined}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export const Checkbox = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => {
  const fallbackStyles = {
    group: { display: 'flex', alignItems: 'center' },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      fontSize: '14px',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      accentColor: '#4CAF50',
    },
  };

  return (
    <div 
      className={styles?.checkboxGroup}
      style={!styles ? fallbackStyles.group : undefined}
    >
      <label 
        className={styles?.checkboxLabel}
        style={!styles ? fallbackStyles.label : undefined}
        htmlFor={name}
      >
        <input
          id={name}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={styles?.checkbox}
          style={!styles ? fallbackStyles.checkbox : undefined}
          {...props}
        />
        <span>{label}</span>
      </label>
    </div>
  );
};

export const Switch = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => {
  const fallbackStyles = {
    group: { display: 'flex', alignItems: 'center' },
    label: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      width: '100%',
      fontSize: '14px',
    },
    container: {
      position: 'relative',
      width: '44px',
      height: '24px',
    },
    slider: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: checked ? '#4CAF50' : '#e0e0e0',
      borderRadius: '24px',
      transition: 'background-color 0.3s',
      opacity: disabled ? 0.5 : 1,
    },
  };

  return (
    <div 
      className={styles?.switchGroup}
      style={!styles ? fallbackStyles.group : undefined}
    >
      <label 
        className={styles?.switchLabel}
        style={!styles ? fallbackStyles.label : undefined}
        htmlFor={name}
      >
        <span>{label}</span>
        <div 
          className={styles?.switchContainer}
          style={!styles ? fallbackStyles.container : undefined}
        >
          <input
            id={name}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={styles?.switchInput}
            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
            role="switch"
            aria-checked={checked}
            {...props}
          />
          <span 
            className={styles?.switchSlider}
            style={!styles ? fallbackStyles.slider : undefined}
          />
        </div>
      </label>
    </div>
  );
};