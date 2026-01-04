/**
 * DocType List Table Component
 * Displays DocTypes with sort, filter, and action buttons
 * @module DocTypeListTable
 */

import React from 'react';
import Table from '../../../shared/ui/Table/Table';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';

/**
 * DocType list table component
 * @param {Object} props
 * @param {Array<DocType>} props.docTypes - DocType array
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onView - View handler
 * @param {Function} props.onDelete - Delete handler
 * 
 * @example
 * <DocTypeListTable
 *   docTypes={docTypes}
 *   loading={loading}
 *   onEdit={handleEdit}
 *   onView={handleView}
 *   onDelete={handleDelete}
 * />
 */
const DocTypeListTable = ({ docTypes, loading, onEdit, onView, onDelete }) => {
  const columns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => row.category?.name || '-',
    },
    {
      key: 'defaultPhase',
      label: 'Default Phase',
      render: (row) => (
        <Badge type="info">{row.defaultPhase}</Badge>
      ),
    },
    {
      key: 'allowedPhases',
      label: 'Allowed Phases',
      render: (row) => (
        <span>{row.allowedPhases?.length || 0} phases</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="small" onClick={() => onView(row.id)}>
            View
          </Button>
          <Button size="small" variant="primary" onClick={() => onEdit(row.id)}>
            Edit
          </Button>
          <Button size="small" variant="danger" onClick={() => onDelete(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      data={docTypes}
      columns={columns}
      loading={loading}
      onRowClick={(row) => onView(row.id)}
      emptyMessage="No document types found"
    />
  );
};

export default DocTypeListTable;