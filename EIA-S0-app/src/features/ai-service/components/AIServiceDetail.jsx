/**
 * AI Service Detail View Component
 * Read-only display of AI Service configuration
 * @module AIServiceDetail
 */

import React from 'react';
import Badge from '../../../shared/ui/Badge';
import { formatDate } from '../../../shared/utils/formatting';

/**
 * AI Service detail view component
 * @param {Object} props
 * @param {AIServiceConfig} props.aiService - AI service entity
 */
const AIServiceDetail = ({ aiService }) => {
  if (!aiService) {
    return <div>No data available</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DetailRow 
        label="Provider" 
        value={<Badge type="info">{aiService.provider}</Badge>} 
      />
      
      <DetailRow label="Model Name" value={aiService.modelName} />
      
      <DetailRow 
        label="Parameters" 
        value={
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '200px',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(aiService.parameters, null, 2)}
          </pre>
        } 
      />
      
      <DetailRow 
        label="Retry Policy" 
        value={
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(aiService.retryPolicy, null, 2)}
          </pre>
        } 
      />
      
      {aiService.usageLimits && (
        <DetailRow 
          label="Usage Limits" 
          value={
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(aiService.usageLimits, null, 2)}
            </pre>
          } 
        />
      )}
      
      <DetailRow 
        label="Created At" 
        value={formatDate(aiService.createdAt)} 
      />
      
      <DetailRow 
        label="Updated At" 
        value={formatDate(aiService.updatedAt)} 
      />
    </div>
  );
};

/**
 * Detail row component
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

export default AIServiceDetail;