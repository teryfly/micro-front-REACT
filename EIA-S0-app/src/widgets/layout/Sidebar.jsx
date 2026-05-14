import React from 'react';
import NavMenu from './NavMenu';

/**
 * Sidebar navigation component
 * Container for navigation menu with open/close state
 */
const Sidebar = ({ isOpen }) => {
  const sidebarStyle = {
    width: isOpen ? '250px' : '0',
    backgroundColor: 'var(--color-bg-secondary, #f5f5f5)',
    borderRight: '1px solid var(--color-border, #ddd)',
    overflowY: 'auto',
    transition: 'transform 0.3s ease, width 0.3s ease',
    flexShrink: 0,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
  };

  const navStyle = {
    padding: '16px 0',
  };

  return (
    <aside style={sidebarStyle} aria-hidden={!isOpen}>
      <nav style={navStyle} role="navigation" aria-label="Main navigation">
        <NavMenu />
      </nav>
    </aside>
  );
};

export default Sidebar;