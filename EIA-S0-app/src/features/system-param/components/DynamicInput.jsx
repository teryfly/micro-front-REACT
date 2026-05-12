/**
 * Dynamic Input Component
 * Type-aware input renderer based on parameter type
 * @module DynamicInput
 */

import React from 'react';
import Input from '../../../shared/ui/Form/Input';
import Switch from '../../../shared/ui/Form/Switch';
import JSONEditor from '../../ai-service/components/JSONEditor';
import { PARAM_TYPES } from '../constants/systemParam.constants';

/**
 * Type-aware input component
 * Renders different input components based on parameter type
 * @param {Object} props
 * @param {string} props.type - Parameter type (string | int | bool | json)
 * @param {string} props.value - Parameter value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.disabled=false] - Disabled state
 */
const DynamicInput = ({ type, value, onChange, error, disabled = false }) => {
  switch (type) {
    case PARAM_TYPES.STRING:
      return (
        <Input
          name="value"
          label="Value"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          disabled={disabled}
          required
          maxLength={256}
          placeholder="Enter string value..."
        />
      );

    case PARAM_TYPES.INT:
      return (
        <Input
          name="value"
          label="Value"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          disabled={disabled}
          required
          placeholder="Enter integer value..."
        />
      );

    case PARAM_TYPES.BOOL:
      return (
        <Switch
          name="value"
          label="Value"
          checked={value === 'true'}
          onChange={(checked) => onChange(checked ? 'true' : 'false')}
          disabled={disabled}
        />
      );

    case PARAM_TYPES.JSON:
      return (
        <JSONEditor
          label="Value (JSON)"
          value={value}
          onChange={onChange}
          error={error}
          required
          placeholder="{}"
        />
      );

    default:
      return (
        <Input
          name="value"
          label="Value"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          disabled={disabled}
          placeholder="Enter value..."
        />
      );
  }
};

export default DynamicInput;