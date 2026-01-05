/**
 * Prompt Template Detail View Component
 * Read-only display of template information with content
 * @module PromptTemplateDetail
 */

import React from 'react';
import Badge from '../../../shared/ui/Badge';
import { formatDate } from '../../../shared/utils/formatting';

/**
 * Prompt Template detail view component
 * @param {Object} props
 * @param {PromptTemplate} props.template - Template entity
 * @param {Array<PromptTemplateVersion>} [props.versions] - Version history
 */
const PromptTemplateDetail = ({ template, versions }) => {
  if (!template) {
    return <div>No data available</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DetailRow label="Agent Name" value={template.agentName} />
      
      <DetailRow 
        label="Scope" 
        value={<Badge type="info">{template.scope}</Badge>} 
      />
      
      <DetailRow 
        label="Version" 
        value={<Badge type="success">v{template.version}</Badge>} 
      />
      
      <DetailRow 
        label="Language" 
        value={template.language.toUpperCase()} 
      />
      
      <DetailRow 
        label="AI Service" 
        value={template.aiServiceConfig 
          ? `${template.aiServiceConfig.provider} - ${template.aiServiceConfig.modelName}`
          : '-'
        } 
      />
      
      <DetailRow 
        label="Content" 
        value={
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '300px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
          }}>
            {template.content}
          </pre>
        } 
      />
      
      <DetailRow 
        label="Created At" 
        value={formatDate(template.createdAt)} 
      />
      
      <DetailRow 
        label="Updated At" 
        value={formatDate(template.updatedAt)} 
      />
      
      {/* Version History Summary */}
      {versions && versions.length > 1 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#f0f8ff',
          borderRadius: '4px'
        }}>
          <strong>Total Versions:</strong> {versions.length}
          <br />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Click "Versions" button to view full history
          </span>
        </div>
      )}
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

export default PromptTemplateDetail;