/**
 * Prompt Template Management Container
 * Orchestrates all Prompt Template CRUD operations and UI components
 * @module PromptTemplateManager
 */

import React, { useState } from 'react';
import PromptTemplateList from './components/PromptTemplateList';
import PromptTemplateFormBasic from './components/PromptTemplateFormBasic';
import PromptTemplateFormContent from './components/PromptTemplateFormContent';
import PromptTemplateDetail from './components/PromptTemplateDetail';
import VersionHistory from './components/VersionHistory';
import { usePromptTemplate } from './hooks/usePromptTemplate';
import { usePromptTemplateForm } from './hooks/usePromptTemplateForm';
import { useModal } from '../../shared/hooks/useModal';
import Modal from '../../shared/ui/Modal/Modal';
import Card from '../../shared/ui/Card';
import Button from '../../shared/ui/Button';

/**
 * Prompt Template management container component
 * Main entry point for Prompt Template feature
 */
const PromptTemplateManager = () => {
  const {
    promptTemplates,
    selectedTemplate,
    versionHistory,
    loading,
    selectTemplate,
    fetchVersionHistory,
    createTemplate,
    updateTemplate,
  } = usePromptTemplate();

  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isDetailOpen, open: openDetail, close: closeDetail } = useModal();
  const { isOpen: isVersionsOpen, open: openVersions, close: closeVersions } = useModal();
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
    resetForm,
  } = usePromptTemplateForm(null, async (data) => {
    const { overwrite, version, ...submitData } = data;
    
    if (editingId) {
      await updateTemplate(editingId, submitData, overwrite);
    } else {
      await createTemplate(submitData);
    }
    closeForm();
  });

  const handleCreate = () => {
    setEditingId(null);
    resetForm();
    openForm();
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    await selectTemplate(id);
    
    const template = promptTemplates.find(t => t.id === id);
    if (template) {
      setFormData({
        agentName: template.agentName,
        scope: template.scope,
        content: template.content,
        language: template.language,
        aiServiceConfigId: template.aiServiceConfigId,
        version: template.version,
        overwrite: false,
      });
      openForm();
    }
  };

  const handleView = async (id) => {
    await selectTemplate(id);
    await fetchVersionHistory(id);
    openDetail();
  };

  const handleViewVersions = async (id) => {
    await selectTemplate(id);
    await fetchVersionHistory(id);
    openVersions();
  };

  if (loading && promptTemplates.length === 0) {
    return <div>Loading prompt templates...</div>;
  }

  return (
    <Card>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1>Prompt Template Management</h1>
        <Button onClick={handleCreate} variant="primary">
          + Create Template
        </Button>
      </div>

      <PromptTemplateList
        templates={promptTemplates}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onViewVersions={handleViewVersions}
      />

      <Modal 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        title={editingId ? 'Edit Prompt Template' : 'Create Prompt Template'}
        size="large"
      >
        {currentStep === 1 ? (
          <PromptTemplateFormBasic
            formData={formData}
            errors={errors}
            onFieldChange={updateField}
            onNext={nextStep}
            onCancel={closeForm}
          />
        ) : (
          <PromptTemplateFormContent
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
        title="Prompt Template Details"
        size="large"
      >
        <PromptTemplateDetail 
          template={selectedTemplate}
          versions={versionHistory}
        />
      </Modal>

      <Modal 
        isOpen={isVersionsOpen} 
        onClose={closeVersions} 
        title={`Version History - ${selectedTemplate?.agentName}`}
        size="large"
      >
        <VersionHistory 
          versions={versionHistory}
          currentVersion={selectedTemplate?.version}
        />
      </Modal>
    </Card>
  );
};

export default PromptTemplateManager;