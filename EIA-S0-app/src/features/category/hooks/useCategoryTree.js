/**
 * Category Tree State Hook
 * Manages tree structure building and expansion state
 * @module useCategoryTree
 */

import { useState, useCallback, useMemo } from 'react';
import { buildTree } from '../utils/treeUtils';

/**
 * Category tree state management hook
 * @param {Array<DocumentCategory>} categories - Flat category list
 * @returns {Object} Tree state and actions
 * 
 * @example
 * const { treeData, isExpanded, toggleNode } = useCategoryTree(categories);
 */
export const useCategoryTree = (categories) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Memoize tree structure to prevent rebuilds on every render
  const treeData = useMemo(() => {
    return buildTree(categories);
  }, [categories]);

  /**
   * Toggle node expansion state
   */
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  /**
   * Expand all nodes recursively
   */
  const expandAll = useCallback(() => {
    const allIds = new Set();
    
    const traverse = (nodes) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    
    traverse(treeData);
    setExpandedNodes(allIds);
  }, [treeData]);

  /**
   * Collapse all nodes
   */
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  /**
   * Check if a specific node is expanded
   */
  const isExpanded = useCallback((nodeId) => {
    return expandedNodes.has(nodeId);
  }, [expandedNodes]);

  return {
    treeData,
    expandedNodes,
    toggleNode,
    expandAll,
    collapseAll,
    isExpanded,
  };
};