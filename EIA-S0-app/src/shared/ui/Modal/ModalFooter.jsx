import React from 'react';

const ModalFooter = ({ children }) => {
  const modalFooterStyle = {
    padding: '24px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    flexShrink: 0,
  };

  return <div style={modalFooterStyle}>{children}</div>;
};

export default ModalFooter;