import React from 'react';
import styles from './Modal.module.css';

/**
 * Modal footer component
 * Internal component used by Modal
 */
const ModalFooter = ({ children }) => {
  return <div className={styles.modalFooter}>{children}</div>;
};

export default ModalFooter;