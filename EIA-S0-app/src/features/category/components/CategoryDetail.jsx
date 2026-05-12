/**
 * Category Detail View Component
 * Read-only display with breadcrumb path
 * @module CategoryDetail
 */

import React from 'react';
import Badge from '../../../shared/ui/Badge';
import { formatDate } from '../../../shared/utils/formatting';
import { getCategoryPath, buildTree } from '../utils/treeUtils';

/**
 * Category detail view component
 * @param {Object} props
 * @param {DocumentCategory} props.category - Category entity
 * @param {Array<DocumentCategory>} props.allCategories - All categories (for path calculation)
 */
const CategoryDetail = ({ category, allCategories }) => {
  if (!category) {
    return <div>No data available</div>;
  }

  // Build tree to calculate path
  const tree = buildTree(allCategories);
  const path = getCategoryPath(tree, category.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DetailRow label="Name" value={category.name} />
      <DetailRow label="Description" value={category.description || '-'} />
      
      <DetailRow 
        label="Path" 
        value={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {path.length > 0 ? path.map((cat, index) => (
              <React.Fragment key={cat.id}>
                <Badge type="default">{cat.name}</Badge>
                {index < path.length - 1 && <span>→</span>}
              </React.Fragment>
            )) : (
              <span>Root</span>
            )}
          </div>
        } 
      />
      
      <DetailRow 
        label="Children Count" 
        // Note: category object from flat list might not have children populated
        // We use allCategories to find children count if needed, but here simple check
        value={allCategories.filter(c => c.parentId === category.id).length} 
      />
      
      <DetailRow 
        label="Created At" 
        value={formatDate(category.createdAt)} 
      />
      
      <DetailRow 
        label="Updated At" 
        value={formatDate(category.updatedAt)} 
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

export default CategoryDetail;