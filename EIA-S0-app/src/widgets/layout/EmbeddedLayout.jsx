import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './EmbeddedLayout.module.css';

/**
 * Embedded Layout Component
 * Simplified layout without Header for embedding in host app
 * Contains only Sidebar and Content area
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
const EmbeddedLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // On small screens, start with sidebar closed
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleResize = () => {
      if (mediaQuery.matches) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleResize);
      return () => mediaQuery.removeEventListener('change', handleResize);
    }

    mediaQuery.addListener(handleResize);
    return () => mediaQuery.removeListener(handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={styles.embeddedLayout}>
      <Sidebar isOpen={sidebarOpen} embedded={true} onToggle={toggleSidebar} />
      <main className={styles.content} role="main">
        {children}
      </main>
    </div>
  );
};

export default EmbeddedLayout;