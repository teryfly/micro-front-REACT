import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { TEMPLATE_FILES, applyVars } from '../templates/remoteAppTemplate';
import { menuConfigService } from '../services/menuConfigService';

const DEFAULT_VALUES = {
  appName: '',
  appId: '',
  containerName: '',
  port: '7003',
  route: '',
  primaryColor: '#1890ff',
  description: '',
  apiBaseUrl: 'http://localhost:5090',
};

// Convert display name to kebab-case app ID
function toKebab(str) {
  return str
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Convert display name to camelCase container name
function toCamel(str) {
  return str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

function FieldGroup({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#262626' }}>
        {label}
      </label>
      {hint && <p style={{ margin: '0 0 6px', fontSize: 12, color: '#8c8c8c' }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

function AppGeneratorPage({ onMenuChange }) {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | 'generating' | 'done' | 'error'
  const [resultMsg, setResultMsg] = useState('');

  const set = useCallback((key, value) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-derive appId and containerName from appName
      if (key === 'appName') {
        if (!prev.appId || prev.appId === toKebab(prev.appName)) {
          next.appId = toKebab(value);
        }
        if (!prev.containerName || prev.containerName === toCamel(prev.appName)) {
          next.containerName = toCamel(value);
        }
        if (!prev.route || prev.route === '/' + toKebab(prev.appName)) {
          next.route = '/' + toKebab(value);
        }
      }
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  function validate() {
    const errs = {};
    if (!values.appName.trim()) errs.appName = '请输入应用名称';
    if (!values.appId.trim()) errs.appId = '请输入应用ID';
    if (!/^[a-z][a-z0-9-]*$/.test(values.appId))
      errs.appId = '只允许小写字母、数字和连字符，且以字母开头';
    if (!values.containerName.trim()) errs.containerName = '请输入容器名';
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(values.containerName))
      errs.containerName = '只允许字母和数字，以字母开头';
    const port = parseInt(values.port, 10);
    if (!values.port || isNaN(port) || port < 1024 || port > 65535)
      errs.port = '请输入有效端口号 (1024–65535)';
    if (!values.route.trim() || !values.route.startsWith('/'))
      errs.route = '路由必须以 / 开头';
    if (!values.primaryColor.match(/^#[0-9a-fA-F]{6}$/))
      errs.primaryColor = '请输入有效的 hex 颜色值，如 #1890ff';
    return errs;
  }

  async function handleGenerate() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus('generating');
    setResultMsg('');

    try {
      const vars = {
        APP_NAME: values.appName,
        APP_ID: values.appId,
        CONTAINER_NAME: values.containerName,
        PORT: values.port,
        ROUTE: values.route,
        PRIMARY_COLOR: values.primaryColor,
        DESCRIPTION: values.description || `${values.appName} 微前端子应用`,
        API_BASE_URL: values.apiBaseUrl,
      };

      // Build ZIP
      const zip = new JSZip();
      const folder = zip.folder(values.appId);

      Object.entries(TEMPLATE_FILES).forEach(([filePath, content]) => {
        folder.file(filePath, applyVars(content, vars));
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${values.appId}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      // Auto-register to host menu
      const alreadyRegistered = await menuConfigService.isRegistered(values.appId);
      if (!alreadyRegistered) {
        await menuConfigService.addSubApp({
          label: values.appName,
          icon: '📦',
          config: {
            appId: values.appId,
            route: values.route,
            entryUrl: `http://localhost:${values.port}/remoteEntry.js`,
            containerName: values.containerName,
            modulePath: './EmbeddedApp',
            primaryColor: values.primaryColor,
          },
        });
        if (onMenuChange) onMenuChange();
        setResultMsg(`已生成 ${values.appId}.zip 并注册到菜单。解压后运行 npm install && npm start 即可访问。`);
      } else {
        setResultMsg(`已生成 ${values.appId}.zip（该应用已在菜单中，跳过重复注册）。`);
      }

      setStatus('done');
    } catch (err) {
      setResultMsg(`生成失败: ${err.message}`);
      setStatus('error');
    }
  }

  const isGenerating = status === 'generating';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>✨ 创建子应用</h2>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          基于 remote-app 模板生成新的微前端子应用，填写配置后一键下载源码并自动注册到菜单。
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8eaec', borderRadius: 10, padding: '28px 32px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, color: '#1890ff', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
          基本信息
        </h3>

        <FieldGroup label="应用名称 *" hint="在菜单中显示的名称，如「EIA-S1 模板管理」">
          <input
            style={{ ...inputStyle, borderColor: errors.appName ? '#ff4d4f' : '#d9d9d9' }}
            placeholder="EIA-S1 模板管理"
            value={values.appName}
            onChange={(e) => set('appName', e.target.value)}
          />
          {errors.appName && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{errors.appName}</p>}
        </FieldGroup>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FieldGroup label="应用ID *" hint="kebab-case，如 eia-s1-app">
            <input
              style={{ ...inputStyle, borderColor: errors.appId ? '#ff4d4f' : '#d9d9d9' }}
              placeholder="eia-s1-app"
              value={values.appId}
              onChange={(e) => set('appId', e.target.value)}
            />
            {errors.appId && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{errors.appId}</p>}
          </FieldGroup>

          <FieldGroup label="Webpack 容器名 *" hint="camelCase，需与 webpack name 一致">
            <input
              style={{ ...inputStyle, borderColor: errors.containerName ? '#ff4d4f' : '#d9d9d9' }}
              placeholder="eiaS1App"
              value={values.containerName}
              onChange={(e) => set('containerName', e.target.value)}
            />
            {errors.containerName && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{errors.containerName}</p>
            )}
          </FieldGroup>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FieldGroup label="开发端口 *" hint="子应用 dev server 端口，如 7003">
            <input
              style={{ ...inputStyle, borderColor: errors.port ? '#ff4d4f' : '#d9d9d9' }}
              placeholder="7003"
              type="number"
              min="1024"
              max="65535"
              value={values.port}
              onChange={(e) => set('port', e.target.value)}
            />
            {errors.port && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{errors.port}</p>}
          </FieldGroup>

          <FieldGroup label="路由路径 *" hint="在 host-app 中的路由，如 /eia-s1">
            <input
              style={{ ...inputStyle, borderColor: errors.route ? '#ff4d4f' : '#d9d9d9' }}
              placeholder="/eia-s1"
              value={values.route}
              onChange={(e) => set('route', e.target.value)}
            />
            {errors.route && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{errors.route}</p>}
          </FieldGroup>
        </div>

        <h3 style={{ margin: '24px 0 20px', fontSize: 15, color: '#1890ff', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
          外观与后端
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          <FieldGroup label="主色调" hint="十六进制颜色值">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={values.primaryColor}
                onChange={(e) => set('primaryColor', e.target.value)}
                style={{ width: 48, height: 38, border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', padding: 2 }}
              />
              <input
                style={{ ...inputStyle, flex: 1, borderColor: errors.primaryColor ? '#ff4d4f' : '#d9d9d9' }}
                value={values.primaryColor}
                onChange={(e) => set('primaryColor', e.target.value)}
              />
            </div>
            {errors.primaryColor && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{errors.primaryColor}</p>
            )}
          </FieldGroup>

          <FieldGroup label="API 基础地址" hint="后端接口地址，写入子应用的 .env">
            <input
              style={inputStyle}
              placeholder="http://localhost:5090"
              value={values.apiBaseUrl}
              onChange={(e) => set('apiBaseUrl', e.target.value)}
            />
          </FieldGroup>
        </div>

        <FieldGroup label="描述">
          <input
            style={inputStyle}
            placeholder="简短描述该子应用的功能"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </FieldGroup>

        {/* Preview card */}
        {values.appId && (
          <div style={{
            background: '#f6f9ff', border: '1px solid #d0e4ff', borderRadius: 8,
            padding: '14px 16px', marginBottom: 20, fontSize: 13,
          }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#1890ff' }}>生成预览</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 0', color: '#444' }}>
              {[
                ['entryUrl', `http://localhost:${values.port}/remoteEntry.js`],
                ['containerName', values.containerName],
                ['route', values.route],
                ['primaryColor', values.primaryColor],
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <span style={{ color: '#8c8c8c' }}>{k}:</span>
                  <span style={{ fontFamily: 'monospace' }}>{v}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Status message */}
        {status === 'done' && (
          <div style={{
            background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8,
            padding: '12px 16px', marginBottom: 16, color: '#52c41a', fontSize: 14,
          }}>
            ✅ {resultMsg}
          </div>
        )}
        {status === 'error' && (
          <div style={{
            background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8,
            padding: '12px 16px', marginBottom: 16, color: '#ff4d4f', fontSize: 14,
          }}>
            ❌ {resultMsg}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              padding: '10px 28px',
              background: isGenerating ? '#bae7ff' : '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {isGenerating ? '生成中…' : '⬇ 生成并下载'}
          </button>
          <button
            onClick={() => { setValues(DEFAULT_VALUES); setErrors({}); setStatus(null); }}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#666',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            重置
          </button>
        </div>

        {/* Instructions */}
        <div style={{ marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: 8, fontSize: 13, color: '#666' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#262626' }}>使用步骤</p>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
            <li>填写配置 → 点击「生成并下载」</li>
            <li>解压下载的 <code>.zip</code> 文件到本地目录</li>
            <li>进入目录，运行 <code>npm install</code></li>
            <li>运行 <code>npm start</code>，子应用在端口 <strong>{values.port}</strong> 启动</li>
            <li>回到 host-app，点击左侧菜单中刚注册的「{values.appName || '新应用'}」即可访问</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default AppGeneratorPage;
