/**
 * DocType Manager
 * Main container for DocType management
 */

import React, { useState } from 'react';
import { useDocType } from './hooks/useDocType';
import { useModal } from '../../core/hooks';
import { Card, Button, Table, Modal, Badge } from '../../ui/components';

const DocTypeManager = () => {
  const {
    docTypes,
    selectedDocType,
    loading,
    selectDocType,
    createDocType,
    updateDocType,
    deleteDocType,
  } = useDocType();

  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen: isDetailOpen, open: openDetail, close: closeDetail } = useModal();

  const handleView = async (id) => {
    await selectDocType(id);
    openDetail();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this DocType?')) {
      await deleteDocType(id);
    }
  };

  const filteredDocTypes = docTypes.filter(dt =>
    dt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dt.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', render: (row) => row.category?.name || '-' },
    { key: 'defaultPhase', label: 'Default Phase', render: (row) => <Badge type="info">{row.defaultPhase}</Badge> },
    { key: 'allowedPhases', label: 'Allowed Phases', render: (row) => `${row.allowedPhases?.length || 0} phases` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="small" onClick={(e) => { e.stopPropagation(); handleView(row.id); }}>View</Button>
          <Button size="small" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <h1 style={{ marginBottom: '24px' }}>Document Type Management</h1>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
        <Button variant="primary">+ Create DocType</Button>
      </div>
      
      <Table
        data={filteredDocTypes}
        columns={columns}
        loading={loading}
        onRowClick={(row) => handleView(row.id)}
        emptyMessage="No document types found"
      />

      <Modal isOpen={isDetailOpen} onClose={closeDetail} title="DocType Details" size="medium">
        {selectedDocType && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><strong>Code:</strong> {selectedDocType.code}</div>
            <div><strong>Name:</strong> {selectedDocType.name}</div>
            <div><strong>Description:</strong> {selectedDocType.description || '-'}</div>
            <div><strong>Category:</strong> {selectedDocType.category?.name || '-'}</div>
            <div><strong>Default Phase:</strong> <Badge type="info">{selectedDocType.defaultPhase}</Badge></div>
            <div>
              <strong>Allowed Phases:</strong>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {(selectedDocType.allowedPhases || []).map(phase => (
                  <Badge key={phase} type="default">{phase}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default DocTypeManager;