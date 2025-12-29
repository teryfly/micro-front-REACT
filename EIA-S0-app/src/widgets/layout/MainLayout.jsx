import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Main layout component
 * Provides application shell with header, sidebar, and content area
 * 
 * Note: Using inline styles temporarily until CSS modules are fixed
 */
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const layoutStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  };

  const containerStyle = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#ffffff',
  };

  return (
    <div style={layoutStyle}>
      <Header onMenuClick={toggleSidebar} />
      
      <div style={containerStyle}>
        <Sidebar isOpen={sidebarOpen} />
        
        <main style={contentStyle}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;