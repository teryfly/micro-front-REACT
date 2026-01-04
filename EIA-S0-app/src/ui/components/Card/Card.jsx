import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, title, className = '' }) => {
  // Fallback styles in case CSS module fails to load
  const cardStyle = {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '24px',
    borderBottom: '1px solid #ddd',
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
    backgroundColor: '#f5f5f5',
  };

  const bodyStyle = {
    padding: '24px',
  };

  return (
    <div 
      className={styles?.card || className}
      style={!styles ? cardStyle : undefined}
    >
      {title && (
        <div 
          className={styles?.cardHeader}
          style={!styles ? headerStyle : undefined}
        >
          {title}
        </div>
      )}
      <div 
        className={styles?.cardBody}
        style={!styles ? bodyStyle : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default Card;