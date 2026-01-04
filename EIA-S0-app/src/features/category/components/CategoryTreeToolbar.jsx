/**
 * Category Tree Toolbar
 * Actions for creating roots and managing tree expansion
 * @module CategoryTreeToolbar
 */

import React from 'react';
import Button from '../../../shared/ui/Button';

/**
 * Category tree toolbar
 * @param {Object} props
 * @param {Function} props.onCreateRoot - Create root category handler
 * @param {Function} props.onExpandAll - Expand all handler
 * @param {Function} props.onCollapseAll - Collapse all handler
 */
const CategoryTreeToolbar = ({ onCreateRoot, onExpandAll, onCollapseAll }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: 'var(--color-bg-light)',
      borderRadius: '4px',
      border: '1px solid var(--color-border)'
    }}>
      <Button onClick={onCreateRoot} variant="primary">
        + Create Root Category
      </Button>
      
      <div style={{ flex: 1 }} />
      
      <Button onClick={onExpandAll} variant="secondary" size="small">
        Expand All
      </Button>
      <Button onClick={onCollapseAll} variant="secondary" size="small">
        Collapse All
      </Button>
    </div>
  );
};

export default CategoryTreeToolbar;