import React from 'react';

/**
 * Input component with validation support
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
  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
  };

  const requiredStyle = {
    color: '#f44336',
    marginLeft: '4px',
  };

  const inputStyle = {
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: `1px solid ${error ? '#f44336' : '#ddd'}`,
    borderRadius: '4px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#ffffff',
    color: '#333',
  };

  const errorTextStyle = {
    fontSize: '12px',
    color: '#f44336',
    marginTop: '2px',
  };

  return (
    <div style={formGroupStyle}>
      <label htmlFor={name} style={labelStyle}>
        {label}
        {required && <span style={requiredStyle} aria-label="required">*</span>}
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
        style={inputStyle}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
        {...props}
      />
      
      {error && (
        <span id={`${name}-error`} style={errorTextStyle} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;