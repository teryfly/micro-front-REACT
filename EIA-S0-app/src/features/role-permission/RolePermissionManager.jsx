/**
 * Role Permission Management Container
 * Orchestrates all Role and Permission operations and UI components
 * @module RolePermissionManager
 */

import React, { useState } from 'react';
import RoleList from './components/RoleList';
import PermissionMatrix from './components/PermissionMatrix';
import RoleForm from './components/RoleForm';
import { useRolePermission } from './hooks/useRolePermission';
import { useModal } from '../../shared/hooks/useModal';
import Modal from '../../shared/ui/Modal/Modal';
import Card from '../../shared/ui/Card';
import Button from '../../shared/ui/Button';

/**
 * Role Permission management container component
 * Main entry point for Role Permission feature
 */
const RolePermissionManager = () => {
  const {
    roles,
    rolePermissions,
    selectedRole,
    loading,
    selectRole,
    createRole,
    updateRole,
    deleteRole,
    updatePermissions,
  } = useRolePermission();

  const { isOpen: isRoleFormOpen, open: openRoleForm, close: closeRoleForm } = useModal();
  const { isOpen: isMatrixOpen, open: openMatrix, close: closeMatrix } = useModal();
  const [editingRoleId, setEditingRoleId] = useState(null);

  const handleCreateRole = () => {
    setEditingRoleId(null);
    openRoleForm();
  };

  const handleEditRole = async (id) => {
    setEditingRoleId(id);
    await selectRole(id);
    openRoleForm();
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role? All users with this role will lose their permissions.')) {
      try {
        await deleteRole(id);
      } catch (err) {
        // Error already handled by hook
      }
    }
  };

  const handleManagePermissions = () => {
    openMatrix();
  };

  const handleRoleFormSubmit = async (data) => {
    if (editingRoleId) {
      await updateRole(editingRoleId, data);
    } else {
      await createRole(data);
    }
    closeRoleForm();
  };

  const handlePermissionSave = async (roleId, permissions) => {
    await updatePermissions(roleId, permissions);
  };

  if (loading && roles.length === 0) {
    return (
      <Card>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: 'var(--color-text-muted)' 
        }}>
          Loading roles and permissions...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1>Role & Permission Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={handleCreateRole} variant="primary">
            + Create Role
          </Button>
          <Button onClick={handleManagePermissions} variant="secondary">
            📊 Manage Permissions
          </Button>
        </div>
      </div>

      <div style={{ 
        padding: '12px', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '4px',
        marginBottom: '24px',
        fontSize: '14px',
        color: 'var(--color-text)'
      }}>
        <strong>ℹ️ Info:</strong> Use the "Manage Permissions" button to assign permissions to roles using the permission matrix.
      </div>

      <RoleList
        roles={roles}
        rolePermissions={rolePermissions}
        loading={loading}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        onManagePermissions={handleManagePermissions}
      />

      {/* Role Form Modal */}
      <Modal 
        isOpen={isRoleFormOpen} 
        onClose={closeRoleForm} 
        title={editingRoleId ? 'Edit Role' : 'Create Role'}
      >
        <RoleForm
          role={editingRoleId ? selectedRole : null}
          onSubmit={handleRoleFormSubmit}
          onCancel={closeRoleForm}
        />
      </Modal>

      {/* Permission Matrix Modal */}
      <Modal 
        isOpen={isMatrixOpen} 
        onClose={closeMatrix} 
        title="Permission Matrix"
        size="large"
      >
        <PermissionMatrix
          roles={roles}
          rolePermissions={rolePermissions}
          onSave={handlePermissionSave}
        />
      </Modal>
    </Card>
  );
};

export default RolePermissionManager;