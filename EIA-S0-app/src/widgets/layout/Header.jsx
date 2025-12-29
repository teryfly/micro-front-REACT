import React from 'react';

/**
 * Application header component
 * Displays app branding, menu toggle, and user information
 */
const Header = ({ onMenuClick }) => {
  const headerStyle = {
    height: '60px',
    backgroundColor: '#4CAF50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    zIndex: 100,
  };

  const headerLeftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const headerRightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const menuButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
  };

  const appNameStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
  };

  const versionStyle = {
    fontSize: '12px',
    opacity: 0.8,
  };

  const userInfoStyle = {
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    fontSize: '14px',
  };

  return (
    <header style={headerStyle}>
      <div style={headerLeftStyle}>
        <button 
          style={menuButtonStyle}
          onClick={onMenuClick}
          aria-label="Toggle menu"
          type="button"
        >
          ☰
        </button>
        <h1 style={appNameStyle}>Governance BC</h1>
      </div>
      
      <div style={headerRightStyle}>
        <span style={versionStyle}>v1.0.0</span>
        <div style={userInfoStyle}>
          <span>👤 Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;