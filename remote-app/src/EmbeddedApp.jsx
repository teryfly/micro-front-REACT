import React, { useState, useEffect } from 'react';
import AppLayout from './components/AppLayout';
import DemoFeaturePage from './components/DemoFeaturePage';
import { getEventBus } from './services/eventBus';

/**
 * EmbeddedApp — host-app 通过 Module Federation 的 ./EmbeddedApp 加载此入口。
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Props (所有字段均为可选，host-app 按需传入)                              │
 * ├────────────────┬────────────────────────────────────────────────────────┤
 * │ embedded       │ boolean  — true = 嵌入模式（隐藏独立 Header）          │
 * │ theme          │ object   — CSS 变量 map，见下方"主题规范"               │
 * │ basePath       │ string   — 路由前缀，默认 '/'                          │
 * │ eventBus       │ object   — { on, off, emit, once }                    │
 * │ token          │ string   — JWT / 身份令牌                              │
 * │ userInfo       │ object   — { name, username, roles, ... }             │
 * │ appId          │ string   — 唯一应用标识                                │
 * │ appName        │ string   — 显示名称                                    │
 * └────────────────┴────────────────────────────────────────────────────────┘
 *
 * 主题规范
 * ─────────
 * host-app 传入的 theme 是完整 CSS 变量 map：
 *   {
 *     '--color-primary':    '#1890ff',
 *     '--color-bg':         '#ffffff',
 *     '--color-text':       '#333333',
 *     '--color-border':     '#d9d9d9',
 *     ...
 *   }
 *
 * EmbeddedApp 会：
 *   1. 将所有 CSS 变量注入到 document.documentElement (inline style，优先级最高)
 *   2. 从 theme['--color-primary'] 提取 primaryColor 传给子组件
 *   3. host 切换主题时通过 EventBus 的 'host:theme:changed' 事件实时更新
 */
function EmbeddedApp({
  embedded  = false,
  theme     = null,
  basePath  = '/',
  eventBus  = null,
  token     = null,
  userInfo  = null,
  appId     = 'remote-app',
  appName   = 'Remote App 模板',
}) {
  const [currentPage, setCurrentPage] = useState('home');
  const bus = getEventBus(eventBus);

  /**
   * 从 host 传入的 CSS-var map 中提取主色。
   * 兼容两种格式：
   *   - host 格式: { '--color-primary': '#1890ff' }
   *   - 旧版格式: { primaryColor: '#1890ff' }
   */
  const primaryColor =
    (theme && theme['--color-primary']) ||
    (theme && theme.primaryColor)        ||
    '#1890ff';

  /**
   * 将 host 主题变量注入 :root（inline style 优先级最高，覆盖所有 stylesheet）
   * 嵌入模式下执行；独立运行时跳过（使用本地 CSS / inline 默认值）
   */
  const injectTheme = (themeVars) => {
    if (!themeVars || typeof themeVars !== 'object') return;
    Object.entries(themeVars).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        document.documentElement.style.setProperty(key, value);
      }
    });
  };

  // 初次挂载 / theme prop 变更时注入
  useEffect(() => {
    if (embedded && theme) {
      injectTheme(theme);
    }
  }, [embedded, theme]);

  // 监听 host 的实时主题切换事件
  useEffect(() => {
    if (!embedded) return;
    const unsubscribe = bus.on('host:theme:changed', ({ vars }) => {
      if (vars) injectTheme(vars);
    });
    return () => typeof unsubscribe === 'function' && unsubscribe();
  }, [embedded, bus]);

  // 通知 host 子应用已就绪
  useEffect(() => {
    bus.emit('subapp:ready', { appId, appName, embedded });
  }, []);

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
