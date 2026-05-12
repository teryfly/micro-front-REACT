/**
 * System Parameter List Component
 * Displays parameters grouped by type with edit controls
 * @module SystemParamList
 */

import React, { useMemo } from 'react';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import { PARAM_TYPE_LABELS } from '../constants/systemParam.constants';

/**
 * Group parameters by type helper
 * @param {Array} params - System parameters array
 * @returns {Object} Grouped parameters by type
 */
const groupByType = (params) => {
  return params.reduce((groups, param) => {
    const type = param.type || 'unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(param);
    return groups;
  }, {});
};

/**
 * System Parameter list component with type grouping
 * @param {Object} props
 * @param {Array<SystemParameter>} props.params - Parameter array
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.isEditable - Check if parameter is editable
 * @param {boolean} props.loading - Loading state
 */
const SystemParamList = ({ params, onEdit, isEditable, loading }) => {
  // Group parameters by type
  const groupedParams = useMemo(() => {
    return groupByType(params);
  }, [params]);

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: 'var(--color-text-muted)' 
      }}>
        Loading system parameters...
      </div>
    );
  }

  if (params.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: 'var(--color-text-muted)' 
      }}>
        No system parameters found
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {Object.entries(groupedParams).map(([type, typeParams]) => (
        <div key={type}>
          <h3 style={{ 
            marginBottom: '12px',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {PARAM_TYPE_LABELS[type] || type} Parameters
            <Badge type="default">{typeParams.length}</Badge>
          </h3>

          <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            {typeParams.map((param, index) => (
              <div
                key={param.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  borderBottom: index < typeParams.length - 1 
                    ? '1px solid var(--color-border)' 
                    : 'none',
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                }}
              >
                {/* Key */}
                <div style={{ 
                  flex: '0 0 300px',
                  fontWeight: 500,
                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  fontSize: '13px'
                }}>
                  {param.key}
                </div>

                {/* Value */}
                <div style={{ 
                  flex: 1,
                  fontFamily: type === 'json' ? 'monospace' : 'inherit',
                  fontSize: '13px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {type === 'bool' 
                    ? (param.value === 'true' ? '✓ Enabled' : '✗ Disabled')
                    : param.value
                  }
                </div>

                {/* Description */}
                {param.description && (
                  <div style={{ 
                    flex: '0 0 250px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {param.description}
                  </div>
                )}

                {/* Edit Button */}
                <div style={{ flex: '0 0 100px', textAlign: 'right' }}>
                  {isEditable(param.key) ? (
                    <Button 
                      size="small" 
                      variant="primary" 
                      onClick={() => onEdit(param.key)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Badge type="default">Read-only</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SystemParamList;