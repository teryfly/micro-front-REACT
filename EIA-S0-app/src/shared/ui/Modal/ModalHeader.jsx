import React from 'react';
import styles from './Modal.module.css';

/**
 * Modal header component
 * Internal component used by Modal
 */
const ModalHeader = ({ title, onClose }) => {
  return (
    <div className={styles.modalHeader}>
      <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close modal"
        type="button"
      >
        ×
      </button>
    </div>
  );
};

export default ModalHeader;