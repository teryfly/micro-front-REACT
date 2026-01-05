/**
 * System Parameter Form Component
 * Create/Edit form with type-aware inputs, editable control, and validation
 * @module SystemParamForm
 */
import React from 'react';
import Form from '../../../shared/ui/Form/Form';
import Input from '../../../shared/ui/Form/Input';
import Select from '../../../shared/ui/Form/Select';
import TextArea from '../../../shared/ui/Form/TextArea';
import Checkbox from '../../../shared/ui/Form/Checkbox';
import Button from '../../../shared/ui/Button';
import DynamicInput from './DynamicInput';
import Badge from '../../../shared/ui/Badge';
import { PARAM_TYPES, PARAM_TYPE_LABELS } from '../constants/systemParam.constants';
/**
 * System Parameter create/edit form
 * @param {Object} props
 * @param {Object} props.formData - Form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} [props.isEditMode=false] - Edit mode flag
 * @param {boolean} [props.submitting=false] - Submitting state
 */
const SystemParamForm = ({ 
  formData, 
  errors, 
  onFieldChange, 
  onSubmit, 
  onCancel,
  isEditMode = false,
  submitting = false
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
  // Defensive check for formData
  if (!formData) {
    return <div>Loading form...</div>;
  }
  const typeOptions = Object.entries(PARAM_TYPES).map(([key, value]) => ({
    value,
    label: PARAM_TYPE_LABELS[value],
  }));
  return (
    <Form onSubmit={handleSubmit}>
      {/* Parameter Key (only in create mode) */}
      {!isEditMode && (
        <Input
          name="key"
          label="Parameter Key"
          value={formData.key || ''}
          onChange={(e) => onFieldChange('key', e.target.value)}
          error={errors.key}
          required
          maxLength={128}
          placeholder="e.g., system.custom.parameter"
        />
      )}
      {/* Read-only Key (in edit mode) */}
      {isEditMode && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: 500,
            color: 'var(--color-text)',
            display: 'block',
            marginBottom: '8px'
          }}>
            Parameter Key
          </label>
          <div style={{
            padding: '10px 12px',
            backgroundColor: '#f5f5f5',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            fontSize: '13px',
          }}>
            {formData.key}
          </div>
        </div>
      )}
      {/* Parameter Type */}
      <Select
        name="type"
        label="Parameter Type"
        value={formData.type || PARAM_TYPES.STRING}
        onChange={(e) => onFieldChange('type', e.target.value)}
        error={errors.type}
        options={typeOptions}
        required
        disabled={isEditMode}
      />
      {/* Dynamic Value Input */}
      <DynamicInput
        type={formData.type || PARAM_TYPES.STRING}
        value={formData.value || ''}
        onChange={(value) => onFieldChange('value', value)}
        error={errors.value}
      />
      {/* Description */}
      <TextArea
        name="description"
        label="Description (Optional)"
        value={formData.description || ''}
        onChange={(e) => onFieldChange('description', e.target.value)}
        rows={3}
      />
      {/* Editable Checkbox (only in create mode) */}
      {!isEditMode && (
        <div style={{ marginTop: '16px' }}>
          <Checkbox
            name="editable"
            label="Mark as editable"
            checked={formData.editable !== false} // Default to true
            onChange={(checked) => onFieldChange('editable', checked)}
          />
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-text-muted)',
            marginTop: '4px',
            marginLeft: '28px'
          }}>
            If checked, this parameter can be edited later from the UI.
            If unchecked, only administrators can modify it.
          </div>
        </div>
      )}
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '4px',
        marginTop: '16px',
        fontSize: '13px',
        color: 'var(--color-text)'
      }}>
        <strong>⚠️ Warning:</strong> Changing system parameters may affect platform behavior.
        Ensure you understand the impact before saving.
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEditMode ? 'Update Parameter' : 'Create Parameter'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};
export default SystemParamForm;