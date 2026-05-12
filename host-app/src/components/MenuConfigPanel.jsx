import React, { useState } from 'react';
import { menuConfigService } from '../services/menuConfigService';
import { AppRegistry } from '../services/AppRegistry';

/**
 * Slide-in settings panel for managing registered sub-apps.
 * Props:
 *   open         {boolean}  whether the panel is visible
 *   onClose      {function} close callback
 *   menus        {array}    current menu list
 *   onMenuChange {function} called after any menu mutation
 */
function MenuConfigPanel({ open, onClose, menus, onMenuChange }) {
  const [addForm, setAddForm] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});

  function startAdd() {
    setFormValues({
      label: '',
      icon: '📦',
      appId: '',
      containerName: '',
      port: '7003',
      route: '',
      primaryColor: '#1890ff',
      modulePath: './EmbeddedApp',
    });
    setFormErrors({});
    setAddForm(true);
  }

  function cancelAdd() {
    setAddForm(null);
    setFormErrors({});
  }

  function handleFieldChange(key, value) {
    setFormValues((v) => ({ ...v, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateForm() {
    const errs = {};
    if (!formValues.label?.trim()) errs.label = '必填';
    if (!formValues.appId?.trim()) errs.appId = '必填';
    if (!formValues.containerName?.trim()) errs.containerName = '必填';
    const port = parseInt(formValues.port, 10);
    if (!formValues.port || isNaN(port)) errs.port = '必填';
    if (!formValues.route?.trim() || !formValues.route.startsWith('/')) errs.route = '必须以 / 开头';
    return errs;
  }

  function handleSave() {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    menuConfigService.addMenu({
      type: 'subapp',
      label: formValues.label,
      icon: formValues.icon || '📦',
      config: {
        appId: formValues.appId,
        route: formValues.route,
        entryUrl: `http://localhost:${formValues.port}/remoteEntry.js`,
        containerName: formValues.containerName,
        modulePath: formValues.modulePath || './EmbeddedApp',
        primaryColor: formValues.primaryColor || '#1890ff',
      },
    });
    setAddForm(null);
    if (onMenuChange) onMenuChange();
  }

  function handleDelete(menuId, appId) {
    menuConfigService.removeMenu(menuId);
    if (appId) AppRegistry.invalidate(appId);
    if (onMenuChange) onMenuChange();
  }

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 999,
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    transition: 'opacity 0.2s',
  };

  const panelStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: 420,
    background: '#fff',
    zIndex: 1000,
    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
  };

  const subapps = menus.filter((m) => m.type === 'subapp');

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>⚙️ 菜单配置</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999',
          }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Registered sub-apps list */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, color: '#262626' }}>
                已注册子应用 ({subapps.length})
              </h3>
              <button
                onClick={startAdd}
                style={{
                  padding: '6px 14px', background: '#1890ff', color: '#fff',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                }}
              >
                + 手动添加
              </button>
            </div>

            {subapps.length === 0 && !addForm && (
              <div style={{
                textAlign: 'center', padding: '32px 0', color: '#bbb', fontSize: 14,
                border: '1px dashed #e8eaec', borderRadius: 8,
              }}>
                暂无注册子应用。
                <br />使用「创建子应用」页面生成并自动注册，或点击「手动添加」。
              </div>
            )}

            {subapps.map((menu) => (
              <SubAppCard
                key={menu.id}
                menu={menu}
                onDelete={() => handleDelete(menu.id, menu.config?.appId)}
              />
            ))}
          </div>

          {/* Add form */}
          {addForm && (
            <AddForm
              values={formValues}
              errors={formErrors}
              onChange={handleFieldChange}
              onSave={handleSave}
              onCancel={cancelAdd}
            />
          )}

          {/* Built-in menus info */}
          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontSize: 14, color: '#262626', margin: '0 0 12px' }}>内置菜单</h3>
            {menus
              .filter((m) => m.type === 'builtin')
              .map((m) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 8,
                  fontSize: 14, color: '#595959',
                }}>
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <span>{m.label}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, color: '#aaa',
                    border: '1px solid #e8eaec', borderRadius: 4, padding: '1px 6px',
                  }}>内置</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SubAppCard({ menu, onDelete }) {
  const { config = {} } = menu;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: '1px solid #e8eaec', borderRadius: 8, marginBottom: 10, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
        background: '#fafcff', cursor: 'pointer',
      }} onClick={() => setExpanded((v) => !v)}>
        <span style={{ fontSize: 18 }}>{menu.icon || '📦'}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{menu.label}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#8c8c8c', fontFamily: 'monospace' }}>
            {config.entryUrl || '—'}
          </p>
        </div>
        <span style={{ color: '#bbb', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
        {menu.deletable !== false && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              padding: '4px 10px', background: 'transparent', color: '#ff4d4f',
              border: '1px solid #ffccc7', borderRadius: 4, cursor: 'pointer', fontSize: 12,
            }}
          >
            移除
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#595959' }}>
          {[
            ['appId', config.appId],
            ['containerName', config.containerName],
            ['route', config.route],
            ['modulePath', config.modulePath],
            ['primaryColor', config.primaryColor],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#aaa', width: 120, flexShrink: 0 }}>{k}</span>
              <span style={{ fontFamily: 'monospace' }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iStyle = (err) => ({
  width: '100%',
  padding: '7px 10px',
  border: `1px solid ${err ? '#ff4d4f' : '#d9d9d9'}`,
  borderRadius: 6,
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
});

function AddForm({ values, errors, onChange, onSave, onCancel }) {
  const fields = [
    { key: 'label', label: '菜单标签 *', placeholder: 'EIA-S1 模板管理' },
    { key: 'icon', label: '图标 (emoji)', placeholder: '📦' },
    { key: 'appId', label: '应用ID *', placeholder: 'eia-s1-app' },
    { key: 'containerName', label: '容器名 *', placeholder: 'eiaS1App' },
    { key: 'port', label: '端口 *', placeholder: '7003', type: 'number' },
    { key: 'route', label: '路由 *', placeholder: '/eia-s1' },
    { key: 'modulePath', label: '模块路径', placeholder: './EmbeddedApp' },
    { key: 'primaryColor', label: '主色调', placeholder: '#1890ff' },
  ];

  return (
    <div style={{
      border: '1px solid #d0e4ff', borderRadius: 8, padding: 16, background: '#f6f9ff', marginBottom: 16,
    }}>
      <h4 style={{ margin: '0 0 14px', fontSize: 14 }}>手动添加子应用</h4>
      {fields.map(({ key, label, placeholder, type }) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#444' }}>
            {label}
          </label>
          <input
            type={type || 'text'}
            style={iStyle(errors[key])}
            placeholder={placeholder}
            value={values[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
          />
          {errors[key] && (
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#ff4d4f' }}>{errors[key]}</p>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={onSave} style={{
          padding: '8px 18px', background: '#1890ff', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
        }}>保存</button>
        <button onClick={onCancel} style={{
          padding: '8px 14px', background: 'transparent', color: '#666',
          border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', fontSize: 13,
        }}>取消</button>
      </div>
    </div>
  );
}

export default MenuConfigPanel;
