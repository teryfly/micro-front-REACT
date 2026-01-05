/**
 * Role Form Component
 * Create/Edit role with name and description
 * @module RoleForm
 */

import React from 'react';
import { useForm } from '../../../shared/hooks/useForm';
import Form from '../../../shared/ui/Form/Form';
import Input from '../../../shared/ui/Form/Input';
import TextArea from '../../../shared/ui/Form/TextArea';
import Button from '../../../shared/ui/Button';
import { ROLE_LIMITS } from '../constants/rolePermission.constants';

/**
 * Role form component
 * @param {Object} props
 * @param {Role} [props.role] - Role to edit (null for create)
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 */
const RoleForm = ({ role, onSubmit, onCancel }) => {
  const initialValues = role ? {
    name: role.name,
    description: role.description || '',
  } : {
    name: '',
    description: '',
  };

  const validate = (values) => {
    const errors = {};
    
    if (!values.name || values.name.trim() === '') {
      errors.name = 'Role name is required';
    }
    
    if (values.name && values.name.length > ROLE_LIMITS.ROLE_NAME_MAX_LENGTH) {
      errors.name = `Role name must not exceed ${ROLE_LIMITS.ROLE_NAME_MAX_LENGTH} characters`;
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

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        name="name"
        label="Role Name"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        error={touched.name && errors.name}
        required
        maxLength={ROLE_LIMITS.ROLE_NAME_MAX_LENGTH}
        placeholder="e.g., Administrator, Editor, Viewer"
      />

      <TextArea
        name="description"
        label="Description (Optional)"
        value={values.description}
        onChange={(e) => handleChange('description', e.target.value)}
        rows={3}
        placeholder="Describe the role's purpose and responsibilities..."
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button type="submit" variant="primary" loading={submitting}>
          {role ? 'Update' : 'Create'} Role
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default RoleForm;