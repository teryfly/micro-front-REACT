import React from 'react';

/**
 * TextArea component for multi-line text input
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

  const textareaStyle = {
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: `1px solid ${error ? '#f44336' : '#ddd'}`,
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#333',
    resize: 'vertical',
    minHeight: '80px',
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
      
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        style={textareaStyle}
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

export default TextArea;