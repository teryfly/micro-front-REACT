/**
 * DocType Form - Step 1: Basic Information
 * Code, name, description, category, AI template
 * @module DocTypeFormBasic
 */

import React, { useMemo } from 'react';
import Form from '../../../shared/ui/Form/Form';
import Input from '../../../shared/ui/Form/Input';
import Select from '../../../shared/ui/Form/Select';
import TextArea from '../../../shared/ui/Form/TextArea';
import Button from '../../../shared/ui/Button';
import { DOCTYPE_LIMITS } from '../constants/docType.constants';
import { useCategory } from '../../category/hooks/useCategory';
import { usePromptTemplate } from '../../prompt-template/hooks/usePromptTemplate';

/**
 * DocType form - Step 1: Basic information
 * @param {Object} props
 * @param {Object} props.formData - Form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.onNext - Next step handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} [props.isEditMode=false] - Edit mode flag
 */
const DocTypeFormBasic = ({ 
  formData, 
  errors, 
  onFieldChange, 
  onNext, 
  onCancel,
  isEditMode = false
}) => {
  // Use real category data
  const { categories } = useCategory();
  
  // Use real prompt template data
  const { promptTemplates } = usePromptTemplate();

  // Transform categories to options
  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories]);

  // Filter prompt templates by DocType scope and transform to options
  const promptTemplateOptions = useMemo(() => {
    return promptTemplates
      .filter(template => template.scope === 'DocType')
      .map(template => ({
        value: template.id,
        label: `${template.agentName} (v${template.version})`,
      }));
  }, [promptTemplates]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        name="code"
        label="DocType Code"
        value={formData.code}
        onChange={(e) => onFieldChange('code', e.target.value)}
        error={errors.code}
        required
        disabled={isEditMode}
        maxLength={DOCTYPE_LIMITS.CODE_MAX_LENGTH}
        placeholder="e.g., CONTRACT, POLICY"
      />

      <Input
        name="name"
        label="Name"
        value={formData.name}
        onChange={(e) => onFieldChange('name', e.target.value)}
        error={errors.name}
        required
        maxLength={DOCTYPE_LIMITS.NAME_MAX_LENGTH}
      />

      <TextArea
        name="description"
        label="Description"
        value={formData.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
        rows={4}
        maxLength={DOCTYPE_LIMITS.DESCRIPTION_MAX_LENGTH}
      />

      <Select
        name="categoryId"
        label="Category"
        value={formData.categoryId}
        onChange={(e) => onFieldChange('categoryId', e.target.value)}
        options={categoryOptions}
        placeholder="Select category..."
      />

      <Select
        name="aiDraftPromptTemplateId"
        label="AI Draft Prompt Template"
        value={formData.aiDraftPromptTemplateId}
        onChange={(e) => onFieldChange('aiDraftPromptTemplateId', e.target.value)}
        options={promptTemplateOptions}
        placeholder="Select template..."
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="submit" variant="primary">
          Next: Configure Phases →
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default DocTypeFormBasic;