import React from 'react';

/**
 * Checkbox component
 */
const Checkbox = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => {
  const checkboxGroupStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    fontSize: '14px',
    color: '#333',
  };

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    accentColor: '#4CAF50',
  };

  return (
    <div style={checkboxGroupStyle}>
      <label style={checkboxLabelStyle} htmlFor={name}>
        <input
          id={name}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={checkboxStyle}
          {...props}
        />
        <span>{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;