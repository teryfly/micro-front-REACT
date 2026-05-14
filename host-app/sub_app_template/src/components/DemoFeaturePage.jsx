import React, { useState } from 'react';

/* ─── page registry ────────────────────────────────────────────── */
const PAGES = {
  home:        HomePage,
  'feature-a': FeatureAPage,
  'feature-b': FeatureBPage,
  about:       AboutPage,
};

function DemoFeaturePage({ pageName = 'home', primaryColor = '#1890ff', token, userInfo, eventBus }) {
  const Page = PAGES[pageName] || HomePage;
  return <Page primaryColor={primaryColor} token={token} userInfo={userInfo} eventBus={eventBus} />;
}

/* ─── HomePage ──────────────────────────────────────────────────── */
function HomePage({ primaryColor }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>欢迎使用子应用模板</h2>
      <p style={{ color: 'var(--color-text-secondary, #666)' }}>
        这是基于 <strong>remote-app</strong> 模板创建的子应用。您可以在此处替换为您的业务功能。
      </p>

      <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
        {[
          { label: '功能模块', value: '4',   icon: '📦' },
          { label: '组件数量', value: '12+', icon: '🧩' },
          { label: 'API 接口', value: '8',   icon: '🔌' },
          { label: '运行状态', value: '正常', icon: '✅' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--color-bg, #fff)',
              border: '1px solid var(--color-border, #e8eaec)',
              borderRadius: 8,
              padding: '16px 24px',
              minWidth: 120,
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))',
            }}
          >
            <div style={{ fontSize: 28 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: primaryColor }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #999)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <h3>交互示例</h3>
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{
            padding: '10px 24px',
            background: primaryColor,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          点击次数: {count}
        </button>
      </div>
    </div>
  );
}

