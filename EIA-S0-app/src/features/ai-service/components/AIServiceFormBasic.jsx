/**
 * AI Service Form - Step 1: Basic Information
 * Provider and model selection
 * @module AIServiceFormBasic
 */

import React from 'react';
import Form from '../../../shared/ui/Form/Form';
import Input from '../../../shared/ui/Form/Input';
import Select from '../../../shared/ui/Form/Select';
import Button from '../../../shared/ui/Button';
import { AI_PROVIDERS, AI_SERVICE_LIMITS } from '../constants/aiService.constants';

/**
 * AI Service form - Basic information
 * @param {Object} props
 * @param {Object} props.formData - Form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.onNext - Next step handler
 * @param {Function} props.onCancel - Cancel handler
 */
const AIServiceFormBasic = ({ 
  formData, 
  errors, 
  onFieldChange, 
  onNext, 
  onCancel 
}) => {
  const providerOptions = Object.values(AI_PROVIDERS).map(provider => ({
    value: provider,
    label: provider,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  // Defensive check: if formData is null/undefined, render loading or return null
  if (!formData) {
    return <div>Loading form...</div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Select
        name="provider"
        label="AI Provider"
        value={formData.provider || ''}
        onChange={(e) => onFieldChange('provider', e.target.value)}
        error={errors.provider}
        options={providerOptions}
        required
      />

      <Input
        name="modelName"
        label="Model Name"
        value={formData.modelName || ''}
        onChange={(e) => onFieldChange('modelName', e.target.value)}
        error={errors.modelName}
        required
        maxLength={AI_SERVICE_LIMITS.MODEL_NAME_MAX_LENGTH}
        placeholder="e.g., gpt-4, gpt-3.5-turbo"
      />

      <div style={{ 
        padding: '12px', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '4px',
        marginTop: '16px',
        fontSize: '14px',
        color: 'var(--color-text)'
      }}>
        <strong>💡 Tip:</strong> Default parameters will be loaded based on the selected provider.
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="submit" variant="primary">
          Next: Configure Parameters →
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default AIServiceFormBasic;