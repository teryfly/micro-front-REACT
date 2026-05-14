import React, { useState, useCallback, useEffect, useRef } from 'react';
import { menuConfigService } from '../services/menuConfigService';
import AppRegistry from '../core/AppRegistry';
import { DEFAULT_MENU_CONFIG } from '../types/menuConfig.types';

/* ── localStorage 常量（与 menuConfigService 保持一致） ── */
const STORAGE_KEY_PREFIX = 'MENU_CONFIG_USER_';
const CURRENT_USER_KEY   = 'CURRENT_USER_ID';

/* ── 工具函数 ──────────────────────────────────────────────────── */
const toKebab = (s) =>
  s.toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const toCamel = (s) =>
  s.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const fmt = (bytes) =>
  bytes < 1024 ? `${bytes} B`
  : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB`
  : `${(bytes / 1048576).toFixed(1)} MB`;

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} `
       + `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/* ── 样式常量 ──────────────────────────────────────────────────── */
const inputSt = {
  width: '100%', padding: '6px 10px',
  border: '1px solid #d9d9d9', borderRadius: 5,
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', color: '#262626',
};
const inputErrSt = { ...inputSt, borderColor: '#ff4d4f' };
const labelSt    = { display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 3, color: '#262626' };
const hintSt     = { margin: '0 0 3px', fontSize: 11, color: '#8c8c8c' };
const errSt      = { margin: '2px 0 0', fontSize: 11, color: '#ff4d4f' };

const DEFAULTS = {
  appName: '', appId: '', containerName: '', port: '7003',
  route: '', primaryColor: '#1890ff', description: '', apiBaseUrl: 'http://localhost:5090',
};

/* ── 表单字段 ──────────────────────────────────────────────────── */
function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={labelSt}>{label}</label>
      {hint  && <p style={hintSt}>{hint}</p>}
      {children}
      {error && <p style={errSt}>{error}</p>}
    </div>
  );
}

/* ── 进度条 ────────────────────────────────────────────────────── */
function ProgressBar({ progress, color = '#1890ff' }) {
  return (
    <div style={{ height: 3, background: '#e6f7ff', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, progress))}%`,
        background: color,
        transition: progress >= 100 ? 'width 0.15s ease' : 'width 0.4s ease',
      }} />
    </div>
  );
}

