import React, { useState } from 'react';

const NAV_ITEMS = [
  { key: 'home',      label: '首页',  icon: '🏠' },
  { key: 'feature-a', label: '功能 A', icon: '📋' },
  { key: 'feature-b', label: '功能 B', icon: '⚙️' },
  { key: 'about',     label: '关于',  icon: 'ℹ️' },
];

/**
 * AppLayout — 应用外壳
 *
 * embedded=false (standalone) : 显示 Header + Sidebar + Content
 * embedded=true  (host 内嵌)  : 仅显示 Sidebar + Content，Header 由 host 提供
 *
 * primaryColor 通过 prop 传入，已由 EmbeddedApp 从 host 主题对象中提取。
 */
function AppLayout({
  embedded    = false,
  primaryColor = '#1890ff',
  appName      = 'Remote App',
  currentPage,
  onNavigate,
  userInfo,
  children,
}) {
  // 嵌入模式默认展开侧边栏（因为没有 header toggle 按钮）
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  };

  const sidebarStyle = {
    width: sidebarOpen ? 200 : 0,
    overflow: 'hidden',
    transition: 'width 0.2s',
    background: 'var(--color-bg-secondary, #f5f7fa)',
    borderRight: '1px solid var(--color-border, #e8eaec)',
    flexShrink: 0,
  };

  const navItemStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    background: active ? `${primaryColor}18` : 'transparent',
    color: active ? primaryColor : 'var(--color-text, #333)',
    fontWeight: active ? 600 : 400,
    borderLeft: active ? `3px solid ${primaryColor}` : '3px solid transparent',
    whiteSpace: 'nowrap',
    fontSize: 14,
    userSelect: 'none',
  });

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: 24,
    background: 'var(--color-bg, #fff)',
    color: 'var(--color-text, #333)',
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>

      {/* Header — 独立模式显示；嵌入模式隐藏（host 提供顶部导航栏）*/}
      {!embedded && (
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
          <nav style={{ paddingTop: 8 }}>
            {NAV_ITEMS.map((item) => (
              <div
                key={item.key}
                style={navItemStyle(currentPage === item.key)}
                onClick={() => onNavigate(item.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate(item.key)}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <main style={contentStyle}>
          {children}
        </main>

      </div>
    </div>
  );
}

export default AppLayout;
