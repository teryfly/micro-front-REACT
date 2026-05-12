/**
 * Template file contents for a generated sub-app.
 * Variables:  {{APP_NAME}}       — display name, e.g. "EIA-S1 模板管理"
 *             {{APP_ID}}         — kebab-case id, e.g. "eia-s1-app"
 *             {{CONTAINER_NAME}} — webpack federation name, e.g. "eiaS1App"
 *             {{PORT}}           — dev server port, e.g. "7003"
 *             {{ROUTE}}          — route path, e.g. "/eia-s1"
 *             {{PRIMARY_COLOR}}  — hex color, e.g. "#1890ff"
 *             {{DESCRIPTION}}    — short description
 *             {{API_BASE_URL}}   — backend API base URL
 */

export function applyVars(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export const TEMPLATE_FILES = {
  'package.json': `{
  "name": "{{APP_ID}}",
  "version": "1.0.0",
  "description": "{{DESCRIPTION}}",
  "main": "index.js",
  "scripts": {
    "start": "webpack serve",
    "build": "webpack --mode production"
  },
  "keywords": ["micro-frontend", "module-federation"],
  "license": "ISC",
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@babel/core": "^7.28.5",
    "@babel/preset-react": "^7.28.5",
    "babel-loader": "^10.0.0",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.5",
    "style-loader": "^4.0.0",
    "webpack": "^5.103.0",
    "webpack-cli": "^6.0.1",
    "webpack-dev-server": "^5.2.2"
  }
}
`,

  'webpack.config.js': `const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

const APP_NAME = process.env.APP_NAME || '{{CONTAINER_NAME}}';
const PORT = parseInt(process.env.PORT || '{{PORT}}', 10);

module.exports = {
  entry: './src/index.js',
  mode: 'development',

  devServer: {
    port: PORT,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  output: {
    publicPath: \`http://localhost:\${PORT}/\`,
  },

  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-react'] },
        },
      },
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },

  resolve: { extensions: ['.js', '.jsx'] },

  plugins: [
    new ModuleFederationPlugin({
      name: APP_NAME,
      filename: 'remoteEntry.js',
      exposes: {
        './EmbeddedApp': './src/EmbeddedApp',
        './App': './src/App',
      },
      shared: {
        react: { singleton: true, requiredVersion: '>=18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '>=18.0.0' },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
`,

  'public/index.html': `<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{APP_NAME}}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,

  '.env': `REACT_APP_API_BASE_URL={{API_BASE_URL}}
PORT={{PORT}}
APP_NAME={{CONTAINER_NAME}}
`,

  '.babelrc': `{
  "presets": ["@babel/preset-react"]
}
`,

  'src/index.js': `// Async bootstrap ensures shared modules (react, react-dom) are initialized first
import('./bootstrap');
`,

  'src/bootstrap.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`,

  'src/App.jsx': `import React from 'react';
import EmbeddedApp from './EmbeddedApp';

// Standalone entry — renders the app without host-app context
function App() {
  return (
    <div style={{ height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <EmbeddedApp
        embedded={false}
        appName="{{APP_NAME}} (standalone)"
        theme={{ primaryColor: '{{PRIMARY_COLOR}}' }}
      />
    </div>
  );
}

export default App;
`,

  'src/EmbeddedApp.jsx': `import React, { useState } from 'react';
import AppLayout from './components/AppLayout';
import DemoFeaturePage from './components/DemoFeaturePage';

/**
 * Main integration entry — host-app loads this via './EmbeddedApp'.
 *
 * Accepted props (all optional):
 *   embedded    {boolean}  true when embedded in host-app
 *   theme       {object}   { primaryColor }
 *   basePath    {string}   route prefix
 *   eventBus    {object}   { on, off, emit }
 *   token       {string}   auth token
 *   userInfo    {object}   current user
 *   appId       {string}   unique identifier
 *   appName     {string}   display name
 */
function EmbeddedApp({
  embedded = false,
  theme = {},
  basePath = '/',
  eventBus = null,
  token = null,
  userInfo = null,
  appId = '{{APP_ID}}',
  appName = '{{APP_NAME}}',
}) {
  const [currentPage, setCurrentPage] = useState('home');
  const primaryColor = theme?.primaryColor || '{{PRIMARY_COLOR}}';

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
`,

  'src/components/AppLayout.jsx': `import React, { useState } from 'react';

const NAV_ITEMS = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'feature-a', label: '功能 A', icon: '📋' },
  { key: 'feature-b', label: '功能 B', icon: '⚙️' },
  { key: 'about', label: '关于', icon: 'ℹ️' },
];

function AppLayout({ embedded, primaryColor, appName, currentPage, onNavigate, userInfo, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(!embedded);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      <div style={{
        height: 56, background: primaryColor, color: '#fff',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
      }}>
        <button onClick={() => setSidebarOpen(v => !v)} style={{
          background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer',
        }}>☰</button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{appName}</span>
        {userInfo && (
          <span style={{ marginLeft: 'auto', fontSize: 13 }}>👤 {userInfo.name || 'User'}</span>
        )}
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: sidebarOpen ? 200 : 0, overflow: 'hidden', transition: 'width 0.2s',
          background: '#f5f7fa', borderRight: '1px solid #e8eaec', flexShrink: 0,
        }}>
          <nav style={{ paddingTop: 8 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.key} onClick={() => onNavigate(item.key)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 14,
                background: currentPage === item.key ? primaryColor + '18' : 'transparent',
                color: currentPage === item.key ? primaryColor : '#333',
                fontWeight: currentPage === item.key ? 600 : 400,
                borderLeft: currentPage === item.key ? \`3px solid \${primaryColor}\` : '3px solid transparent',
              }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export default AppLayout;
`,

  'src/components/DemoFeaturePage.jsx': `import React, { useState } from 'react';

function DemoFeaturePage({ pageName = 'home', primaryColor = '{{PRIMARY_COLOR}}' }) {
  if (pageName === 'feature-a') return <FeatureAPage primaryColor={primaryColor} />;
  if (pageName === 'feature-b') return <FeatureBPage primaryColor={primaryColor} />;
  if (pageName === 'about') return <AboutPage />;
  return <HomePage primaryColor={primaryColor} />;
}

function HomePage({ primaryColor }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>欢迎使用 {{APP_NAME}}</h2>
      <p style={{ color: '#666' }}>{{DESCRIPTION}}</p>
      <button onClick={() => setCount(c => c + 1)} style={{
        marginTop: 24, padding: '10px 24px', background: primaryColor,
        color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15,
      }}>
        点击次数: {count}
      </button>
    </div>
  );
}

function FeatureAPage({ primaryColor }) {
  const [items, setItems] = useState([
    { id: 1, name: '示例记录 #1', status: '启用' },
    { id: 2, name: '示例记录 #2', status: '停用' },
  ]);
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>功能 A — 数据列表</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f5f7fa' }}>
            {['ID', '名称', '状态', '操作'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e8eaec' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td style={{ padding: '10px 12px', color: '#999' }}>{item.id}</td>
              <td style={{ padding: '10px 12px' }}>{item.name}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 12,
                  background: item.status === '启用' ? '#f6ffed' : '#fff2f0',
                  color: item.status === '启用' ? '#52c41a' : '#ff4d4f',
                  border: \`1px solid \${item.status === '启用' ? '#b7eb8f' : '#ffccc7'}\`,
                }}>{item.status}</span>
              </td>
              <td style={{ padding: '10px 12px' }}>
                <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{
                  padding: '4px 10px', background: 'transparent', color: '#ff4d4f',
                  border: '1px solid #ffccc7', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                }}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureBPage({ primaryColor }) {
  const [apiUrl, setApiUrl] = useState('{{API_BASE_URL}}');
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>功能 B — 配置管理</h2>
      <div style={{ maxWidth: 480 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>API 基础地址</label>
        <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} style={{
          width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9',
          borderRadius: 6, fontSize: 14, boxSizing: 'border-box',
        }} />
        <button onClick={() => alert('已保存: ' + apiUrl)} style={{
          marginTop: 16, padding: '10px 24px', background: primaryColor,
          color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
        }}>保存</button>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>关于 {{APP_NAME}}</h2>
      <p>应用ID: <code>{{APP_ID}}</code></p>
      <p>容器名: <code>{{CONTAINER_NAME}}</code></p>
      <p>端口: <code>{{PORT}}</code></p>
    </div>
  );
}

export default DemoFeaturePage;
`,

  'src/services/eventBus.js': `const listeners = {};

const eventBus = {
  on(event, handler) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(handler);
    return () => this.off(event, handler);
  },
  off(event, handler) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(h => h !== handler);
  },
  emit(event, payload) {
    (listeners[event] || []).forEach(h => h(payload));
  },
};

export default eventBus;
`,

  'README.md': `# {{APP_NAME}}

> {{DESCRIPTION}}

## 快速开始

\`\`\`bash
npm install
npm start   # 启动开发服务器，端口 {{PORT}}
\`\`\`

## 集成到 host-app

在 host-app 的「创建子应用」页面，使用以下配置注册：

| 字段 | 值 |
|------|-----|
| 应用名称 | {{APP_NAME}} |
| 应用ID | {{APP_ID}} |
| 容器名 | {{CONTAINER_NAME}} |
| 端口 | {{PORT}} |
| 路由 | {{ROUTE}} |
| Entry URL | http://localhost:{{PORT}}/remoteEntry.js |

## 目录结构

\`\`\`
src/
├── index.js            # 异步启动入口
├── bootstrap.js        # React 根挂载
├── App.jsx             # 独立运行模式
├── EmbeddedApp.jsx     # 主集成入口 (host-app 使用此模块)
├── components/
│   ├── AppLayout.jsx   # 布局（头部 + 侧边栏 + 内容区）
│   └── DemoFeaturePage.jsx  # 示例功能页（替换为业务代码）
└── services/
    └── eventBus.js     # 跨应用事件总线
\`\`\`

## EmbeddedApp Props

| Prop | 类型 | 说明 |
|------|------|------|
| embedded | boolean | 是否嵌入模式 |
| theme | object | \`{ primaryColor: '#1890ff' }\` |
| basePath | string | 路由前缀 |
| eventBus | object | 跨应用事件总线 |
| token | string | 身份令牌 |
| userInfo | object | 当前用户信息 |
| appId | string | 应用标识 |
| appName | string | 显示名称 |
`,
};
