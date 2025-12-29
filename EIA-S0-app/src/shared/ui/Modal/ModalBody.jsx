import React from 'react';

const ModalBody = ({ children }) => {
  const modalBodyStyle = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  };

  return <div style={modalBodyStyle}>{children}</div>;
};

export default ModalBody;