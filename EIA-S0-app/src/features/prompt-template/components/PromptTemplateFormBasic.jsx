/**
 * Prompt Template Form - Step 1: Basic Information
 * Agent name, scope, language, AI service binding
 * @module PromptTemplateFormBasic
 */

import React, { useState, useEffect } from 'react';
import Form from '../../../shared/ui/Form/Form';
import Input from '../../../shared/ui/Form/Input';
import Select from '../../../shared/ui/Form/Select';
import Button from '../../../shared/ui/Button';
import { TEMPLATE_SCOPES, TEMPLATE_LANGUAGES, TEMPLATE_LIMITS } from '../constants/promptTemplate.constants';
import { useAIService } from '../../ai-service/hooks/useAIService';

/**
 * Prompt Template form - Basic information
 * @param {Object} props
 * @param {Object} props.formData - Form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.onNext - Next step handler
 * @param {Function} props.onCancel - Cancel handler
 */
const PromptTemplateFormBasic = ({ 
  formData, 
  errors, 
  onFieldChange, 
  onNext, 
  onCancel 
}) => {
  const { aiServices } = useAIService();

  const scopeOptions = Object.values(TEMPLATE_SCOPES).map(scope => ({
    value: scope,
    label: scope,
  }));

  const languageOptions = Object.entries(TEMPLATE_LANGUAGES).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase(),
  }));

  const aiServiceOptions = aiServices.map(service => ({
    value: service.id,
    label: `${service.provider} - ${service.modelName}`,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  // Defensive check for formData
  if (!formData) {
    return <div>Loading form...</div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        name="agentName"
        label="Agent Name"
        value={formData.agentName || ''}
        onChange={(e) => onFieldChange('agentName', e.target.value)}
        error={errors.agentName}
        required
        maxLength={TEMPLATE_LIMITS.AGENT_NAME_MAX_LENGTH}
        placeholder="e.g., DocumentDraftAgent, ReviewAgent"
      />

      <Select
        name="scope"
        label="Scope"
        value={formData.scope || ''}
        onChange={(e) => onFieldChange('scope', e.target.value)}
        error={errors.scope}
        options={scopeOptions}
        required
      />

      <Select
        name="language"
        label="Language"
        value={formData.language || ''}
        onChange={(e) => onFieldChange('language', e.target.value)}
        error={errors.language}
        options={languageOptions}
        required
      />

      <Select
        name="aiServiceConfigId"
        label="AI Service"
        value={formData.aiServiceConfigId || ''}
        onChange={(e) => onFieldChange('aiServiceConfigId', e.target.value)}
        error={errors.aiServiceConfigId}
        options={aiServiceOptions}
        required
        placeholder="Select AI service..."
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="submit" variant="primary">
          Next: Edit Content →
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default PromptTemplateFormBasic;