/* ── 下载卡片 ──────────────────────────────────────────────────── */
function AppCard({ app, highlight }) {
  return (
    <div style={{
      border: `1px solid ${highlight ? '#1890ff' : '#e8eaec'}`,
      borderRadius: 8, padding: '12px 14px', marginBottom: 8,
      background: highlight ? '#f0f9ff' : '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>📦</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#262626', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.appId}
            {highlight && (
              <span style={{ marginLeft: 6, fontSize: 10, background: '#1890ff', color: '#fff', borderRadius: 8, padding: '1px 6px' }}>
                最新
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
            {fmt(app.sizeBytes)} · {fmtDate(app.createdAt)}
          </div>
        </div>
      </div>
      <a
        href={app.downloadUrl}
        download={app.zipName}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '7px 0',
          background: highlight ? '#1890ff' : '#f5f7fa',
          color: highlight ? '#fff' : '#1890ff',
          border: `1px solid ${highlight ? '#1890ff' : '#d0e4ff'}`,
          borderRadius: 5, fontSize: 13, fontWeight: 600,
          textDecoration: 'none', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        ⬇ 下载 {app.zipName}
      </a>
    </div>
  );
}

/* ── 主组件 ────────────────────────────────────────────────────── */
export default function AppGeneratorPage({ onMenuChange, onAppAdded }) {
  const [v,         setV]         = useState(DEFAULTS);
  const [errors,    setErrors]    = useState({});
  const [status,    setStatus]    = useState(null);   // null|'generating'|'done'|'error'
  const [statusMsg, setStatusMsg] = useState('');     // 补充消息（成功提示 / 错误详情）
  const [progress,  setProgress]  = useState(0);
  const [latestApp, setLatestApp] = useState(null);
  const [genList,   setGenList]   = useState([]);
  const timerRef = useRef(null);

  const inModal = typeof onAppAdded === 'function';

  /* 拉取历史列表 */
  const fetchList = useCallback(async () => {
    try {
      const r = await fetch('/api/list-generated');
      if (r.ok) {
        const d = await r.json();
        setGenList(d.apps || []);
      }
    } catch { /* dev server 未启动时忽略 */ }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  /* 进度条动画 */
  useEffect(() => {
    clearInterval(timerRef.current);
    if (status === 'generating') {
      setProgress(8);
      timerRef.current = setInterval(() => {
        setProgress(p => {
          const target = 85;
          return p < target ? p + (target - p) * 0.12 : p;
        });
      }, 250);
    } else if (status === 'done') {
      setProgress(100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  /* 字段更新（自动推导） */
  const set = useCallback((key, value) => {
    setV(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'appName') {
        if (!prev.appId         || prev.appId         === toKebab(prev.appName)) next.appId         = toKebab(value);
        if (!prev.containerName || prev.containerName === toCamel(prev.appName)) next.containerName = toCamel(value);
        if (!prev.route         || prev.route         === '/' + toKebab(prev.appName)) next.route   = '/' + toKebab(value);
      }
      return next;
    });
    setErrors(e => ({ ...e, [key]: undefined }));
  }, []);

  /* 表单验证 */
  function validate() {
    const e = {};
    if (!v.appName.trim())                                        e.appName       = '请输入应用名称';
    if (!v.appId.trim())                                          e.appId         = '请输入应用ID';
    else if (!/^[a-z][a-z0-9-]*$/.test(v.appId))                 e.appId         = '只允许小写字母、数字和连字符，以字母开头';
    if (!v.containerName.trim())                                  e.containerName = '请输入容器名';
    else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(v.containerName))    e.containerName = '只允许字母和数字，以字母开头';
    const port = parseInt(v.port, 10);
    if (!v.port || isNaN(port) || port < 1024 || port > 65535)   e.port          = '有效端口号 (1024–65535)';
    if (!v.route.trim() || !v.route.startsWith('/'))              e.route         = '路由必须以 / 开头';
    if (!/^#[0-9a-fA-F]{6}$/.test(v.primaryColor))               e.primaryColor  = '请输入有效 hex 颜色，如 #1890ff';
    return e;
  }

  /**
   * 直接读写 localStorage，与 menuConfigService 使用完全相同的 key。
   * 绕过 simulateApiDelay + validateMenuConfig 链，避免服务层潜在静默错误。
   */
  function saveToMenuDirect({ label, appId, route, entryUrl, containerName }) {
    // ── 读取 userId（与 menuConfigService 相同逻辑） ──
    let userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(CURRENT_USER_KEY, userId);
    }
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;

    console.log('[AppGenerator] saveToMenuDirect → storageKey:', storageKey);

    // ── 读取现有菜单配置 ──
    let menuConfig;
    try {
      const stored = localStorage.getItem(storageKey);
      menuConfig = stored
        ? JSON.parse(stored)
        : JSON.parse(JSON.stringify(DEFAULT_MENU_CONFIG));
      console.log('[AppGenerator] current items count:', menuConfig.items.length);
    } catch {
      menuConfig = JSON.parse(JSON.stringify(DEFAULT_MENU_CONFIG));
      console.warn('[AppGenerator] parse failed, using default config');
    }

    // ── 查重：按 appId 或 route ──
    const cfg = { appId, route, entryUrl, containerName };
    const existingIdx = menuConfig.items.findIndex(
      item => item.config?.appId === appId || item.config?.route === route
    );

    let itemId;
    if (existingIdx >= 0) {
      itemId = menuConfig.items[existingIdx].id;
      menuConfig.items[existingIdx] = {
        ...menuConfig.items[existingIdx],
        label, icon: '📦', config: cfg,
      };
      console.log('[AppGenerator] updated existing item:', itemId);
    } else {
      itemId = `menu-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      menuConfig.items.push({
        id: itemId, type: 'subapp', label, icon: '📦',
        order: menuConfig.items.length + 1,
        parentId: null, config: cfg,
      });
      console.log('[AppGenerator] added new item:', itemId);
    }

    // ── 直接写入 localStorage ──
    const json = JSON.stringify(menuConfig);
    localStorage.setItem(storageKey, json);
    console.log('[AppGenerator] saved to localStorage, items count:', menuConfig.items.length,
      '| key:', storageKey, '| size:', json.length, 'bytes');

    // ── 验证写入是否成功 ──
    const verify = localStorage.getItem(storageKey);
    if (!verify) throw new Error('localStorage.setItem 失败（可能存储已满）');
    console.log('[AppGenerator] write verified ✓');

    // ── 注册到 AppRegistry ──
    AppRegistry.registerApp({
      id: itemId, name: containerName, displayName: label,
      entryUrl, route, enabled: true, logicalAppId: appId,
    });

    return itemId;
  }

  /* 生成 */
  async function handleGenerate() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setStatus('generating');
    setStatusMsg('');
    setLatestApp(null);

    /* ── 菜单配置（总是先写，不依赖 ZIP 生成结果） ── */
    const menuItem = {
      label:         v.appName,
      appId:         v.appId,
      route:         v.route,
      entryUrl:      `http://localhost:${v.port}/remoteEntry.js`,
      containerName: v.containerName,
    };

    if (inModal) {
      // Modal 模式：回调给父组件处理，不走下面流程
      onAppAdded({
        label: v.appName, icon: '📦',
        config: {
          appId: v.appId, route: v.route,
          entryUrl: `http://localhost:${v.port}/remoteEntry.js`,
          containerName: v.containerName,
          modulePath: './EmbeddedApp', primaryColor: v.primaryColor,
        },
      });
      setStatus('done');
      setStatusMsg('已添加！下载并运行后即可在菜单中看到新应用。');
      return;
    }

    try {
      /* ── 步骤 1：先写菜单（同步，不依赖 ZIP） ── */
      saveToMenuDirect(menuItem);

      /* ── 步骤 2：生成 ZIP ── */
      let zipData = null;
      try {
        const res = await fetch('/api/generate-subapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId:         v.appId,
            appName:       v.appName,
            containerName: v.containerName,
            port:          v.port,
            route:         v.route,
            primaryColor:  v.primaryColor,
            description:   v.description || `${v.appName} 微前端子应用`,
            apiBaseUrl:    v.apiBaseUrl,
          }),
        });
        const data = await res.json();
        if (data.success) {
          zipData = data;
          setLatestApp(data);
          await fetchList();
        } else {
          console.warn('[AppGenerator] ZIP generation failed (menu was saved):', data.error);
        }
      } catch (zipErr) {
        // ZIP 失败不影响菜单写入，记录日志即可
        console.warn('[AppGenerator] ZIP fetch error (menu was saved):', zipErr.message);
      }

      /* ── 步骤 3：成功，1.5s 后重载 ── */
      setStatus('done');
      setStatusMsg(
        zipData
          ? `「${v.appName}」已写入菜单并生成 ZIP，1.5 秒后自动返回主页…`
          : `「${v.appName}」已写入菜单（ZIP 生成失败，请检查 dev server），1.5 秒后返回主页…`
      );
      setTimeout(() => { window.location.href = '/'; }, 1500);

    } catch (err) {
      console.error('[AppGenerator] handleGenerate failed:', err);
      setStatusMsg(err.message || '未知错误，请查看控制台');
      setStatus('error');
    }
  }

  const busy = status === 'generating';

  /* ── 渲染 ── */
  return (
    /* 外层：撑满 contentArea，顶部留出固定菜单栏的高度 */
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 60, boxSizing: 'border-box', background: '#f5f5f5' }}>

      {/* ── 进度条（始终在顶部，3px 高） ──────────────────────── */}
      <ProgressBar
        progress={progress}
        color={status === 'error' ? '#ff4d4f' : status === 'done' ? '#52c41a' : '#1890ff'}
      />

      {/* ── 状态条 ─────────────────────────────────────────────── */}
      {status === 'generating' && (
        <div style={{ background: '#e6f7ff', borderBottom: '1px solid #91d5ff', padding: '7px 20px', fontSize: 13, color: '#096dd9', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          ⏳ 正在打包子应用并写入菜单，请稍候…
        </div>
      )}
      {status === 'done' && (
        <div style={{ background: '#f6ffed', borderBottom: '1px solid #b7eb8f', padding: '7px 20px', fontSize: 13, color: '#389e0d', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          ✅ {statusMsg || '生成成功！点击右侧「↻ 刷新」同步顶部菜单和下载列表。'}
        </div>
      )}
      {status === 'error' && (
        <div style={{ background: '#fff2f0', borderBottom: '1px solid #ffccc7', padding: '7px 20px', fontSize: 13, color: '#cf1322', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          ❌ 生成失败：{statusMsg || '未知错误，请查看控制台'}
        </div>
      )}

      {/* ── 主内容区（左：配置表单  右：下载列表） ─────────────── */}
      <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden', padding: '16px 20px' }}>

        {/* ═══ 左栏：配置表单（flex 1，较宽） ════════════════════ */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>

          {/* 标题 */}
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ margin: '0 0 2px', fontSize: 17, color: '#1a1a1a' }}>✨ 创建子应用</h2>
            <p style={{ margin: 0, color: '#888', fontSize: 12 }}>
              基于 remote-app 模板生成微前端子应用，生成后自动添加到菜单根目录。
            </p>
          </div>

          {/* 表单卡片 */}
          <div style={{ background: '#fff', border: '1px solid #e8eaec', borderRadius: 10, padding: '16px 18px' }}>

            {/* ── 基本信息 ── */}
            <h3 style={{ margin: '0 0 10px', fontSize: 12, color: '#1890ff', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f0f0f0', paddingBottom: 6 }}>
              基本信息
            </h3>

            <Field label="应用名称 *" hint="菜单中显示的名称" error={errors.appName}>
              <input
                style={errors.appName ? inputErrSt : inputSt}
                placeholder="EIA-S1 模板管理"
                value={v.appName}
                onChange={e => set('appName', e.target.value)}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="应用ID *" hint="kebab-case" error={errors.appId}>
                <input
                  style={errors.appId ? inputErrSt : inputSt}
                  placeholder="eia-s1-app"
                  value={v.appId}
                  onChange={e => set('appId', e.target.value)}
                />
              </Field>
              <Field label="Webpack 容器名 *" hint="camelCase" error={errors.containerName}>
                <input
                  style={errors.containerName ? inputErrSt : inputSt}
                  placeholder="eiaS1App"
                  value={v.containerName}
                  onChange={e => set('containerName', e.target.value)}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="开发端口 *" hint="dev server 端口" error={errors.port}>
                <input
                  style={errors.port ? inputErrSt : inputSt}
                  type="number" min="1024" max="65535"
                  placeholder="7003"
                  value={v.port}
                  onChange={e => set('port', e.target.value)}
                />
              </Field>
              <Field label="路由路径 *" hint="host-app 中的路由前缀" error={errors.route}>
                <input
                  style={errors.route ? inputErrSt : inputSt}
                  placeholder="/eia-s1"
                  value={v.route}
                  onChange={e => set('route', e.target.value)}
                />
              </Field>
            </div>

            {/* ── 外观与后端 ── */}
            <h3 style={{ margin: '6px 0 10px', fontSize: 12, color: '#1890ff', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f0f0f0', paddingBottom: 6 }}>
              外观与后端
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'start' }}>
              <Field label="主色调" error={errors.primaryColor}>
                <input
                  type="color"
                  value={v.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                  style={{ width: 50, height: 30, border: '1px solid #d9d9d9', borderRadius: 5, cursor: 'pointer', padding: 2 }}
                />
              </Field>
              <Field label="主色值 (hex)" error={errors.primaryColor}>
                <input
                  style={errors.primaryColor ? inputErrSt : inputSt}
                  value={v.primaryColor}
                  onChange={e => set('primaryColor', e.target.value)}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="API 基础地址">
                <input
                  style={inputSt}
                  placeholder="http://localhost:5090"
                  value={v.apiBaseUrl}
                  onChange={e => set('apiBaseUrl', e.target.value)}
                />
              </Field>
              <Field label="描述 (可选)">
                <input
                  style={inputSt}
                  placeholder="子应用功能简述"
                  value={v.description}
                  onChange={e => set('description', e.target.value)}
                />
              </Field>
            </div>

            {/* ── 配置预览 ── */}
            {v.appId && (
              <div style={{ background: '#f6f9ff', border: '1px solid #d0e4ff', borderRadius: 6, padding: '8px 12px', marginBottom: 10, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: '#1890ff', marginBottom: 4 }}>配置预览</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '2px 10px', color: '#444' }}>
                  {[
                    ['entryUrl',      `http://localhost:${v.port}/remoteEntry.js`],
                    ['containerName', v.containerName],
                    ['route',         v.route],
                    ['primaryColor',  v.primaryColor],
                  ].map(([k, val]) => (
                    <React.Fragment key={k}>
                      <span style={{ color: '#8c8c8c' }}>{k}:</span>
                      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{val}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* ── 操作按钮 ── */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleGenerate}
                disabled={busy}
                style={{
                  flex: 1, padding: '10px 0',
                  background: busy ? '#bae7ff' : '#1890ff',
                  color: '#fff', border: 'none', borderRadius: 6,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 700,
                  transition: 'background 0.2s',
                  boxShadow: busy ? 'none' : '0 2px 6px rgba(24,144,255,0.35)',
                }}
              >
                {busy ? '⏳ 生成中…' : '✨ 添加并生成子应用'}
              </button>
              <button
                onClick={() => { setV(DEFAULTS); setErrors({}); setStatus(null); setLatestApp(null); setStatusMsg(''); }}
                style={{
                  padding: '10px 16px',
                  background: 'transparent', color: '#666',
                  border: '1px solid #d9d9d9', borderRadius: 6,
                  cursor: 'pointer', fontSize: 13,
                }}
              >
                重置
              </button>
            </div>
          </div>

          {/* 使用步骤（卡片外，紧凑列表） */}
          <div style={{ marginTop: 10, padding: '9px 14px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 7, fontSize: 11, color: '#666', lineHeight: 1.9 }}>
            <strong style={{ color: '#444' }}>使用步骤：</strong>
            <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>
              <li>填写配置，点击「✨ 添加并生成子应用」</li>
              <li>菜单立即写入，页面自动刷新 — 顶部菜单出现「{v.appName || '新应用'}」</li>
              <li>在右侧点击下载 zip，解压到本地目录</li>
              <li>进入目录运行{' '}
                <code style={{ background: '#f5f5f5', padding: '1px 4px', borderRadius: 3 }}>npm install</code>
                {' '}和{' '}
                <code style={{ background: '#f5f5f5', padding: '1px 4px', borderRadius: 3 }}>npm start</code>
                （端口 {v.port}）</li>
              <li>子应用启动后，点击顶部菜单中「{v.appName || '新应用'}」即可访问</li>
            </ol>
          </div>
        </div>

        {/* ═══ 右栏：已生成的包（fixed 300px，较窄） ═══════════════ */}
        <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: '#1a1a1a' }}>📥 下载列表</h3>
            <button
              onClick={() => window.location.reload()}
              title="刷新下载列表 & 顶部菜单"
              style={{ background: '#1890ff', border: 'none', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}
            >
              ↻ 刷新
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* 最新生成（高亮） */}
            {latestApp && <AppCard app={latestApp} highlight />}

            {/* 历史列表（过滤最新那条避免重复） */}
            {genList
              .filter(a => !latestApp || a.appId !== latestApp.appId)
              .map(app => <AppCard key={app.appId} app={app} highlight={false} />)
            }

            {/* 空状态 */}
            {!latestApp && genList.length === 0 && (
              <div style={{ border: '2px dashed #e8eaec', borderRadius: 10, padding: '30px 12px', textAlign: 'center', color: '#aaa' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: 13 }}>暂无生成的包</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>填写左侧表单后生成</div>
              </div>
            )}

            {/* 说明 */}
            <div style={{ marginTop: 12, padding: '9px 11px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 7, fontSize: 11, color: '#888', lineHeight: 1.8 }}>
              <strong style={{ color: '#444' }}>说明：</strong>
              已自动填入您的配置，下载后按步骤运行即可。生成成功后菜单自动更新，页面会重载。
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
