/**
 * Phase Form - Step 2: Transition Configuration
 * Configure allowed phase transitions
 * @module PhaseFormTransitions
 */

import React from 'react';
import Form from '../../../shared/ui/Form/Form';
import Button from '../../../shared/ui/Button';
import TransitionEditor from './TransitionEditor';

/**
 * Phase form - Step 2: Transition configuration
 * @param {Object} props
 * @param {Object} props.formData - Form data
 * @param {Object} props.errors - Validation errors
 * @param {Function} props.onFieldChange - Field change handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onBack - Back handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {Array<PhaseDefinition>} props.availablePhases - Available phases
 * @param {boolean} [props.isEditMode=false] - Edit mode flag
 * @param {boolean} [props.submitting=false] - Submitting state
 */
const PhaseFormTransitions = ({
  formData,
  errors,
  onFieldChange,
  onSubmit,
  onBack,
  onCancel,
  availablePhases,
  isEditMode = false,
  submitting = false
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TransitionEditor
        selectedTransitions={formData.allowedTransitions}
        availablePhases={availablePhases}
        currentPhaseCode={formData.phaseCode}
        onChange={(transitions) => onFieldChange('allowedTransitions', transitions)}
        error={errors.allowedTransitions}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="button" onClick={onBack} variant="secondary">
          ← Back
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEditMode ? 'Update' : 'Create'} Phase
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default PhaseFormTransitions;