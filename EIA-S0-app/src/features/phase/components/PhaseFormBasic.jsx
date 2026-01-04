/**
 * Phase Form - Step 1: Basic Information
 * Phase code, display name, order
 * @module PhaseFormBasic
 */

import React from 'react';
import Form from '../../../shared/ui/Form/Form';
import Input from '../../../shared/ui/Form/Input';
import Button from '../../../shared/ui/Button';

/**
 * Phase form - Step 1: Basic information
 * @param {Object} props
 * @param {Object} props.formData - Form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.onNext - Next step handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} [props.isEditMode=false] - Edit mode flag
 */
const PhaseFormBasic = ({
  formData,
  errors,
  onFieldChange,
  onNext,
  onCancel,
  isEditMode = false
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  // Provide safe defaults if formData is not yet initialized
  const safeData = formData || {
    phaseCode: '',
    displayName: '',
    order: 0,
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        name="phaseCode"
        label="Phase Code"
        value={safeData.phaseCode || ''}
        onChange={(e) => onFieldChange('phaseCode', e.target.value)}
        error={errors.phaseCode}
        required
        disabled={isEditMode}
        maxLength={64}
        placeholder="e.g., DRAFT, REVIEW, APPROVED"
      />

      <Input
        name="displayName"
        label="Display Name"
        value={safeData.displayName || ''}
        onChange={(e) => onFieldChange('displayName', e.target.value)}
        error={errors.displayName}
        required
        maxLength={128}
      />

      <Input
        name="order"
        label="Order"
        type="number"
        value={safeData.order ?? 0}
        onChange={(e) => onFieldChange('order', parseInt(e.target.value, 10) || 0)}
        error={errors.order}
        required
        min={0}
        placeholder="e.g., 10, 20, 30"
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="submit" variant="primary">
          Next: Configure Transitions →
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default PhaseFormBasic;