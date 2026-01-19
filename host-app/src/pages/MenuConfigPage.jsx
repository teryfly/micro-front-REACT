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

      const result = await menuConfigService.updateUserMenuConfig(menuConfig);
      
      if (result.success) {
        addToast('菜单配置保存成功', 'success');
        setIsDefault(false);
        
        // Reload page to apply new menu
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
                <h3>🚀 快速开始</h3>
                <ol>
                  <li>点击"添加菜单项"按钮添加新的菜单</li>
                  <li>拖拽菜单项可以调整顺序</li>
                  <li>点击"保存配置"使配置生效</li>
                </ol>
              </section>

              <section>
                <h3>📦 添加子应用</h3>
                <p><strong>方式一：快速添加（推荐）</strong></p>
                <ol>
                  <li>点击"添加菜单项"按钮</li>
                  <li>选择"子应用"类型</li>
                  <li>点击快速填充示例（如"Governance BC (7002)"）</li>
                  <li>根据需要修改配置</li>
                  <li>点击"添加"完成</li>
                </ol>

                <p><strong>方式二：手动配置</strong></p>
                <p>需要填写以下信息：</p>
                <ul>
                  <li><strong>应用名称</strong>：显示在菜单上的名称</li>
                  <li><strong>应用ID</strong>：唯一标识符（如：my-app）</li>
                  <li><strong>路由</strong>：访问路径（如：/myapp）</li>
                  <li><strong>入口URL</strong>：remoteEntry.js地址（如：http://localhost:7003/remoteEntry.js）</li>
                  <li><strong>容器名</strong>：webpack配置中的name字段（如：myApp）</li>
                </ul>

                <div className={styles.helpExample}>
                  <strong>💡 配置示例：</strong>
                  <pre>{`{
  "应用名称": "我的应用",
  "应用ID": "my-app",
  "路由": "/myapp",
  "入口URL": "http://localhost:7003/remoteEntry.js",
  "容器名": "myApp"
}`}</pre>
                </div>

                <div className={styles.helpWarning}>
                  <strong>⚠️ 重要提示：</strong>
                  <ul>
                    <li>容器名必须与子应用webpack.config.js中的<code>name</code>字段完全一致</li>
                    <li>入口URL必须指向正在运行的子应用的remoteEntry.js文件</li>
                    <li>路由必须唯一，不能与其他子应用重复</li>
                    <li>保存后需刷新页面才能生效</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3>🌐 添加外部链接</h3>
                <ol>
                  <li>点击"添加菜单项"按钮</li>
                  <li>选择"外部链接"类型</li>
                  <li>输入URL（必须以http://或https://开头）</li>
                  <li>选择打开方式：
                    <ul>
                      <li><strong>新窗口打开</strong>：在新标签页打开</li>
                      <li><strong>嵌入iframe</strong>：在应用内嵌入显示</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section>
                <h3>📁 添加分类</h3>
                <ol>
                  <li>点击"添加菜单项"按钮</li>
                  <li>选择"分类"类型</li>
                  <li>输入分类名称</li>
                  <li>保存后可以在分类下添加子菜单项</li>
                </ol>
              </section>

              <section>
                <h3>⭐ 设置默认应用</h3>
                <ol>
                  <li>找到要设为默认的子应用</li>
                  <li>点击"设为默认"按钮</li>
                  <li>该应用将在打开主应用时自动加载</li>
                </ol>
                <p><em>注意：只有子应用类型可以设为默认</em></p>
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