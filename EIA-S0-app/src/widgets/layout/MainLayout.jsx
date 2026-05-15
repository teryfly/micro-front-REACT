import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useMode } from '../../app/providers/ModeContext';
import stylesImport from './Layout.module.css';

/**
 * Main layout component
 * Provides application shell with optional header, sidebar, and content area.
 * In embedded mode, Header is hidden to avoid duplication with host app.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
const MainLayout = ({ children }) => {
  // Defensive fallback: avoid runtime crash if CSS modules loader is misconfigured
  const styles = stylesImport || {};

  const { isEmbedded } = useMode();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // On small screens, start with sidebar closed by default
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const update = () => {
      if (mediaQuery.matches) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    update();

    // Safari fallback: addEventListener may not exist on MediaQueryList
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={styles.layout}>
      {/* Conditional Header - only in standalone mode */}
      {!isEmbedded && <Header onMenuClick={toggleSidebar} />}

      <div className={styles.container}>
        <Sidebar isOpen={sidebarOpen} embedded={isEmbedded} />
        <main className={styles.content} role="main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;