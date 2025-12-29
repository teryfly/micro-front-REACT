import React from 'react';

/**
 * Toggle switch component
 */
const Switch = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => {
  const switchGroupStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const switchLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#333',
  };

  const switchContainerStyle = {
    position: 'relative',
    width: '44px',
    height: '24px',
    flexShrink: 0,
  };

  const switchInputStyle = {
    opacity: 0,
    width: 0,
    height: 0,
    position: 'absolute',
  };

  const switchSliderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: checked ? '#4CAF50' : '#e0e0e0',
    borderRadius: '24px',
    transition: 'background-color 0.3s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const switchKnobStyle = {
    position: 'absolute',
    height: '18px',
    width: '18px',
    left: checked ? '23px' : '3px',
    bottom: '3px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'left 0.3s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  return (
    <div style={switchGroupStyle}>
      <label style={switchLabelStyle} htmlFor={name}>
        <span>{label}</span>
        <div style={switchContainerStyle}>
          <input
            id={name}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            style={switchInputStyle}
            role="switch"
            aria-checked={checked}
            {...props}
          />
          <span style={switchSliderStyle} aria-hidden="true">
            <span style={switchKnobStyle}></span>
          </span>
        </div>
      </label>
    </div>
  );
};

export default Switch;