import { useCallback } from 'react';

/**
 * Drag-drop state management hook using dnd-kit
 * Provides consistent pattern for reordering items
 *
 * @param {Array} items - Array of items to reorder
 * @param {Function} onReorder - Callback when items are reordered
 * @returns {Object} Drag-drop handlers
 *
 * @example
 * const { handleDragEnd } = useDragDrop(phases, (reordered) => {
 *   updatePhaseOrder(reordered);
 * });
 */
export const useDragDrop = (items, onReorder) => {
  /**
   * Handle drag end event from dnd-kit
   * @param {Object} event - dnd-kit drag end event
   * @param {Object} event.active - Active draggable item
   * @param {Object} event.over - Drop target item
   */
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      // Dropped outside or no movement
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Reorder items - preserve all properties
      const reordered = Array.from(items);
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);

      // Update only order field; keep all other properties intact
      const updated = reordered.map((item, index) => ({
        ...item,
        order: (index + 1) * 10,
      }));

      onReorder(updated);
    },
    [items, onReorder]
  );

  return {
    handleDragEnd,
  };
};