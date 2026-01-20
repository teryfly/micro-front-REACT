/**
 * Menu Configuration Page
 * Standalone page for managing user's menu configuration
 * @module MenuConfigPage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuConfigService } from '../services/menuConfigService';
import MenuTreeEditor from '../components/MenuConfig/MenuTreeEditor';
import QuickAddSubApp from '../components/MenuConfig/QuickAddSubApp';
import { useNotification } from '../context/NotificationContext';
import AppRegistry from '../core/AppRegistry';
import styles from './MenuConfigPage.module.css';

export default function MenuConfigPage() {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [menuConfig, setMenuConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load menu configuration on mount
  useEffect(() => {
    loadMenuConfig();
  }, []);

  const loadMenuConfig = async () => {
    try {
      setLoading(true);
      const data = await menuConfigService.getUserMenuConfig();
      setMenuConfig(data.menuConfig);
      setIsDefault(data.isDefault);
      console.log('[MenuConfigPage] Loaded config:', data);
    } catch (error) {
      console.error('[MenuConfigPage] Load failed:', error);
      addToast('加载菜单配置失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate before save
      const validation = menuConfigService.validateConfig(menuConfig);
      if (!validation.valid) {
        console.error('[MenuConfigPage] Validation errors:', validation.errors);
        addToast(`验证失败: ${validation.errors[0].message}`, 'error');
        setSaving(false);
        return;
      }

      // 1. 立即注册所有子应用，确保无需刷新即可访问
      const subapps = menuConfig.items.filter(item => item.type === 'subapp');
      subapps.forEach(item => {
        AppRegistry.registerApp({
          id: item.id, 
          name: item.config.containerName,
          displayName: item.label,
          entryUrl: item.config.entryUrl,
          route: item.config.route,
          enabled: true,
          logicalAppId: item.config.appId
        });
      });
      console.log('[MenuConfigPage] Auto-registered apps:', subapps.length);

      // 2. 保存配置到持久化存储
      const result = await menuConfigService.updateUserMenuConfig(menuConfig);
      
      if (result.success) {
        addToast('菜单配置保存成功', 'success');
        setIsDefault(false);
        
        // Reload page to apply new menu fully (ensure router state is clean)
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        addToast(`保存失败: ${result.message}`, 'error');
        console.error('[MenuConfigPage] Validation errors:', result.errors);
      }
    } catch (error) {
      console.error('[MenuConfigPage] Save failed:', error);
      addToast('保存菜单配置失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('确定要重置为系统默认菜单吗？此操作不可撤销。')) {
      return;
    }

    try {
      setSaving(true);
      const result = await menuConfigService.resetToDefault();
      
      if (result.success) {
        addToast('已重置为默认菜单', 'success');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        addToast('重置失败', 'error');
      }
    } catch (error) {
      console.error('[MenuConfigPage] Reset failed:', error);
      addToast('重置菜单配置失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleQuickAddSubmit = (newApp) => {
    const newItem = {
      id: `menu-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'subapp',
      label: newApp.label,
      icon: newApp.icon || '📦',
      order: menuConfig.items.length + 1,
      parentId: null,
      config: {
        appId: newApp.appId,
        route: newApp.route,
        entryUrl: newApp.entryUrl,
        containerName: newApp.containerName,
      },
    };

    setMenuConfig({
      ...menuConfig,
      items: [...menuConfig.items, newItem],
    });

    setShowQuickAdd(false);
    addToast('子应用已添加到菜单', 'success');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>加载菜单配置中...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>菜单配置</h1>
          {isDefault && (
            <span className={styles.badge}>使用系统默认</span>
          )}
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={styles.helpButton}
            title="使用说明"
          >
            ?
          </button>
        </div>
        
        <div className={styles.headerRight}>
          <button 
            onClick={handleReset} 
            className={styles.resetButton}
            disabled={saving}
          >
            重置为默认
          </button>
          <button 
            onClick={handleCancel} 
            className={styles.cancelButton}
            disabled={saving}
          >
            取消
          </button>
          <button 
            onClick={handleSave} 
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className={styles.helpModal} onClick={() => setShowHelp(false)}>
          <div className={styles.helpContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.helpHeader}>
              <h2>📖 使用说明</h2>
              <button onClick={() => setShowHelp(false)} className={styles.helpClose}>×</button>
            </div>
            <div className={styles.helpBody}>
              <section>
                <h3>ℹ️ 关于 "应用未注册" 错误</h3>
                <p>系统使用内部生成的唯一ID（如 <code>menu-item-xxxxx</code>）来注册应用，这是为了支持同一应用在菜单中出现多次。</p>
                <p>如果您看到此错误，通常是因为配置尚未生效。<strong>请尝试点击"保存配置"并等待页面自动刷新。</strong></p>
              </section>

              <section>
                <h3>📦 添加子应用 - 关键配置</h3>
                <p>手动配置时，请确保以下字段准确无误：</p>
                <ul>
                  <li>
                    <strong>容器名 (Container Name)</strong>: 
                    <span style={{color: 'red'}}> 必须完全匹配</span> 子应用 <code>webpack.config.js</code> 中的 <code>name</code> 字段。
                    <br/>
                    <small>例如：如果子应用配置是 <code>name: 'eiaS0App'</code>，这里必须填 <code>eiaS0App</code>。</small>
                  </li>
                  <li>
                    <strong>入口URL (Entry URL)</strong>: 
                    指向子应用 <code>remoteEntry.js</code> 的完整地址。
                    <br/>
                    <small>例如：<code>http://localhost:7002/remoteEntry.js</code></small>
                  </li>
                  <li>
                    <strong>应用ID (App ID)</strong>: 
                    您的自定义逻辑标识符，用于路由前缀等，可以自由填写。
                  </li>
                </ul>
              </section>

              <section>
                <h3>🚀 快速开始</h3>
                <ol>
                  <li>点击"添加菜单项"按钮添加新的菜单</li>
                  <li>拖拽菜单项可以调整顺序</li>
                  <li>点击"保存配置"使配置生效</li>
                </ol>
              </section>

              <section>
                <h3>🔧 故障排查</h3>
                <p><strong>应用加载失败？</strong></p>
                <ul>
                  <li>检查子应用是否正在运行（访问入口URL去掉/remoteEntry.js）</li>
                  <li>确认容器名与子应用webpack.config.js中的name一致</li>
                  <li>打开浏览器控制台查看详细错误信息</li>
                  <li>检查Network标签确认remoteEntry.js是否成功加载</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {menuConfig && (
          <div className={styles.editorLayout}>
            {/* Left: Quick Add / Tree Editor */}
            <div className={styles.leftPanel}>
              {showQuickAdd ? (
                <QuickAddSubApp
                  onSubmit={handleQuickAddSubmit}
                  onCancel={() => setShowQuickAdd(false)}
                />
              ) : (
                <MenuTreeEditor
                  menuConfig={menuConfig}
                  onChange={setMenuConfig}
                  onQuickAdd={() => setShowQuickAdd(true)}
                />
              )}
            </div>

            {/* Right: Preview */}
            <div className={styles.rightPanel}>
              <div className={styles.previewHeader}>
                <h3>预览</h3>
              </div>
              <div className={styles.previewContent}>
                <div className={styles.previewMenu}>
                  {menuConfig.items
                    .filter(item => !item.parentId)
                    .sort((a, b) => a.order - b.order)
                    .map(item => (
                      <div key={item.id} className={styles.previewItem}>
                        {item.icon && <span>{item.icon}</span>}
                        <span>{item.label}</span>
                        {item.id === menuConfig.defaultAppId && (
                          <span className={styles.previewDefault}>⭐</span>
                        )}
                      </div>
                    ))}
                </div>
                <p className={styles.previewHint}>
                  这是菜单在顶部栏的预览效果
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}