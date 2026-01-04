/**
 * Category Tree View Component
 * Renders the full category tree structure
 * @module CategoryTreeView
 */

import React from 'react';
import TreeNode from './TreeNode';
import { useCategoryTree } from '../hooks/useCategoryTree';

/**
 * Category tree view component
 * @param {Object} props
 * @param {Array<DocumentCategory>} props.categories - Flat category list
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onAddChild - Add child handler
 */
const CategoryTreeView = ({ categories, onEdit, onDelete, onAddChild }) => {
  const { treeData, isExpanded, toggleNode } = useCategoryTree(categories);

  if (treeData.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: 'var(--color-text-muted)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        backgroundColor: 'var(--color-bg-light)'
      }}>
        No categories found. Create your first category to get started.
      </div>
    );
  }

  // Recursive render helper to pass isExpanded correctly
  const renderNode = (node, level) => (
    <TreeNode
      key={node.id}
      node={node}
      level={level}
      isExpanded={isExpanded(node.id)}
      onToggle={toggleNode}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddChild={onAddChild}
    />
  );

  // Override TreeNode's internal recursion with this controlled recursion
  // We need to modify TreeNode to accept children as prop or handle recursion internally
  // In previous step TreeNode handles recursion, but it needs the isExpanded checker.
  // Let's refactor TreeNode usage here.
  
  // Actually, TreeNode as implemented in step 6 expects `isExpanded` boolean.
  // But inside TreeNode, it maps children and passes `isExpanded`.
  // This is a bug in step 6. The child's expanded state is independent.
  // We need to pass the `isExpanded` CHECKER function or the set.
  
  // Correction: We will use a render prop pattern or context in a real app.
  // For this implementation, let's update TreeNode to accept `checkExpanded` function.
  
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '4px',
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      {treeData.map(node => (
        <RecursiveTreeNode
          key={node.id}
          node={node}
          level={0}
          isExpanded={isExpanded}
          onToggle={toggleNode}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
};

// Helper component to handle recursion correctly with state
const RecursiveTreeNode = ({ 
  node, 
  level, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete,
  onAddChild 
}) => {
  const expanded = isExpanded(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <React.Fragment>
      {/* Re-use the TreeNode presentation logic but handle recursion here */}
      <TreeNode
        node={node}
        level={level}
        isExpanded={expanded}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddChild={onAddChild}
      />
      
      {hasChildren && expanded && (
        <div>
          {node.children.map(child => (
            <RecursiveTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

export default CategoryTreeView;