import React, { useState } from 'react';
import AppLayout from './components/AppLayout';
import DemoFeaturePage from './components/DemoFeaturePage';

/**
 * 主集成入口 — host-app 通过 ./EmbeddedApp 加载此组件。
 *
 * Props (所有字段均为可选，host-app 按需传入):
 *   embedded    {boolean}  true = 嵌入模式（隐藏独立标题等）
 *   theme       {object}   { primaryColor: '#1890ff' }
 *   basePath    {string}   路由前缀，默认 '/'
 *   eventBus    {object}   跨应用事件总线 { on, off, emit }
 *   token       {string}   JWT / 身份令牌
 *   userInfo    {object}   { name, username, roles, ... }
 *   appId       {string}   唯一应用标识
 *   appName     {string}   显示名称
 */
function EmbeddedApp({
  embedded = false,
  theme = {},
  basePath = '/',
  eventBus = null,
  token = null,
  userInfo = null,
  appId = 'remote-app',
  appName = 'Remote App 模板',
}) {
  const [currentPage, setCurrentPage] = useState('home');
  const primaryColor = theme?.primaryColor || '#1890ff';

  return (
    <AppLayout
      embedded={embedded}
      primaryColor={primaryColor}
      appName={appName}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      userInfo={userInfo}
    >
      <DemoFeaturePage
        pageName={currentPage}
        primaryColor={primaryColor}
        token={token}
        userInfo={userInfo}
        eventBus={eventBus}
      />
    </AppLayout>
  );
}

export default EmbeddedApp;
