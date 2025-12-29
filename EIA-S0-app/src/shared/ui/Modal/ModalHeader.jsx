import React from 'react';

const ModalHeader = ({ title, onClose }) => {
  const modalHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid #ddd',
    flexShrink: 0,
  };

  const modalTitleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#333',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    lineHeight: 1,
    cursor: 'pointer',
    color: '#999',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  };

  return (
    <div style={modalHeaderStyle}>
      <h2 id="modal-title" style={modalTitleStyle}>{title}</h2>
      <button
        style={closeButtonStyle}
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