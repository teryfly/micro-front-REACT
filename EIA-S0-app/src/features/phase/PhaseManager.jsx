/**
 * Phase Management Container
 * Orchestrates all Phase CRUD operations and UI components
 * @module PhaseManager
 */

import React, { useState, useEffect, useMemo } from 'react';
import PhaseList from './components/PhaseList';
import PhaseFormBasic from './components/PhaseFormBasic';
import PhaseFormTransitions from './components/PhaseFormTransitions';
import PhaseDetail from './components/PhaseDetail';
import { usePhase } from './hooks/usePhase';
import { usePhaseForm } from './hooks/usePhaseForm';
import { useModal } from '../../shared/hooks/useModal';
import Modal from '../../shared/ui/Modal/Modal';
import Card from '../../shared/ui/Card';
import Button from '../../shared/ui/Button';

/**
 * Phase management container component
 * Main entry point for Phase feature
 */
const PhaseManager = () => {
  const {
    phases,
    selectedPhase,
    loading,
    selectPhase,
    createPhase,
    updatePhase,
    deletePhase,
    updatePhaseOrders,
  } = usePhase();

  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isDetailOpen, open: openDetail, close: closeDetail } = useModal();
  const [editingId, setEditingId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Derive a stable "editingPhase" from phases list to avoid timing issues with selectedPhase
  const editingPhase = useMemo(() => {
    if (!editingId) return null;
    return phases.find(p => p.id === editingId) || null;
  }, [editingId, phases]);

  const {
    formData,
    errors,
    updateField,
    handleSubmit,
    setFormData,
  } = usePhaseForm(null, async (data) => {
    if (editingId) {
      await updatePhase(editingId, data);
    } else {
      await createPhase(data);
    }
    handleCloseForm();
  });

  // Initialize form when entering edit mode and when phases list updates
  useEffect(() => {
    if (editingId && editingPhase) {
      setFormData({
        phaseCode: editingPhase.phaseCode,
        displayName: editingPhase.displayName,
        order: editingPhase.order,
        allowedTransitions: editingPhase.allowedTransitions || [],
        properties: editingPhase.properties || {},
      });
    }
  }, [editingId, editingPhase, setFormData]);

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      phaseCode: '',
      displayName: '',
      order: (phases.length + 1) * 10,
      allowedTransitions: [],
      properties: {},
    });
    setCurrentStep(1);
    openForm();
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    setCurrentStep(1);
    // Ensure detail data is loaded (for detail modal), but form uses editingPhase from list
    await selectPhase(id);
    openForm();
  };

  const handleView = async (id) => {
    await selectPhase(id);
    openDetail();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this phase? This action cannot be undone if the phase is used by any DocTypes.')) {
      try {
        await deletePhase(id);
      } catch (err) {
        // Error already handled by hook
      }
    }
  };

  const handleReorder = async (reorderedPhases) => {
    await updatePhaseOrders(reorderedPhases);
  };

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  const handleCloseForm = () => {
    closeForm();
    setCurrentStep(1);
    setEditingId(null);
  };

  if (loading && phases.length === 0) {
    return <div>Loading phases...</div>;
  }

  return (
    <Card>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1>Phase Management</h1>
        <Button onClick={handleCreate} variant="primary">
          + Create Phase
        </Button>
      </div>

      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <strong>💡 Tip:</strong> Drag and drop phases to reorder them.
      </div>

      <PhaseList
        phases={phases}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Phase' : 'Create Phase'}
        size="large"
      >
        {currentStep === 1 ? (
          <PhaseFormBasic
            formData={formData}
            errors={errors}
            onFieldChange={updateField}
            onNext={handleNextStep}
            onCancel={handleCloseForm}
            isEditMode={!!editingId}
          />
        ) : (
          <PhaseFormTransitions
            formData={formData}
            errors={errors}
            onFieldChange={updateField}
            onSubmit={handleSubmit}
            onBack={handleBackStep}
            onCancel={handleCloseForm}
            availablePhases={phases}
            isEditMode={!!editingId}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        title="Phase Details"
      >
        <PhaseDetail phase={selectedPhase} />
      </Modal>
    </Card>
  );
};

export default PhaseManager;