import React, { useEffect } from 'react';
import styles from './Modal.module.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  footer,
  className = '',
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Fallback styles
  const fallbackStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      maxHeight: '90vh',
      width: size === 'small' ? '400px' : size === 'large' ? '800px' : '600px',
      maxWidth: '90vw',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px',
      borderBottom: '1px solid #ddd',
    },
    title: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 600,
      color: '#333',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#999',
      padding: 0,
      width: '32px',
      height: '32px',
    },
    body: {
      padding: '24px',
      overflowY: 'auto',
      flex: 1,
    },
    footer: {
      padding: '24px',
      borderTop: '1px solid #ddd',
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
    },
  };

  return (
    <div 
      className={styles?.overlay}
      style={!styles ? fallbackStyles.overlay : undefined}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={styles ? `${styles.modal} ${styles[size]} ${className}` : className}
        style={!styles ? fallbackStyles.modal : undefined}
      >
        <div 
          className={styles?.header}
          style={!styles ? fallbackStyles.header : undefined}
        >
          <h2 
            id="modal-title" 
            className={styles?.title}
            style={!styles ? fallbackStyles.title : undefined}
          >
            {title}
          </h2>
          <button
            className={styles?.closeButton}
            style={!styles ? fallbackStyles.closeButton : undefined}
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>
        
        <div 
          className={styles?.body}
          style={!styles ? fallbackStyles.body : undefined}
        >
          {children}
        </div>
        
        {footer && (
          <div 
            className={styles?.footer}
            style={!styles ? fallbackStyles.footer : undefined}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;