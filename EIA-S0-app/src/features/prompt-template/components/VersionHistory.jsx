/**
 * Version History Timeline Component
 * Displays chronological history of template versions
 * @module VersionHistory
 */

import React from 'react';
import Badge from '../../../shared/ui/Badge';
import { formatDate } from '../../../shared/utils/formatting';
import { truncate } from '../../../shared/utils/formatting';

/**
 * Version history timeline component
 * @param {Object} props
 * @param {Array<PromptTemplateVersion>} props.versions - Version history
 * @param {number} [props.currentVersion] - Current version number
 */
const VersionHistory = ({ versions, currentVersion }) => {
  if (!versions || versions.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'var(--color-text-muted)' 
      }}>
        No version history available
      </div>
    );
  }

  // Sort by version descending (newest first)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0 }}>Version History</h3>
      
      <div style={{ position: 'relative', maxHeight: '400px', overflowY: 'auto' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '20px',
          bottom: '20px',
          width: '2px',
          backgroundColor: 'var(--color-border)',
        }} />

        {sortedVersions.map((version, index) => (
          <div 
            key={version.version}
            style={{
              position: 'relative',
              paddingLeft: '40px',
              paddingBottom: index < sortedVersions.length - 1 ? '24px' : '0',
            }}
          >
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '8px',
              top: '8px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: version.version === currentVersion 
                ? 'var(--color-primary)' 
                : 'var(--color-bg-dark)',
              border: `2px solid ${version.version === currentVersion 
                ? 'var(--color-primary)' 
                : 'var(--color-border)'}`,
              zIndex: 1,
            }} />

            {/* Version card */}
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              padding: '12px',
              backgroundColor: version.version === currentVersion 
                ? '#f0f8ff' 
                : 'white',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge type={version.version === currentVersion ? 'success' : 'default'}>
                    Version {version.version}
                  </Badge>
                  {version.version === currentVersion && (
                    <Badge type="success">Current</Badge>
                  )}
                </div>
                
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {formatDate(version.updatedAt)}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Language: {version.language.toUpperCase()}
              </div>

              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '100px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {truncate(version.content, 200)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionHistory;