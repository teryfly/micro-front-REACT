import React, { useState } from 'react';

const NAV_ITEMS = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'feature-a', label: '功能 A', icon: '📋' },
  { key: 'feature-b', label: '功能 B', icon: '⚙️' },
  { key: 'about', label: '关于', icon: 'ℹ️' },
];

function AppLayout({
  embedded = false,
  primaryColor = '#1890ff',
  appName = 'Remote App',
  currentPage,
  onNavigate,
  userInfo,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(!embedded);

  const headerStyle = {
    height: 56,
    background: primaryColor,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 12,
    flexShrink: 0,
  };

  const sidebarStyle = {
    width: sidebarOpen ? 200 : 0,
    overflow: 'hidden',
    transition: 'width 0.2s',
    background: '#f5f7fa',
    borderRight: '1px solid #e8eaec',
    flexShrink: 0,
  };

  const navItemStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    background: active ? `${primaryColor}18` : 'transparent',
    color: active ? primaryColor : '#333',
    fontWeight: active ? 600 : 400,
    borderLeft: active ? `3px solid ${primaryColor}` : '3px solid transparent',
    whiteSpace: 'nowrap',
    fontSize: 14,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      {/* Header */}
      <div style={headerStyle}>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            padding: '0 4px',
          }}
        >
          ☰
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{appName}</span>
        {userInfo && (
          <span style={{ marginLeft: 'auto', fontSize: 13, opacity: 0.9 }}>
            👤 {userInfo.name || userInfo.username || 'User'}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <nav style={{ paddingTop: 8 }}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.key}
                style={navItemStyle(currentPage === item.key)}
                onClick={() => onNavigate(item.key)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
