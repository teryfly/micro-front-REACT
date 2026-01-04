import React from 'react';
import NavMenu from './NavMenu';
import styles from './Layout.module.css';

/**
 * Sidebar navigation component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Sidebar open state
 */
const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      aria-label="Sidebar navigation"
    >
      <nav className={styles.nav} aria-label="Main navigation">
        <NavMenu />
      </nav>
    </aside>
  );
};

export default Sidebar;