/* ─── FeatureAPage ──────────────────────────────────────────────── */
function FeatureAPage({ primaryColor }) {
  const [items, setItems] = useState([
    { id: 1, name: '示例记录 #1', status: '启用' },
    { id: 2, name: '示例记录 #2', status: '停用' },
    { id: 3, name: '示例记录 #3', status: '启用' },
  ]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>功能 A — 数据列表</h2>
        <button
          onClick={() =>
            setItems((prev) => [
              ...prev,
              { id: Date.now(), name: `示例记录 #${prev.length + 1}`, status: '启用' },
            ])
          }
          style={{ padding: '8px 16px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          + 新增
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: 'var(--color-bg-secondary, #f5f7fa)' }}>
            {['ID', '名称', '状态', '操作'].map((h) => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid var(--color-border, #e8eaec)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light, #f0f0f0)' }}>
              <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary, #999)' }}>{item.id}</td>
              <td style={{ padding: '10px 12px' }}>{item.name}</td>
              <td style={{ padding: '10px 12px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 12,
                    background: item.status === '启用' ? 'var(--color-success-bg, #f6ffed)' : 'var(--color-error-bg, #fff2f0)',
                    color:      item.status === '启用' ? 'var(--color-success, #52c41a)'   : 'var(--color-error, #ff4d4f)',
                    border:     `1px solid ${item.status === '启用' ? 'var(--color-success, #52c41a)' : 'var(--color-error, #ff4d4f)'}`,
                  }}
                >
                  {item.status}
                </span>
              </td>
              <td style={{ padding: '10px 12px' }}>
                <button
                  onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                  style={{ padding: '4px 10px', background: 'transparent', color: 'var(--color-error, #ff4d4f)', border: '1px solid var(--color-error, #ff4d4f)', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── FeatureBPage ──────────────────────────────────────────────── */
function FeatureBPage({ primaryColor }) {
  const [config, setConfig] = useState({ apiUrl: 'http://localhost:5090', timeout: 30, debug: false });

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid var(--color-border, #d9d9d9)',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: 'var(--color-bg, #fff)',
    color: 'var(--color-text, #333)',
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>功能 B — 配置管理</h2>
      <div style={{ maxWidth: 480 }}>
        {[
          { label: 'API 基础地址', key: 'apiUrl',   type: 'text'   },
          { label: '超时时间 (秒)', key: 'timeout', type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>{label}</label>
            <input
              type={type}
              value={config[key]}
              onChange={(e) => setConfig((c) => ({ ...c, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
              style={inputStyle}
            />
          </div>
        ))}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="debug" checked={config.debug} onChange={(e) => setConfig((c) => ({ ...c, debug: e.target.checked }))} />
          <label htmlFor="debug" style={{ fontSize: 14 }}>开启调试模式</label>
        </div>
        <button
          onClick={() => alert(JSON.stringify(config, null, 2))}
          style={{ padding: '10px 24px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          保存配置
        </button>
      </div>
    </div>
  );
}

/* ─── AboutPage ─────────────────────────────────────────────────── */
function AboutPage({ primaryColor = '#1890ff' }) {
  const h2 = { marginTop: 0, color: primaryColor };
  const h3 = { marginTop: 28, marginBottom: 8, color: primaryColor, fontSize: 16 };
  const h4 = { marginTop: 20, marginBottom: 6, fontSize: 14, fontWeight: 600 };
  const p  = { lineHeight: 1.8, marginBottom: 12, color: 'var(--color-text, #333)' };
  const code = {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: 13,
    background: 'var(--color-bg-secondary, #f5f7fa)',
    border: '1px solid var(--color-border, #e8eaec)',
    borderRadius: 4,
    padding: '2px 6px',
  };
  const pre = {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: 13,
    background: 'var(--color-bg-secondary, #f5f7fa)',
    border: '1px solid var(--color-border, #e8eaec)',
    borderRadius: 6,
    padding: '16px 20px',
    overflowX: 'auto',
    lineHeight: 1.7,
    marginBottom: 16,
    whiteSpace: 'pre',
  };
  const tag = (text, color = primaryColor) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 12,
    background: `${color}18`,
    color,
    border: `1px solid ${color}40`,
    marginRight: 6,
    marginBottom: 4,
  });
  const divider = { borderTop: '1px solid var(--color-border, #e8eaec)', margin: '24px 0' };
  const warn = {
    background: 'var(--color-warning-bg, #fffbe6)',
    border: '1px solid var(--color-warning, #faad14)',
    borderLeft: '4px solid var(--color-warning, #faad14)',
    borderRadius: 4,
    padding: '10px 16px',
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 1.7,
  };
  const info = {
    background: 'var(--color-info-bg, #e6f7ff)',
    border: '1px solid var(--color-info, #1890ff)',
    borderLeft: '4px solid var(--color-info, #1890ff)',
    borderRadius: 4,
    padding: '10px 16px',
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 1.7,
  };

  return (
    <div style={{ maxWidth: 860, lineHeight: 1.7, color: 'var(--color-text, #333)' }}>

      {/* ── 标题 ── */}
      <h2 style={h2}>📖 集成规范 · 二次开发指南</h2>
      <p style={p}>
        本文档面向在 <strong>remote-app</strong> 模板基础上开发新子应用的工程师，
        涵盖与 host-app 集成时所有必须遵守的规范和约定。
      </p>
      <div>
        <span style={tag('React 19')}>React 19</span>
        <span style={tag('Webpack 5 MF')}>Webpack 5 MF</span>
        <span style={tag('CSS-in-JS', '#722ed1')}>CSS-in-JS</span>
        <span style={tag('Module Federation', '#13c2c2')}>Module Federation</span>
      </div>

      <div style={divider} />

      {/* ── 1. 架构概览 ── */}
      <h3 style={h3}>1. 架构概览</h3>
      <p style={p}>
        子应用以两种模式运行：
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: 'var(--color-bg-secondary, #f5f7fa)' }}>
            {['模式', '路由器', '布局', '主题来源', '说明'].map((h) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--color-border, #e8eaec)', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['standalone', 'BrowserRouter', '完整（Header + Sidebar）', '本地默认值', '直接访问 localhost:PORT'],
            ['embedded',   'MemoryRouter*', '仅 Sidebar + Content',    'host 注入',  'host 通过 MF 加载'],
          ].map((row) => (
            <tr key={row[0]} style={{ borderBottom: '1px solid var(--color-border-light, #f0f0f0)' }}>
              {row.map((cell, i) => (
                <td key={i} style={{ padding: '8px 12px', fontSize: 13 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ ...p, fontSize: 12, color: 'var(--color-text-secondary, #888)' }}>
        * 本模板使用状态内路由（useState 页面切换）；如需 React Router，请使用 MemoryRouter 避免与 host BrowserRouter 冲突。
      </p>

      <div style={divider} />

      {/* ── 2. Props 接口 ── */}
      <h3 style={h3}>2. EmbeddedApp Props 接口</h3>
      <p style={p}>host-app 通过 Module Federation 加载 <code style={code}>./EmbeddedApp</code>，并注入以下 props：</p>
      <pre style={pre}>{`// host-app/SubAppWrapper.jsx 注入示例
const injectedProps = {
  embedded:     true,               // boolean  — 必须为 true
  theme:        themeVars,          // object   — CSS 变量 map（见第 3 节）
  basePath:     '/app/my-app',      // string   — 子应用路由前缀
  currentRoute: subRoute,           // string   — 子路由（如 '/detail/1'）
  onRouteChange: handleRouteChange, // function — 子应用路由变更回调
  eventBus:     EventBus,           // object   — 全局事件总线
  token:        userToken,          // string   — JWT 令牌
  userInfo:     { name, roles },    // object   — 当前用户信息
  appId:        'my-app',           // string   — 应用唯一标识
  version:      '1.0.0',            // string   — 版本号
};`}</pre>

      <div style={warn}>
        ⚠️ <strong>必须检查 embedded prop</strong>：所有仅在独立模式下显示的元素（Header、登录页等）
        都应加 <code style={{ ...code, background: 'transparent', border: 'none', padding: 0 }}>{`{!embedded && <Header />}`}</code> 守卫。
      </div>

      <div style={divider} />

      {/* ── 3. 主题规范 ── */}
      <h3 style={h3}>3. 主题与风格规范（重点）</h3>

      <h4 style={h4}>3.1 host 主题格式</h4>
      <p style={p}>
        host-app 传入的 <code style={code}>theme</code> 是一个 <strong>CSS 自定义属性 map</strong>，
        键名以 <code style={code}>--</code> 开头，与 CSS 变量名完全一致：
      </p>
      <pre style={pre}>{`// host 传入的 theme 对象示例（light 主题）
{
  '--color-primary':      '#1890ff',
  '--color-primary-dark': '#096dd9',
  '--color-primary-light':'#e6f7ff',
  '--color-accent':       '#52c41a',
  '--color-bg':           '#ffffff',
  '--color-bg-secondary': '#f5f5f5',
  '--color-bg-hover':     '#f0f0f0',
  '--color-text':         '#333333',
  '--color-text-secondary':'#666666',
  '--color-text-inverse': '#ffffff',
  '--color-border':       '#d9d9d9',
  '--color-border-light': '#e8e8e8',
  '--color-success':      '#52c41a',
  '--color-warning':      '#faad14',
  '--color-error':        '#ff4d4f',
  '--color-info':         '#1890ff',
  '--color-success-bg':   '#f6ffed',
  '--color-warning-bg':   '#fffbe6',
  '--color-error-bg':     '#fff2f0',
  '--color-info-bg':      '#e6f7ff',
  '--spacing-xs':         '4px',
  '--spacing-sm':         '8px',
  '--spacing-md':         '16px',
  '--spacing-lg':         '24px',
  '--spacing-xl':         '32px',
  '--border-radius-sm':   '2px',
  '--border-radius-md':   '4px',
  '--border-radius-lg':   '8px',
  '--shadow-sm':          '0 2px 4px rgba(0,0,0,0.1)',
  '--shadow-md':          '0 4px 12px rgba(0,0,0,0.15)',
  '--shadow-lg':          '0 8px 24px rgba(0,0,0,0.2)',
}`}</pre>

      <h4 style={h4}>3.2 从 theme 提取颜色（正确姿势）</h4>
      <pre style={pre}>{`// ✅ 正确：读取 CSS-var key
const primaryColor = theme?.['--color-primary'] || '#1890ff';
const bgColor      = theme?.['--color-bg']      || '#fff';
const textColor    = theme?.['--color-text']    || '#333';

// ❌ 错误：host 不会发送 primaryColor 字段
const primaryColor = theme?.primaryColor;  // => undefined！`}</pre>

      <h4 style={h4}>3.3 注入 CSS 变量到 :root（推荐）</h4>
      <p style={p}>
        EmbeddedApp 内置了 CSS 变量注入逻辑。注入后，子应用的任何 CSS 文件都可以
        直接通过 <code style={code}>var(--color-primary)</code> 消费 host 的主题色，
        无需 prop drilling：
      </p>
      <pre style={pre}>{`// EmbeddedApp.jsx（已内置，开发者无需重复）
useEffect(() => {
  if (embedded && theme) {
    Object.entries(theme).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        document.documentElement.style.setProperty(key, value);
      }
    });
  }
}, [embedded, theme]);`}</pre>

      <h4 style={h4}>3.4 CSS 文件中使用主题色（优先推荐）</h4>
      <p style={p}>
        在 CSS / CSS Modules 中通过 CSS 变量引用 host 主题，配合 fallback 保证独立运行时也正常：
      </p>
      <pre style={pre}>{`/* ✅ 推荐：CSS 变量 + fallback */
.btn-primary {
  background-color: var(--color-primary, #1890ff);
  color: var(--color-text-inverse, #ffffff);
  border-radius: var(--border-radius-md, 4px);
}

.sidebar {
  background-color: var(--color-bg-secondary, #f5f5f5);
  border-right: 1px solid var(--color-border, #d9d9d9);
}

/* ❌ 避免：硬编码颜色，无法响应主题切换 */
.btn-primary {
  background-color: #1890ff;   /* ← 无法被主题覆盖 */
}`}</pre>

      <h4 style={h4}>3.5 CSS-in-JS 中使用主题色</h4>
      <p style={p}>
        如果使用 inline styles，在使用颜色时直接引用从 prop 提取的 <code style={code}>primaryColor</code>，
        其他中性色优先使用 <code style={code}>var(--xxx)</code> 字符串而非硬编码：
      </p>
      <pre style={pre}>{`// ✅ 推荐：主色用 primaryColor prop，中性色用 CSS var
const btnStyle = {
  background: primaryColor,                          // 主色，跟随主题
  color: '#fff',
  border: '1px solid var(--color-border, #d9d9d9)', // 中性色，跟随主题
  borderRadius: 'var(--border-radius-md, 4px)',
};

// ⚠️ 可接受但不推荐：中性色也硬编码（切换深色主题时会失效）
const btnStyle = { background: primaryColor, border: '1px solid #d9d9d9' };`}</pre>

      <div style={info}>
        💡 <strong>命名规范一览</strong>：子应用内部如需自定义变量名，
        与 host 不同名时请在 ThemeProvider（或 EmbeddedApp）中做桥接映射，
        参考 EIA-S0-app 中的 <code style={{ ...code, background: 'transparent', border: 'none', padding: 0 }}>HOST_TO_LOCAL_BRIDGE</code> 实现。
      </div>

      <div style={divider} />

      {/* ── 4. 路由规范 ── */}
      <h3 style={h3}>4. 路由规范</h3>

      <h4 style={h4}>4.1 嵌入模式必须使用 MemoryRouter</h4>
      <pre style={pre}>{`import { MemoryRouter, BrowserRouter, Routes, Route } from 'react-router-dom';

function EmbeddedApp({ embedded }) {
  const Router = embedded ? MemoryRouter : BrowserRouter;
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/detail/:id" element={<DetailPage />} />
      </Routes>
    </Router>
  );
}
// MemoryRouter 将路由状态保存在内存，不操作浏览器 history，
// 避免与 host-app 的 BrowserRouter 发生冲突。`}</pre>

      <h4 style={h4}>4.2 路由变更同步</h4>
      <pre style={pre}>{`// 子应用内部路由变化时，通过 onRouteChange 回调通知 host
function MyPage({ onRouteChange }) {
  const navigate = useNavigate();
  const goToDetail = (id) => {
    navigate(\`/detail/\${id}\`);
    onRouteChange?.(\`/detail/\${id}\`);  // 同步到 host URL
  };
}`}</pre>

      <div style={divider} />

      {/* ── 5. EventBus 通信 ── */}
      <h3 style={h3}>5. EventBus 跨应用通信</h3>
      <pre style={pre}>{`import { getEventBus } from '../services/eventBus';

function MyComponent({ eventBus }) {
  const bus = getEventBus(eventBus);  // 优先用 host 注入，否则用本地 fallback

  // 发送事件给 host
  bus.emit('subapp:data:updated', { count: 42 });

  // 监听 host 事件
  useEffect(() => {
    const off = bus.on('host:user:changed', (user) => {
      setCurrentUser(user);
    });
    return off;  // 清理订阅
  }, [bus]);
}`}</pre>

      <p style={p}>
        host-app 会监听 <code style={code}>subapp:ready</code> 确认子应用加载完成；
        子应用应在挂载时 emit 此事件。
      </p>

      <div style={divider} />

      {/* ── 6. Webpack 配置规范 ── */}
      <h3 style={h3}>6. Webpack Module Federation 配置规范</h3>

      <h4 style={h4}>6.1 必须暴露的模块</h4>
      <pre style={pre}>{`new ModuleFederationPlugin({
  name: 'myApp',          // ⚠️ 必须与 host menuConfig 中的 containerName 一致
  filename: 'remoteEntry.js',
  exposes: {
    './EmbeddedApp': './src/EmbeddedApp',  // ⚠️ 必须暴露此路径
    './App':         './src/App',           // 可选：独立首页
  },
  shared: {
    react:     { singleton: true, requiredVersion: '>=18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.0.0' },
  },
})`}</pre>

      <div style={warn}>
        ⚠️ <strong>react / react-dom 必须设置 singleton: true</strong>，否则 host 和子应用各自加载
        一份 React 实例，导致 hook 报错（"Invalid hook call"）。
      </div>

      <h4 style={h4}>6.2 CSS Modules 配置（如果使用）</h4>
      <pre style={pre}>{`// webpack.config.js — CSS Modules 规则
{
  test: /\\.module\\.css$/i,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]',
          namedExport: false,   // ⚠️ css-loader v7 必须显式设为 false
        },
      },
    },
  ],
},`}</pre>

      <div style={divider} />

      {/* ── 7. host 菜单配置 ── */}
      <h3 style={h3}>7. host-app 菜单配置项格式</h3>
      <pre style={pre}>{`// host-app menuConfig.json 中的子应用条目
{
  "id": "subapp-my-app",
  "type": "subapp",
  "label": "我的应用",
  "icon": "🚀",
  "order": 5,
  "config": {
    "appId":         "my-app",        // 业务 ID，传给子应用的 appId prop
    "containerName": "myApp",         // ⚠️ 必须与 webpack name 一致
    "entryUrl":      "http://localhost:7003/remoteEntry.js",
    "route":         "/my-app"        // host 路由前缀，不含尾斜线
  }
}`}</pre>

      <div style={divider} />

      {/* ── 8. 开发工作流 ── */}
      <h3 style={h3}>8. 开发工作流</h3>
      <pre style={pre}>{`# 1. 克隆 remote-app 模板
cp -r remote-app my-new-app && cd my-new-app

# 2. 安装依赖
npm install

# 3. 独立模式开发（端口默认 7001）
PORT=7003 npm start    # 覆盖端口避免冲突

# 4. 修改 APP_NAME（与 host menuConfig.containerName 对应）
APP_NAME=myApp PORT=7003 npm start

# 5. 在 host-app 的 menuConfig 中注册（或通过"添加并生成子应用"功能）
# 6. 刷新 host-app → 子应用自动加载`}</pre>

      <h4 style={h4}>开发检查清单</h4>
      <ul style={{ fontSize: 13, lineHeight: 2 }}>
        {[
          'embedded=true 时 Header 已隐藏',
          'webpack name 与 host menuConfig.containerName 一致',
          './EmbeddedApp 已在 exposes 中暴露',
          'react / react-dom 设置了 singleton: true',
          'CSS Modules 设置了 namedExport: false（如果使用）',
          '主色从 theme["--color-primary"] 读取，而非 theme.primaryColor',
          '嵌入模式路由使用 MemoryRouter，不操作 window.history',
          '组件卸载时清理所有 EventBus 订阅',
          '挂载时 emit subapp:ready 事件',
        ].map((item) => (
          <li key={item}>☑ {item}</li>
        ))}
      </ul>

      <div style={divider} />

      {/* ── 9. 常见错误 ── */}
      <h3 style={h3}>9. 常见错误排查</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--color-bg-secondary, #f5f7fa)' }}>
            {['错误信息', '原因', '解决方案'].map((h) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--color-border, #e8eaec)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['Container "xxx" not found', 'webpack name 与 containerName 不一致', '对齐两处 name 字段'],
            ['Invalid hook call', 'React singleton 未设置', 'shared.react.singleton: true'],
            ['styles.xxx is undefined', 'css-loader v7 namedExport 默认改为 true', 'namedExport: false'],
            ['useXxx must be used within Provider', '子应用未包裹对应 Provider', '检查 AppProviders 层级'],
            ['子应用颜色不跟随主题', '硬编码颜色 or theme 读取方式错误', '用 var(--color-primary) 或 theme["--color-primary"]'],
            ['子应用显示自己的 Header', 'embedded=true 时未隐藏 Header', '{!embedded && <Header />}'],
            ['路由冲突 / 404', '嵌入模式用了 BrowserRouter', '换为 MemoryRouter'],
          ].map((row) => (
            <tr key={row[0]} style={{ borderBottom: '1px solid var(--color-border-light, #f0f0f0)' }}>
              {row.map((cell, i) => (
                <td key={i} style={{ padding: '8px 12px', fontFamily: i === 0 ? 'monospace' : 'inherit', fontSize: 12 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default DemoFeaturePage;
