import React from 'react';
import styles from './Form.module.css';

/**
 * Checkbox component
 * 
 * @param {Object} props
 * @param {string} props.name - Checkbox name and ID
 * @param {string} props.label - Checkbox label
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.disabled=false] - Disabled state
 * 
 * @example
 * <Checkbox
 *   name="agree"
 *   label="I agree to terms and conditions"
 *   checked={agreed}
 *   onChange={(e) => setAgreed(e.target.checked)}
 * />
 */
const Checkbox = ({
  name,
  label,
  checked,
  onChange,
  disabled = false,
  ...props
}) => {
  return (
    <div className={styles.checkboxGroup}>
      <label className={styles.checkboxLabel} htmlFor={name}>
        <input
          id={name}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={styles.checkbox}
          {...props}
        />
        <span>{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;