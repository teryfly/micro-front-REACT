/**
 * Category State Management Hook
 * Manages Category list, CRUD operations, and event simulation
 * @module useCategory
 */

import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { simulateEvent } from '../../../shared/utils/eventSimulator';
import { EVENT_TYPES } from '../../../shared/constants/eventTypes';
import { flattenTree } from '../utils/treeUtils';

/**
 * Category state management hook
 * @returns {Object} Category state and CRUD actions
 * 
 * @example
 * const { categories, loading, createCategory, deleteCategory } = useCategory();
 */
export const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API returns tree structure
      const tree = await categoryService.getTree();
      // Flatten it for easier state management and dropdowns
      const flat = flattenTree(tree);
      setCategories(flat);
    } catch (err) {
      setError(err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectCategory = useCallback(async (id) => {
    try {
      const category = await categoryService.getById(id);
      setSelectedCategory(category);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);

  const createCategory = useCallback(async (data) => {
    try {
      const result = await categoryService.create(data);
      
      simulateEvent(EVENT_TYPES.CATEGORY_CREATED, {
        categoryId: result.id,
        name: data.name,
        parentId: data.parentId || null,
        operationType: 'CREATED',
      });
      
      showNotification('Category created successfully', 'success');
      await fetchCategories();
      return result;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchCategories, showNotification]);

  const updateCategory = useCallback(async (id, data) => {
    try {
      await categoryService.update(id, data);
      
      simulateEvent(EVENT_TYPES.CATEGORY_UPDATED, {
        categoryId: id,
        name: data.name,
        parentId: data.parentId || null,
        operationType: 'UPDATED',
      });
      
      showNotification('Category updated successfully', 'success');
      await fetchCategories();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  }, [fetchCategories, showNotification]);

  /**
   * Smart delete category with automatic child handling
   * Checks if category has children and calls appropriate API
   * @param {string} id - Category ID
   * @param {boolean} [forceRecursive=false] - Force recursive delete
   * @returns {Promise<Object>} Deletion result
   */
  const deleteCategory = useCallback(async (id, forceRecursive = false) => {
    try {
      const hasChildren = categoryService.hasChildren(categories, id);
      
      let result;
      
      if (hasChildren && !forceRecursive) {
        // Let the UI handle the prompt, throw special error
        throw new Error('CATEGORY_HAS_CHILDREN');
      }
      
      if (hasChildren) {
        // Delete entire tree
        result = await categoryService.deleteTree(id);
        showNotification('Category and all its descendants deleted successfully', 'success');
      } else {
        // Simple delete
        result = await categoryService.delete(id);
        showNotification('Category deleted successfully', 'success');
      }
      
      simulateEvent(EVENT_TYPES.CATEGORY_DELETED, {
        categoryId: id,
        operationType: hasChildren ? 'DELETED_TREE' : 'DELETED',
      });
      
      await fetchCategories();
      return result;
    } catch (err) {
      // Don't show error notification for the "has children" case
      // This is handled by the UI with a special prompt
      if (err.message !== 'CATEGORY_HAS_CHILDREN') {
        showNotification(err.message, 'error');
      }
      throw err;
    }
  }, [categories, fetchCategories, showNotification]);

  /**
   * Get category info for deletion confirmation
   * @param {string} id - Category ID
   * @returns {Object|null} Category deletion info
   */
  const getCategoryDeleteInfo = useCallback((id) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return null;
    
    const childrenCount = categoryService.getChildrenCount(categories, id);
    
    return {
      category,
      hasChildren: childrenCount > 0,
      childrenCount,
    };
  }, [categories]);

  return {
    categories,
    selectedCategory,
    loading,
    error,
    fetchCategories,
    selectCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryDeleteInfo,
  };
};