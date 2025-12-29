import React from 'react';

/**
 * Select dropdown component
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

  const selectStyle = {
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: `1px solid ${error ? '#f44336' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#333',
    cursor: 'pointer',
  };

  const errorTextStyle = {
    fontSize: '12px',
    color: '#f44336',
  };

  return (
    <div style={formGroupStyle}>
      <label htmlFor={name} style={labelStyle}>
        {label}
        {required && <span style={requiredStyle} aria-label="required">*</span>}
      </label>
      
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        style={selectStyle}
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
        <span id={`${name}-error`} style={errorTextStyle} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;