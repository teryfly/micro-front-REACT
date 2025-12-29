import React, { Suspense, lazy, useState, useMemo } from 'react';

// 单个组件：两个远程 Button
const RemoteButtonFromRemoteApp = lazy(() => import('remoteApp1/Button'));
const RemoteButtonFromEIAS0App = lazy(() => import('remoteApp2/Button'));

// 完整首页：两个远程 App（通过上面新暴露的 ./App）
const RemoteFullAppRemote = lazy(() => import('remoteApp1/App'));
const RemoteFullAppEIAS0 = lazy(() => import('remoteApp2/App'));

const MENU_KEYS = {
  REMOTE_BUTTON: 'remote-app',
  EIA_BUTTON: 'EIA-S0-app',
  MIXED_PAGE: 'mixed-page',
  EIA_ALL: 'EIA-S0-app-all',
  REMOTE_ALL: 'remote-app-all',
};

function App() {
  // menu: 决定当前显示的页面类型
  const [menu, setMenu] = useState(MENU_KEYS.REMOTE_BUTTON);

  // ----------- 组件级 Button 切换逻辑 -----------
  const CurrentRemoteButton = useMemo(() => {
    if (menu === MENU_KEYS.EIA_BUTTON) {
      return RemoteButtonFromEIAS0App;
    }
    return RemoteButtonFromRemoteApp;
  }, [menu]);

  const menuItemStyle = (active) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: active ? '2px solid #1890ff' : '2px solid transparent',
    color: active ? '#1890ff' : '#333',
    fontWeight: active ? 'bold' : 'normal',
  });

  const renderContent = () => {
    // 1. 原来的 Button 组件切换页面
    if (
      menu === MENU_KEYS.REMOTE_BUTTON ||
      menu === MENU_KEYS.EIA_BUTTON
    ) {
      const label =
        menu === MENU_KEYS.EIA_BUTTON
          ? 'EIA-S0-app'
          : 'remote-app';

      return (
        <div
          style={{
            border: '2px solid blue',
            padding: '15px',
            marginTop: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>📦 远程组件加载区域</h2>
          <p style={{ marginBottom: '12px' }}>
            当前显示子项目（单个组件 Button）：
            <strong style={{ marginLeft: '4px' }}>{label}</strong>
          </p>
          <Suspense fallback={<div>Loading Remote Component...</div>}>
            <CurrentRemoteButton />
          </Suspense>
        </div>
      );
    }

    // 2. 新增混合页面：左右各一个远程 Button 区域
    if (menu === MENU_KEYS.MIXED_PAGE) {
      return (
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              flex: 1,
              border: '2px solid #1890ff',
              padding: '15px',
              borderRadius: '8px',
            }}
          >
            <h2>📦 remote-app 组件区域</h2>
            <Suspense fallback={<div>Loading remote-app Component...</div>}>
              <RemoteButtonFromRemoteApp />
            </Suspense>
          </div>

          <div
            style={{
              flex: 1,
              border: '2px solid #52c41a',
              padding: '15px',
              borderRadius: '8px',
            }}
          >
            <h2>📦 EIA-S0-app 组件区域</h2>
            <Suspense fallback={<div>Loading EIA-S0-app Component...</div>}>
              <RemoteButtonFromEIAS0App />
            </Suspense>
          </div>
        </div>
      );
    }

    // 3. EIA-S0-app-all：加载 EIA-S0-app 的完整 App 页面
    if (menu === MENU_KEYS.EIA_ALL) {
      return (
        <div
          style={{
            marginTop: '20px',
            border: '2px solid #52c41a',
            padding: '15px',
            borderRadius: '8px',
          }}
        >
          <h2>🟢 EIA-S0-app 完整A首页</h2>
          <Suspense fallback={<div>Loading EIA-S0-app Full Page...</div>}>
            <RemoteFullAppEIAS0 />
          </Suspense>
        </div>
      );
    }

    // 4. remote-app-all：加载 remote-app 的完整 App 页面
    if (menu === MENU_KEYS.REMOTE_ALL) {
      return (
        <div
          style={{
            marginTop: '20px',
            border: '2px solid #1890ff',
            padding: '15px',
            borderRadius: '8px',
          }}
        >
          <h2>🔵 B- remote-app 完整B首页</h2>
          <Suspense fallback={<div>Loading remote-app Full Page...</div>}>
            <RemoteFullAppRemote />
          </Suspense>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🏠 Host App (主应用)</h1>
      <p>这是运行在 localhost:7000 的主应用</p>

      {/* 顶部菜单 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px',
          marginBottom: '16px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* 原有：两个 Button 切换菜单 */}
        <div
          style={menuItemStyle(menu === MENU_KEYS.EIA_BUTTON)}
          onClick={() => setMenu(MENU_KEYS.EIA_BUTTON)}
        >
          EIA-S0-app
        </div>
        <div
          style={menuItemStyle(menu === MENU_KEYS.REMOTE_BUTTON)}
          onClick={() => setMenu(MENU_KEYS.REMOTE_BUTTON)}
        >
          remote-app
        </div>

        {/* 新增：混合页面菜单 */}
        <div
          style={menuItemStyle(menu === MENU_KEYS.MIXED_PAGE)}
          onClick={() => setMenu(MENU_KEYS.MIXED_PAGE)}
        >
          混合页面（两个组件）
        </div>

        {/* 新增：加载完整首页的菜单 */}
        <div
          style={menuItemStyle(menu === MENU_KEYS.EIA_ALL)}
          onClick={() => setMenu(MENU_KEYS.EIA_ALL)}
        >
          EIA-S0-app-all
        </div>
        <div
          style={menuItemStyle(menu === MENU_KEYS.REMOTE_ALL)}
          onClick={() => setMenu(MENU_KEYS.REMOTE_ALL)}
        >
          remote-app-all
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

export default App;