/**
 * JSON Editor Component
 * Text area with JSON validation, formatting, and error display
 * @module JSONEditor
 */

import React, { useState, useEffect } from 'react';
import Button from '../../../shared/ui/Button';
import { validateJSON } from '../../../shared/utils/validation';

/**
 * JSON editor component with validation
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.value - JSON string value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.error] - External error message
 * @param {boolean} [props.required=false] - Required field indicator
 * @param {string} [props.placeholder] - Placeholder text
 */
const JSONEditor = ({ 
  label, 
  value, 
  onChange, 
  error,
  required = false,
  placeholder = '{}' 
}) => {
  const [localValue, setLocalValue] = useState(value || '{}');
  const [localError, setLocalError] = useState(null);
  const [isFormatted, setIsFormatted] = useState(false);

  // Sync with parent value updates
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value || '{}');
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setLocalError(null);
    setIsFormatted(false);
    // Propagate change immediately for form state
    onChange(newValue);
  };

  const handleBlur = () => {
    // Validate JSON syntax on blur
    const validationError = validateJSON(localValue, label);
    
    if (validationError) {
      setLocalError(validationError);
    } else {
      setLocalError(null);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(localValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalValue(formatted);
      onChange(formatted);
      setLocalError(null);
      setIsFormatted(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setIsFormatted(false), 3000);
    } catch (err) {
      setLocalError(`Invalid JSON: ${err.message}`);
    }
  };

  const handleReset = () => {
    setLocalValue(placeholder);
    onChange(placeholder);
    setLocalError(null);
    setIsFormatted(false);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <label style={{ 
          fontSize: '14px', 
          fontWeight: 500,
          color: 'var(--color-text)'
        }}>
          {label}
          {required && <span style={{ color: 'var(--color-danger)', marginLeft: '4px' }}>*</span>}
        </label>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="button" 
            size="small" 
            variant="secondary"
            onClick={handleFormat}
            title="Format JSON"
          >
            Format
          </Button>
          <Button 
            type="button" 
            size="small" 
            variant="secondary"
            onClick={handleReset}
            title="Reset to default"
          >
            Reset
          </Button>
        </div>
      </div>

      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        spellCheck="false"
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          border: `1px solid ${localError || error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--border-radius)',
          resize: 'vertical',
          backgroundColor: isFormatted ? '#f0fff0' : 'white',
          color: 'var(--color-text)',
          transition: 'border-color 0.2s, background-color 0.2s',
        }}
      />

      {(localError || error) && (
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--color-danger)',
          marginTop: '4px'
        }}>
          {localError || error}
        </div>
      )}

      {isFormatted && !localError && !error && (
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--color-success)',
          marginTop: '4px'
        }}>
          ✓ JSON formatted successfully
        </div>
      )}
    </div>
  );
};

export default JSONEditor;