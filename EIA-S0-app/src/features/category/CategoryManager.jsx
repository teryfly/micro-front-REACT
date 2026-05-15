/**
 * Category Management Container
 * Orchestrates all Category CRUD operations and UI components
 * @module CategoryManager
 */

import React, { useState } from 'react';
import CategoryTreeView from './components/CategoryTreeView';
import CategoryTreeToolbar from './components/CategoryTreeToolbar';
import CategoryForm from './components/CategoryForm';
import CategoryDetail from './components/CategoryDetail';
import { useCategory } from './hooks/useCategory';
import { useCategoryTree } from './hooks/useCategoryTree';
import { useModal } from '../../shared/hooks/useModal';
import Modal from '../../shared/ui/Modal/Modal';
import Card from '../../shared/ui/Card';
import Button from '../../shared/ui/Button';

/**
 * Category management container component
 * Main entry point for Category feature
 */
const CategoryManager = () => {
  const {
    categories,
    selectedCategory,
    loading,
    selectCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryDeleteInfo,
  } = useCategory();

  // Tree state hook to manage expansion
  const { expandAll, collapseAll } = useCategoryTree(categories);
  
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isDetailOpen, open: openDetail, close: closeDetail } = useModal();
  const { isOpen: isDeleteConfirmOpen, open: openDeleteConfirm, close: closeDeleteConfirm } = useModal();
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [parentIdForNew, setParentIdForNew] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreateRoot = () => {
    setEditingCategory(null);
    setParentIdForNew(null);
    openForm();
  };

  const handleAddChild = (parentId) => {
    setEditingCategory(null);
    setParentIdForNew(parentId);
    openForm();
  };

  const handleEdit = async (id) => {
    await selectCategory(id);
    // Find category in local list for immediate form open
    const cat = categories.find(c => c.id === id);
    setEditingCategory(cat);
    setParentIdForNew(null);
    openForm();
  };

  const handleView = async (id) => {
    await selectCategory(id);
    openDetail();
  };

  const handleDelete = async (id) => {
    const deleteInfo = getCategoryDeleteInfo(id);
    if (!deleteInfo) return;
    
    setDeleteTarget(deleteInfo);
    
    if (deleteInfo.hasChildren) {
      // Show confirmation modal for recursive delete
      openDeleteConfirm();
    } else {
      // Simple delete confirmation
      if (window.confirm(`Are you sure you want to delete "${deleteInfo.category.name}"? This action cannot be undone.`)) {
        try {
          await deleteCategory(id);
        } catch (err) {
          // Error already handled by hook
        }
      }
    }
  };

  const handleConfirmRecursiveDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteCategory(deleteTarget.category.id, true); // Force recursive
    } catch (err) {
      // Error already handled by hook
    } finally {
      closeDeleteConfirm();
      setDeleteTarget(null);
    }
  };

  const handleFormSubmit = async (data) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await createCategory(data);
    }
    closeForm();
  };

  if (loading && categories.length === 0) {
    return <div>Loading categories...</div>;
  }

  return (
    <Card>
      <h1>Category Management</h1>

      <CategoryTreeToolbar
        onCreateRoot={handleCreateRoot}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      <CategoryTreeView
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddChild={handleAddChild}
      />

      <Modal 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <CategoryForm
          category={editingCategory}
          parentId={parentIdForNew}
          allCategories={categories}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <Modal 
        isOpen={isDetailOpen} 
        onClose={closeDetail} 
        title="Category Details"
      >
        <CategoryDetail 
          category={selectedCategory} 
          allCategories={categories}
        />
      </Modal>

      {/* Recursive Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteConfirmOpen} 
        onClose={closeDeleteConfirm} 
        title="Confirm Recursive Deletion"
      >
        {deleteTarget && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>Category:</strong> {deleteTarget.category.name}
            </div>
            
            <div style={{ marginBottom: '16px', color: 'var(--color-danger)' }}>
              <strong>Warning:</strong> This category has {deleteTarget.childrenCount} child categories.
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              Deleting this category will also permanently delete all its descendants. 
              This action cannot be undone.
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button 
                type="button" 
                onClick={closeDeleteConfirm} 
                variant="secondary"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleConfirmRecursiveDelete} 
                variant="danger"
              >
                Delete "{deleteTarget.category.name}" and All Descendants
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default CategoryManager;