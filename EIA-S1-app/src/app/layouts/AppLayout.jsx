import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../providers/ThemeContext';
import { routes } from '../routes/routeConfig';

const NAV_ITEMS = routes.filter((r) => !r.redirect && !r.hideFromNav);

/**
 * AppLayout — shell for the S1 sub-app.
 *
 * embedded=false (standalone): shows Header + Sidebar + Content
 * embedded=true  (in host)   : Sidebar + Content only; host provides the top bar
 */
function AppLayout({ embedded = false, appName = '模板管理中心', userInfo, children }) {
  const { primaryColor } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentPath = location.pathname;

  const isActive = (path) =>
    path === '/templates'
      ? currentPath === '/templates' || currentPath === '/'
      : currentPath.startsWith(path);

  /* ── Styles ─────────────────────────────────────────────────── */
  const headerStyle = {
    height: 56,
    background: primaryColor,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 12,
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  };

  const sidebarStyle = {
    width: sidebarOpen ? 220 : 0,
    overflow: 'hidden',
    transition: 'width 0.2s ease',
    background: '#fafafa',
    borderRight: '1px solid #e8e8e8',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  const navItemBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: 14,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s',
  };

  const navItem = (active) => ({
    ...navItemBase,
    background: active ? `${primaryColor}18` : 'transparent',
    color: active ? primaryColor : '#333',
    fontWeight: active ? 600 : 400,
    borderLeft: active ? `3px solid ${primaryColor}` : '3px solid transparent',
  });

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    background: '#fff',
    color: '#333',
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400, overflow: 'hidden' }}>

      {/* Header — standalone only */}
      {!embedded && (
        <div style={headerStyle}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
            aria-label="切换侧边栏"
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
      )}

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={sidebarStyle}>
          {/* App name when embedded */}
          {embedded && (
            <div style={{ padding: '14px 16px 10px', fontWeight: 700, fontSize: 13, color: '#666', letterSpacing: '0.05em', borderBottom: '1px solid #e8e8e8' }}>
              {appName}
            </div>
          )}
          <nav style={{ paddingTop: 4, flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.path}
                style={navItem(isActive(item.path))}
                onClick={() => navigate(item.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <main style={contentStyle}>{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
