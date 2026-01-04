/**
 * DocType Detail View Component
 * Read-only display of DocType information
 * @module DocTypeDetail
 */

import React from 'react';
import Badge from '../../../shared/ui/Badge';
import { formatDate } from '../../../shared/utils/formatting';

/**
 * DocType detail view component
 * @param {Object} props
 * @param {DocType} props.docType - DocType entity
 * 
 * @example
 * <DocTypeDetail docType={selectedDocType} />
 */
const DocTypeDetail = ({ docType }) => {
  if (!docType) {
    return <div>No data available</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DetailRow label="Code" value={docType.code} />
      <DetailRow label="Name" value={docType.name} />
      <DetailRow label="Description" value={docType.description || '-'} />
      
      <DetailRow 
        label="Category" 
        value={docType.category?.name || '-'} 
      />
      
      <DetailRow 
        label="AI Draft Template" 
        value={docType.aiDraftPromptTemplate?.name || '-'} 
      />
      
      <DetailRow 
        label="Default Phase" 
        value={<Badge type="info">{docType.defaultPhase}</Badge>} 
      />
      
      <DetailRow 
        label="Allowed Phases" 
        value={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(docType.allowedPhases || []).map(phase => (
              <Badge key={phase} type="default">{phase}</Badge>
            ))}
          </div>
        } 
      />
      
      <DetailRow 
        label="Created At" 
        value={formatDate(docType.createdAt)} 
      />
      
      <DetailRow 
        label="Updated At" 
        value={formatDate(docType.updatedAt)} 
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

export default DocTypeDetail;