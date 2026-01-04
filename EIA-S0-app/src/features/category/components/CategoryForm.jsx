/**
 * Category Form Component
 * Create/Edit form with circular reference validation
 * @module CategoryForm
 */

import React, { useMemo } from 'react';
import { useForm } from '../../../shared/hooks/useForm';
import Form from '../../../shared/ui/Form/Form';
import Input from '../../../shared/ui/Form/Input';
import Select from '../../../shared/ui/Form/Select';
import TextArea from '../../../shared/ui/Form/TextArea';
import Button from '../../../shared/ui/Button';
import { getDescendantIds } from '../utils/treeUtils';

/**
 * Category form component
 * @param {Object} props
 * @param {DocumentCategory} [props.category] - Category to edit (null for create)
 * @param {string} [props.parentId] - Parent ID for new child
 * @param {Array<DocumentCategory>} props.allCategories - All categories (for parent selection)
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 */
const CategoryForm = ({ 
  category, 
  parentId,
  allCategories,
  onSubmit, 
  onCancel 
}) => {
  const initialValues = category ? {
    name: category.name,
    description: category.description || '',
    parentId: category.parentId || '',
  } : {
    name: '',
    description: '',
    parentId: parentId || '',
  };

  const validate = (values) => {
    const errors = {};
    
    if (!values.name) {
      errors.name = 'Name is required';
    }
    
    // Circular reference validation
    if (category && values.parentId) {
      // Check if trying to move to itself
      if (values.parentId === category.id) {
        errors.parentId = 'Category cannot be its own parent';
      } else {
        // Check if trying to move to a descendant
        const descendants = getDescendantIds(category);
        if (descendants.includes(values.parentId)) {
          errors.parentId = 'Cannot move category to its own descendant';
        }
      }
    }
    
    return errors;
  };

  const {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues, onSubmit, validate);

  // Build parent options (exclude self and descendants)
  const parentOptions = useMemo(() => {
    let availableCategories = allCategories;
    
    if (category) {
      const descendants = getDescendantIds(category);
      availableCategories = allCategories.filter(
        cat => cat.id !== category.id && !descendants.includes(cat.id)
      );
    }
    
    return availableCategories.map(cat => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [allCategories, category]);

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        name="name"
        label="Category Name"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        error={touched.name && errors.name}
        required
        maxLength={128}
      />

      <TextArea
        name="description"
        label="Description"
        value={values.description}
        onChange={(e) => handleChange('description', e.target.value)}
        rows={4}
      />

      <Select
        name="parentId"
        label="Parent Category"
        value={values.parentId}
        onChange={(e) => handleChange('parentId', e.target.value)}
        onBlur={() => handleBlur('parentId')}
        error={touched.parentId && errors.parentId}
        options={parentOptions}
        placeholder="Select parent (leave empty for root category)"
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="submit" variant="primary" loading={submitting}>
          {category ? 'Update' : 'Create'} Category
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default CategoryForm;