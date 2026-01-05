/**
 * Role List Component
 * Displays table of roles with permission counts and actions
 * @module RoleList
 */

import React from 'react';
import Table from '../../../shared/ui/Table/Table';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import { formatDate } from '../../../shared/utils/formatting';

/**
 * Role list component
 * @param {Object} props
 * @param {Array<Role>} props.roles - Role array
 * @param {Object} props.rolePermissions - Map of roleId → permissions[]
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onManagePermissions - Manage permissions handler
 */
const RoleList = ({ 
  roles, 
  rolePermissions,
  loading, 
  onEdit, 
  onDelete,
  onManagePermissions 
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Role Name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => row.description || '-',
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (row) => {
        const count = rolePermissions[row.id]?.length || 0;
        return (
          <Badge type={count > 0 ? 'info' : 'default'}>
            {count} permission{count !== 1 ? 's' : ''}
          </Badge>
        );
      },
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            size="small" 
            variant="primary"
            onClick={() => onManagePermissions(row.id)}
          >
            Permissions
          </Button>
          <Button 
            size="small" 
            onClick={() => onEdit(row.id)}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            variant="danger" 
            onClick={() => onDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      data={roles}
      columns={columns}
      loading={loading}
      emptyMessage="No roles found. Create your first role to get started."
    />
  );
};

export default RoleList;