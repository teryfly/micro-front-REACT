/**
 * Phase Detail View Component
 * Read-only display of phase information
 * @module PhaseDetail
 */

import React from 'react';
import Badge from '../../../shared/ui/Badge';
import { formatDate } from '../../../shared/utils/formatting';

/**
 * Phase detail view component
 * @param {Object} props
 * @param {PhaseDefinition} props.phase - Phase entity
 */
const PhaseDetail = ({ phase }) => {
  if (!phase) {
    return <div>No data available</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DetailRow label="Phase Code" value={phase.phaseCode} />
      <DetailRow label="Display Name" value={phase.displayName} />
      <DetailRow label="Order" value={phase.order} />

      <DetailRow
        label="Allowed Transitions"
        value={
          phase.allowedTransitions && phase.allowedTransitions.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {phase.allowedTransitions.map(transition => (
                <Badge key={transition} type="info">{transition}</Badge>
              ))}
            </div>
          ) : (
            <span>None</span>
          )
        }
      />

      <DetailRow
        label="Created At"
        value={formatDate(phase.createdAt)}
      />

      <DetailRow
        label="Updated At"
        value={formatDate(phase.updatedAt)}
      />
    </div>
  );
};

/**
 * Detail row component
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {React.ReactNode} props.value - Field value
 */
const DetailRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: '16px' }}>
    <div style={{
      fontWeight: 600,
      minWidth: '150px',
      color: 'var(--color-text-muted)'
    }}>
      {label}:
    </div>
    <div style={{ flex: 1 }}>
      {value}
    </div>
  </div>
);

export default PhaseDetail;