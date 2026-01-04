import React from 'react';
import styles from './Form.module.css';

/**
 * Toggle switch component
 * Modern alternative to checkbox for boolean settings
 * 
 * @param {Object} props
 * @param {string} props.name - Switch name and ID
 * @param {string} props.label - Switch label
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.disabled=false] - Disabled state
 * 
 * @example
 * <Switch
 *   name="notifications"
 *   label="Enable notifications"
 *   checked={notificationsEnabled}
 *   onChange={(e) => setNotificationsEnabled(e.target.checked)}
 * />
 */
const Switch = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => {
  return (
    <div className={styles.switchGroup}>
      <label className={styles.switchLabel} htmlFor={name}>
        <span>{label}</span>
        <div className={styles.switchContainer}>
          <input
            id={name}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={styles.switchInput}
            role="switch"
            aria-checked={checked}
            {...props}
          />
          <span className={styles.switchSlider} aria-hidden="true"></span>
        </div>
      </label>
    </div>
  );
};

export default Switch;