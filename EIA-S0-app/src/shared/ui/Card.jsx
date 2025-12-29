import React from 'react';

/**
 * Card container component
 * Container with border, shadow, and optional title
 */
const Card = ({ children, title }) => {
  const cardStyle = {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  };

  const cardHeaderStyle = {
    padding: '24px',
    borderBottom: '1px solid #ddd',
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
    backgroundColor: '#f5f5f5',
  };

  const cardBodyStyle = {
    padding: '24px',
  };

  return (
    <div style={cardStyle}>
      {title && <div style={cardHeaderStyle}>{title}</div>}
      <div style={cardBodyStyle}>{children}</div>
    </div>
  );
};

export default Card;