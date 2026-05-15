import React from 'react';
import NavMenu from './NavMenu';
import styles from './Layout.module.css';

/**
 * Sidebar navigation component
 * Adapts styling based on running mode
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Sidebar open state
 * @param {boolean} [props.embedded=false] - Embedded mode flag
 * @param {Function} [props.onToggle] - Toggle handler (for embedded mode)
 */
const Sidebar = ({ isOpen, embedded = false, onToggle }) => {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      aria-label="Sidebar navigation"
      data-embedded={embedded}
    >
      {/* Optional: Sidebar header for embedded mode */}
      {embedded && (
        <div className={styles.sidebarHeader}>
          <button
            className={styles.sidebarToggle}
            onClick={onToggle}
            aria-label="Toggle sidebar"
            type="button"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>
      )}

      <nav className={styles.nav} aria-label="Main navigation">
        <NavMenu />
      </nav>
    </aside>
  );
};

export default Sidebar;