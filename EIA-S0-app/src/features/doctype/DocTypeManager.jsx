/**
 * DocType Management Container
 * Orchestrates all DocType CRUD operations and UI components
 * @module DocTypeManager
 */

import React, { useState } from 'react';
import DocTypeListTable from './components/DocTypeListTable';
import DocTypeListToolbar from './components/DocTypeListToolbar';
import DocTypeFormBasic from './components/DocTypeFormBasic';
import DocTypeFormPhases from './components/DocTypeFormPhases';
import DocTypeDetail from './components/DocTypeDetail';
import { useDocType } from './hooks/useDocType';
import { useDocTypeForm } from './hooks/useDocTypeForm';
import { useModal } from '../../shared/hooks/useModal';
import Modal from '../../shared/ui/Modal/Modal';
import Card from '../../shared/ui/Card';

/**
 * DocType management container component
 * Main entry point for DocType feature
 */
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
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isDetailOpen, open: openDetail, close: closeDetail } = useModal();
  const [editingId, setEditingId] = useState(null);

  const {
    formData,
    currentStep,
    errors,
    updateField,
    nextStep,
    prevStep,
    handleSubmit,
    setFormData,
  } = useDocTypeForm(null, async (data) => {
    if (editingId) {
      await updateDocType(editingId, data);
    } else {
      await createDocType(data);
    }
    closeForm();
  });

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      aiDraftPromptTemplateId: '',
      allowedPhases: [],
      defaultPhase: '',
      metadata: {},
      customFields: {},
    });
    openForm();
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    await selectDocType(id);
    setFormData(selectedDocType);
    openForm();
  };

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

  return (
    <Card>
      <h1>Document Type Management</h1>
      
      <DocTypeListToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={handleCreate}
      />
      
      <DocTypeListTable
        docTypes={filteredDocTypes}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        title={editingId ? 'Edit DocType' : 'Create DocType'}
        size="large"
      >
        {currentStep === 1 ? (
          <DocTypeFormBasic
            formData={formData}
            errors={errors}
            onFieldChange={updateField}
            onNext={nextStep}
            onCancel={closeForm}
            isEditMode={!!editingId}
          />
        ) : (
          <DocTypeFormPhases
            formData={formData}
            errors={errors}
            onFieldChange={updateField}
            onSubmit={handleSubmit}
            onBack={prevStep}
            onCancel={closeForm}
            isEditMode={!!editingId}
          />
        )}
      </Modal>

      <Modal 
        isOpen={isDetailOpen} 
        onClose={closeDetail} 
        title="DocType Details"
      >
        <DocTypeDetail docType={selectedDocType} />
      </Modal>
    </Card>
  );
};

export default DocTypeManager;