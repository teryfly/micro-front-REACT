/**
 * Transition Editor Component
 * Multi-select allowed transitions with self-transition prevention
 * @module TransitionEditor
 */

import React from 'react';
import Checkbox from '../../../shared/ui/Form/Checkbox';
import Badge from '../../../shared/ui/Badge';

/**
 * Transition editor - Multi-select allowed transitions
 * @param {Object} props
 * @param {Array<string>} props.selectedTransitions - Selected transition codes
 * @param {Array<PhaseDefinition>} props.availablePhases - Available phases
 * @param {string} props.currentPhaseCode - Current phase code (to exclude self)
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.error] - Error message
 */
const TransitionEditor = ({
  selectedTransitions,
  availablePhases,
  currentPhaseCode,
  onChange,
  error
}) => {
  const handleToggle = (phaseCode) => {
    const current = selectedTransitions || [];

    if (current.includes(phaseCode)) {
      onChange(current.filter(code => code !== phaseCode));
    } else {
      onChange([...current, phaseCode]);
    }
  };

  const selectablePhases = availablePhases.filter(
    phase => phase.phaseCode !== currentPhaseCode
  );

  return (
    <div>
      <h3>Select Allowed Transitions</h3>
      <p style={{
        fontSize: '14px',
        color: 'var(--color-text-muted)',
        marginBottom: '16px'
      }}>
        Choose which phases this phase can transition to.
      </p>

      <div style={{ marginBottom: '16px' }}>
        {selectablePhases.map(phase => (
          <Checkbox
            key={phase.phaseCode}
            name={`transition-${phase.phaseCode}`}
            label={`${phase.displayName} (${phase.phaseCode})`}
            checked={(selectedTransitions || []).includes(phase.phaseCode)}
            onChange={() => handleToggle(phase.phaseCode)}
          />
        ))}
      </div>

      {selectedTransitions && selectedTransitions.length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>
            Selected Transitions:
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedTransitions.map(code => {
              const phase = availablePhases.find(p => p.phaseCode === code);
              return (
                <Badge key={code} type="info">
                  {phase?.displayName || code}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          color: 'var(--color-danger)',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default TransitionEditor;