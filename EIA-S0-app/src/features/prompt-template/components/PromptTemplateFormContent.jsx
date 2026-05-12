/**
 * Prompt Template Form - Step 2: Content Editor
 * Template content editing with character count and overwrite option
 * @module PromptTemplateFormContent
 */

import React from 'react';
import Form from '../../../shared/ui/Form/Form';
import TextArea from '../../../shared/ui/Form/TextArea';
import Checkbox from '../../../shared/ui/Form/Checkbox';
import Button from '../../../shared/ui/Button';
import { TEMPLATE_LIMITS } from '../constants/promptTemplate.constants';

/**
 * Prompt Template form - Content editor
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
const PromptTemplateFormContent = ({ 
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

  const characterCount = formData.content?.length || 0;
  const maxLength = TEMPLATE_LIMITS.CONTENT_MAX_LENGTH;
  const percentUsed = (characterCount / maxLength * 100).toFixed(1);
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        name="content"
        label="Template Content"
        value={formData.content || ''}
        onChange={(e) => onFieldChange('content', e.target.value)}
        error={errors.content}
        required
        rows={15}
        maxLength={maxLength}
        placeholder="Enter your prompt template content here..."
        style={{ 
          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace', 
          fontSize: '13px',
          lineHeight: '1.5'
        }}
      />

      <div style={{ 
        fontSize: '12px', 
        color: isNearLimit ? 'var(--color-warning)' : 'var(--color-text-muted)',
        marginTop: '4px',
        marginBottom: '8px'
      }}>
        {characterCount.toLocaleString()} / {maxLength.toLocaleString()} characters ({percentUsed}%)
        {isNearLimit && ' - Approaching limit'}
      </div>

      {isEditMode && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffc107'
        }}>
          <Checkbox
            name="overwrite"
            label="Overwrite current version (instead of creating new version)"
            checked={formData.overwrite || false}
            onChange={(e) => onFieldChange('overwrite', e.target.checked)}
          />
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-text-muted)',
            marginTop: '8px',
            marginLeft: '28px'
          }}>
            ⚠️ <strong>Warning:</strong> Checking this will replace the current version and cannot be undone.
            <br />
            Unchecked: Creates version {formData.version ? formData.version + 1 : 2}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="button" onClick={onBack} variant="secondary">
          ← Back
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEditMode 
            ? (formData.overwrite ? 'Overwrite Version' : 'Create New Version')
            : 'Create Template'
          }
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default PromptTemplateFormContent;