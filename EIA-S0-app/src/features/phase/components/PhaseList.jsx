/**
 * Phase List Component with Drag-Drop
 * Uses dnd-kit for sortable phase list
 * @module PhaseList
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import { useDragDrop } from '../../../shared/hooks/useDragDrop';

/**
 * Sortable phase item component
 */
const SortablePhaseItem = ({ phase, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#e3f2fd' : 'white',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          fontSize: '20px',
          color: 'var(--color-text-muted)',
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        ☰
      </div>

      <Badge type="default">{phase.order}</Badge>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          {phase.displayName}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Code: {phase.phaseCode}
        </div>
      </div>

      <div style={{ minWidth: '200px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
          Allowed Transitions:
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {phase.allowedTransitions && phase.allowedTransitions.length > 0 ? (
            phase.allowedTransitions.map(transition => (
              <Badge key={transition} type="info">
                {transition}
              </Badge>
            ))
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>None</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button size="small" variant="primary" onClick={() => onEdit(phase.id)}>
          Edit
        </Button>
        <Button size="small" variant="danger" onClick={() => onDelete(phase.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
};

/**
 * Phase list with drag-drop ordering
 * @param {Object} props
 * @param {Array<PhaseDefinition>} props.phases - Phase array
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onReorder - Reorder handler
 */
const PhaseList = ({ phases, onEdit, onDelete, onReorder }) => {
  const { handleDragEnd } = useDragDrop(phases, onReorder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (phases.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--color-text-muted)'
      }}>
        No phases found. Create your first phase to get started.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={phases.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {phases.map(phase => (
            <SortablePhaseItem
              key={phase.id}
              phase={phase}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default PhaseList;