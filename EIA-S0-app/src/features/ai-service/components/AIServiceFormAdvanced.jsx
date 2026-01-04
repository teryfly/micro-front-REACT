/**
 * AI Service Form - Step 2: Advanced Configuration
 * JSON editors for parameters, retry policy, and usage limits
 * @module AIServiceFormAdvanced
 */

import React from 'react';
import Form from '../../../shared/ui/Form/Form';
import Button from '../../../shared/ui/Button';
import JSONEditor from './JSONEditor';

/**
 * AI Service form - Advanced configuration
 * @param {Object} props
 * @param {Object} props.formData - Form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onBack - Back handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} [props.isEditMode=false] - Edit mode flag
 * @param {boolean} [props.submitting=false] - Submitting state
 */
const AIServiceFormAdvanced = ({ 
  formData, 
  errors, 
  onFieldChange, 
  onSubmit, 
  onBack,
  onCancel,
  isEditMode = false,
  submitting = false
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <JSONEditor
        label="Model Parameters"
        value={formData.parameters}
        onChange={(value) => onFieldChange('parameters', value)}
        error={errors.parameters}
        required
        placeholder='{"temperature": 0.7, "max_tokens": 2000}'
      />

      <JSONEditor
        label="Retry Policy"
        value={formData.retryPolicy}
        onChange={(value) => onFieldChange('retryPolicy', value)}
        error={errors.retryPolicy}
        required
        placeholder='{"maxAttempts": 3, "initialDelay": 1000}'
      />

      <JSONEditor
        label="Usage Limits (Optional)"
        value={formData.usageLimits}
        onChange={(value) => onFieldChange('usageLimits', value)}
        error={errors.usageLimits}
        placeholder='{"maxRequestsPerMinute": 60, "maxTokensPerDay": 100000}'
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="button" onClick={onBack} variant="secondary">
          ← Back
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEditMode ? 'Update' : 'Create'} AI Service
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default AIServiceFormAdvanced;