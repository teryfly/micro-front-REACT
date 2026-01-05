/**
 * System Parameter Management Container
 * Orchestrates all System Parameter operations and UI components with editable controls
 * @module SystemParamManager
 */
import React, { useState } from 'react';
import SystemParamList from './components/SystemParamList';
import SystemParamForm from './components/SystemParamForm';
import { useSystemParam } from './hooks/useSystemParam';
import { useSystemParamForm } from './hooks/useSystemParamForm';
import { useModal } from '../../shared/hooks/useModal';
import Modal from '../../shared/ui/Modal/Modal';
import Card from '../../shared/ui/Card';
import Button from '../../shared/ui/Button';
/**
 * System Parameter management container component
 * Main entry point for System Parameter feature
 */
const SystemParamManager = () => {
  const {
    systemParams,
    selectedParam,
    editableKeys,
    loading,
    selectParam,
    createParam,
    updateParam,
    isEditable,
  } = useSystemParam();
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const {
    formData,
    errors,
    updateField,
    handleSubmit,
    setFormData,
    resetForm,
  } = useSystemParamForm(null, async (data) => {
    if (isEditMode) {
      await updateParam(data.key, {
        value: data.value,
        type: data.type,
        description: data.description,
      });
    } else {
      await createParam(data);
    }
    closeForm();
  }, isEditMode, editableKeys);
  const handleCreate = () => {
    setIsEditMode(false);
    setEditingKey(null);
    resetForm();
    openForm();
  };
  const handleEdit = async (key) => {
    // Check if editable before proceeding
    if (!isEditable(key)) {
      return;
    }
    setIsEditMode(true);
    setEditingKey(key);
    await selectParam(key);
    // Use current selectedParam data
    if (selectedParam) {
      setFormData({
        key: selectedParam.key,
        value: selectedParam.value,
        type: selectedParam.type,
        description: selectedParam.description || '',
      });
      openForm();
    }
  };
  const handleCloseForm = () => {
    closeForm();
    setIsEditMode(false);
    setEditingKey(null);
  };
  if (loading && systemParams.length === 0) {
    return (
      <Card>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: 'var(--color-text-muted)' 
        }}>
          Loading system parameters...
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
        <h1>System Parameters</h1>
        <Button onClick={handleCreate} variant="primary">
          + Create Parameter
        </Button>
      </div>
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '4px',
        marginBottom: '24px',
        fontSize: '14px',
        color: 'var(--color-text)'
      }}>
        <strong>ℹ️ Info:</strong> Only parameters marked as editable can be modified.
        When creating new parameters, you can choose whether they should be editable.
      </div>
      <SystemParamList
        params={systemParams}
        onEdit={handleEdit}
        isEditable={isEditable}
        loading={loading}
      />
      <Modal 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        title={isEditMode ? 'Edit System Parameter' : 'Create System Parameter'}
        size="medium"
      >
        <SystemParamForm
          formData={formData}
          errors={errors}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isEditMode={isEditMode}
        />
      </Modal>
    </Card>
  );
};
export default SystemParamManager;