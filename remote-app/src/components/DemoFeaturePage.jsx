import React, { useState } from 'react';

const PAGES = {
  home: HomePage,
  'feature-a': FeatureAPage,
  'feature-b': FeatureBPage,
  about: AboutPage,
};

function DemoFeaturePage({ pageName = 'home', primaryColor = '#1890ff', token, userInfo, eventBus }) {
  const Page = PAGES[pageName] || HomePage;
  return <Page primaryColor={primaryColor} token={token} userInfo={userInfo} eventBus={eventBus} />;
}

function HomePage({ primaryColor }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>欢迎使用子应用模板</h2>
      <p style={{ color: '#666' }}>这是基于 remote-app 模板创建的子应用。您可以在此处替换为您的业务功能。</p>

      <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
        {[
          { label: '功能模块', value: '4', icon: '📦' },
          { label: '组件数量', value: '12+', icon: '🧩' },
          { label: 'API 接口', value: '8', icon: '🔌' },
          { label: '运行状态', value: '正常', icon: '✅' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#fff',
              border: '1px solid #e8eaec',
              borderRadius: 8,
              padding: '16px 24px',
              minWidth: 120,
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 28 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: primaryColor }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{stat.label}</div>
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
          style={{
            padding: '8px 16px',
            background: primaryColor,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          + 新增
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f5f7fa' }}>
            {['ID', '名称', '状态', '操作'].map((h) => (
              <th
                key={h}
                style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e8eaec' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 12px', color: '#999' }}>{item.id}</td>
              <td style={{ padding: '10px 12px' }}>{item.name}</td>
              <td style={{ padding: '10px 12px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 12,
                    background: item.status === '启用' ? '#f6ffed' : '#fff2f0',
                    color: item.status === '启用' ? '#52c41a' : '#ff4d4f',
                    border: `1px solid ${item.status === '启用' ? '#b7eb8f' : '#ffccc7'}`,
                  }}
                >
                  {item.status}
                </span>
              </td>
              <td style={{ padding: '10px 12px' }}>
                <button
                  onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                  style={{
                    padding: '4px 10px',
                    background: 'transparent',
                    color: '#ff4d4f',
                    border: '1px solid #ffccc7',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
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

function FeatureBPage({ primaryColor }) {
  const [config, setConfig] = useState({ apiUrl: 'http://localhost:5090', timeout: 30, debug: false });

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>功能 B — 配置管理</h2>
      <div style={{ maxWidth: 480 }}>
        {[
          { label: 'API 基础地址', key: 'apiUrl', type: 'text' },
          { label: '超时时间 (秒)', key: 'timeout', type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              {label}
            </label>
            <input
              type={type}
              value={config[key]}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  [key]: type === 'number' ? Number(e.target.value) : e.target.value,
                }))
              }
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="debug"
            checked={config.debug}
            onChange={(e) => setConfig((c) => ({ ...c, debug: e.target.checked }))}
          />
          <label htmlFor="debug" style={{ fontSize: 14 }}>
            开启调试模式
          </label>
        </div>
        <button
          onClick={() => alert(JSON.stringify(config, null, 2))}
          style={{
            padding: '10px 24px',
            background: primaryColor,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          保存配置
        </button>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>关于本应用</h2>
      <p>本应用基于 <strong>micro-front-REACT</strong> 模板框架构建，支持通过 Module Federation 嵌入到 host-app 主应用中。</p>
      <h3>技术栈</h3>
      <ul>
        {['React 19', 'Webpack 5 Module Federation', 'CSS-in-JS (inline styles)'].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <h3>集成规范</h3>
      <p>通过 <code>./EmbeddedApp</code> 模块暴露，接受以下 props：</p>
      <ul>
        {[
          'embedded — 是否嵌入模式',
          'theme — 主题配置 { primaryColor }',
          'basePath — 路由前缀',
          'eventBus — 跨应用事件总线',
          'token — 身份认证令牌',
          'userInfo — 当前用户信息',
          'appId — 应用标识',
          'appName — 显示名称',
        ].map((p) => (
          <li key={p} style={{ fontFamily: 'monospace', fontSize: 13 }}>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DemoFeaturePage;
