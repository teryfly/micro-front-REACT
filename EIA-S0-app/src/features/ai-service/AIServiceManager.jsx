/**
 * AI Service Management Container
 * Orchestrates all AI Service CRUD operations and UI components
 * @module AIServiceManager
 */

import React, { useState } from 'react';
import AIServiceList from './components/AIServiceList';
import AIServiceFormBasic from './components/AIServiceFormBasic';
import AIServiceFormAdvanced from './components/AIServiceFormAdvanced';
import AIServiceDetail from './components/AIServiceDetail';
import { useAIService } from './hooks/useAIService';
import { useAIServiceForm } from './hooks/useAIServiceForm';
import { useModal } from '../../shared/hooks/useModal';
import Modal from '../../shared/ui/Modal/Modal';
import Card from '../../shared/ui/Card';
import Button from '../../shared/ui/Button';

/**
 * AI Service management container component
 * Main entry point for AI Service feature
 */
const AIServiceManager = () => {
  const {
    aiServices,
    selectedAIService,
    loading,
    selectAIService,
    createAIService,
    updateAIService,
  } = useAIService();

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
    resetForm,
  } = useAIServiceForm(null, async (data) => {
    if (editingId) {
      await updateAIService(editingId, data);
    } else {
      await createAIService(data);
    }
    closeForm();
  });

  const handleCreate = () => {
    setEditingId(null);
    resetForm(); // Use dedicated reset method instead of setFormData(null)
    openForm();
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    await selectAIService(id);
    
    // We need to fetch the service first to populate form
    const service = aiServices.find(s => s.id === id);
    
    if (service) {
      setFormData({
        provider: service.provider,
        modelName: service.modelName,
        parameters: JSON.stringify(service.parameters, null, 2),
        retryPolicy: JSON.stringify(service.retryPolicy, null, 2),
        usageLimits: service.usageLimits 
          ? JSON.stringify(service.usageLimits, null, 2)
          : '{}',
      });
      openForm();
    }
  };

  const handleView = async (id) => {
    await selectAIService(id);
    openDetail();
  };

  if (loading && aiServices.length === 0) {
    return <div>Loading AI services...</div>;
  }

  return (
    <Card>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1>AI Service Configuration</h1>
        <Button onClick={handleCreate} variant="primary">
          + Create AI Service
        </Button>
      </div>

      <AIServiceList
        aiServices={aiServices}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
      />

      <Modal 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        title={editingId ? 'Edit AI Service' : 'Create AI Service'}
        size="large"
      >
        {currentStep === 1 ? (
          <AIServiceFormBasic
            formData={formData}
            errors={errors}
            onFieldChange={updateField}
            onNext={nextStep}
            onCancel={closeForm}
          />
        ) : (
          <AIServiceFormAdvanced
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
        title="AI Service Details"
        size="large"
      >
        <AIServiceDetail aiService={selectedAIService} />
      </Modal>
    </Card>
  );
};

export default AIServiceManager;