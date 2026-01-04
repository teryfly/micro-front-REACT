import React from 'react';
import styles from './Modal.module.css';

/**
 * Modal body component
 * Internal component used by Modal
 */
const ModalBody = ({ children }) => {
  return <div className={styles.modalBody}>{children}</div>;
};

export default ModalBody;