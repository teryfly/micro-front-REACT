import { useState, useCallback } from 'react';

/**
 * Modal state management hook
 * Provides open/close/toggle actions for modal dialogs
 * 
 * @param {boolean} [initialState=false] - Initial open state
 * @returns {{isOpen: boolean, open: Function, close: Function, toggle: Function}}
 * 
 * @example
 * const { isOpen, open, close } = useModal();
 * return <Modal isOpen={isOpen} onClose={close}>...</Modal>
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};