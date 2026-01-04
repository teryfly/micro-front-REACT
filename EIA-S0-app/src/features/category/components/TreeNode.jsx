/**
 * Recursive Tree Node Component
 * Renders a single node content row. Recursion is handled by parent.
 * @module TreeNode
 */

import React from 'react';
import Button from '../../../shared/ui/Button';

/**
 * Tree node component (Presentation only)
 * @param {Object} props
 * @param {DocumentCategory} props.node - Category node
 * @param {number} props.level - Tree depth level
 * @param {boolean} props.isExpanded - Expansion state
 * @param {Function} props.onToggle - Toggle expansion handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onAddChild - Add child handler
 */
const TreeNode = ({ 
  node, 
  level, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete,
  onAddChild 
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 24;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      marginLeft: `${indent}px`,
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: level % 2 === 0 ? 'white' : '#fafafa',
      transition: 'background-color 0.2s',
    }}>
      {/* Expand/Collapse Button */}
      <button
        onClick={() => onToggle(node.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: hasChildren ? 'pointer' : 'default',
          padding: '4px',
          fontSize: '14px',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          visibility: hasChildren ? 'visible' : 'hidden',
          color: 'var(--color-text-muted)',
        }}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        {hasChildren && (isExpanded ? '▼' : '▶')}
      </button>

      {/* Category Icon */}
      <span style={{ fontSize: '18px' }} aria-hidden="true">📁</span>

      {/* Category Name */}
      <span style={{ flex: 1, fontWeight: 500, color: 'var(--color-text)' }}>
        {node.name}
      </span>

      {/* Description (Truncated) */}
      {node.description && (
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--color-text-muted)',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginRight: '16px'
        }}>
          {node.description}
        </span>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <Button 
          size="small" 
          variant="secondary"
          onClick={() => onAddChild(node.id)}
          title="Add Child Category"
        >
          + Child
        </Button>
        <Button 
          size="small" 
          variant="primary" 
          onClick={() => onEdit(node.id)}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          variant="danger" 
          onClick={() => onDelete(node.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TreeNode;