/**
 * DocType Form - Step 2: Phase Configuration
 * Allowed phases selection and default phase
 * @module DocTypeFormPhases
 */

import React from 'react';
import Form from '../../../shared/ui/Form/Form';
import Select from '../../../shared/ui/Form/Select';
import Checkbox from '../../../shared/ui/Form/Checkbox';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import { usePhase } from '../../phase/hooks/usePhase';

/**
 * DocType form - Step 2: Phase configuration
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
const DocTypeFormPhases = ({
  formData,
  errors,
  onFieldChange,
  onSubmit,
  onBack,
  onCancel,
  isEditMode = false,
  submitting = false
}) => {
  const { phases } = usePhase();

  const handlePhaseToggle = (phaseCode) => {
    const currentPhases = formData.allowedPhases || [];

    if (currentPhases.includes(phaseCode)) {
      const newPhases = currentPhases.filter(p => p !== phaseCode);
      onFieldChange('allowedPhases', newPhases);

      if (formData.defaultPhase === phaseCode) {
        onFieldChange('defaultPhase', '');
      }
    } else {
      onFieldChange('allowedPhases', [...currentPhases, phaseCode]);
    }
  };

  const defaultPhaseOptions = (formData.allowedPhases || []).map(phaseCode => {
    const phase = phases.find(p => p.phaseCode === phaseCode);
    return {
      value: phaseCode,
      label: phase?.displayName || phaseCode,
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <h3>Select Allowed Phases</h3>
        <div style={{ marginBottom: '20px' }}>
          {phases.map(phase => (
            <Checkbox
              key={phase.phaseCode}
              name={`phase-${phase.phaseCode}`}
              label={`${phase.displayName} (${phase.phaseCode})`}
              checked={(formData.allowedPhases || []).includes(phase.phaseCode)}
              onChange={() => handlePhaseToggle(phase.phaseCode)}
            />
          ))}
        </div>
        {errors.allowedPhases && (
          <div style={{ color: 'var(--color-danger)', fontSize: '14px', marginTop: '8px' }}>
            {errors.allowedPhases}
          </div>
        )}
      </div>

      {formData.allowedPhases && formData.allowedPhases.length > 0 && (
        <>
          <div>
            <h3>Selected Phases</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {formData.allowedPhases.map(phaseCode => {
                const phase = phases.find(p => p.phaseCode === phaseCode);
                return (
                  <Badge key={phaseCode} type="info">
                    {phase?.displayName || phaseCode}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Select
            name="defaultPhase"
            label="Default Phase"
            value={formData.defaultPhase}
            onChange={(e) => onFieldChange('defaultPhase', e.target.value)}
            options={defaultPhaseOptions}
            error={errors.defaultPhase}
            required
            placeholder="Select default phase..."
          />
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="button" onClick={onBack} variant="secondary">
          ← Back
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEditMode ? 'Update' : 'Create'} DocType
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default DocTypeFormPhases;