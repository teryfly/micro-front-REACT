/**
 * Menu Item Form Component
 * Form for creating/editing menu items
 * @module MenuItemForm
 */

import React, { useState, useEffect } from 'react';
import { MENU_ITEM_TYPES, EXTERNAL_OPEN_MODES } from '../../types/menuConfig.types';
import styles from './MenuItemForm.module.css';

export default function MenuItemForm({ item, parentId, allItems, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: item?.type || MENU_ITEM_TYPES.SUBAPP,
    label: item?.label || '',
    icon: item?.icon || '',
    config: item?.config || {},
  });

  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  // Quick fill helper
  const handleQuickFill = (preset) => {
    const presets = {
      'eia-s0': {
        label: 'Governance BC',
        icon: '📋',
        config: {
          appId: 'eia-s0-app',
          route: '/eia-s0-app',
          entryUrl: 'http://localhost:7002/remoteEntry.js',
          containerName: 'eiaS0App',
        },
      },
      'remote1': {
        label: '示例远程应用1',
        icon: '🔵',
        config: {
          appId: 'remote-app-1',
          route: '/remote1',
          entryUrl: 'http://localhost:7001/remoteEntry.js',
          containerName: 'remoteApp1',
        },
      },
    };

    const data = presets[preset];
    if (data) {
      setFormData(prev => ({
        ...prev,
        ...data,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = '标签不能为空';
    }

    if (formData.type === MENU_ITEM_TYPES.SUBAPP) {
      if (!formData.config.appId) newErrors.appId = '应用ID不能为空';
      if (!formData.config.route) newErrors.route = '路由不能为空';
      if (!formData.config.entryUrl) newErrors.entryUrl = '入口URL不能为空';
      if (!formData.config.containerName) newErrors.containerName = '容器名不能为空';
      
      if (formData.config.route && !formData.config.route.startsWith('/')) {
        newErrors.route = '路由必须以/开头';
      }
    } else if (formData.type === MENU_ITEM_TYPES.EXTERNAL) {
      if (!formData.config.url) newErrors.url = 'URL不能为空';
      if (!formData.config.openMode) newErrors.openMode = '请选择打开方式';
      
      if (formData.config.url && !/^https?:\/\/.+/.test(formData.config.url)) {
        newErrors.url = 'URL必须以http://或https://开头';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className={styles.formContainer}>
      <h2>{item ? '编辑菜单项' : '添加菜单项'}</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Type Selector */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>类型 *</label>
            <select
              value={formData.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              disabled={!!item}
            >
              <option value={MENU_ITEM_TYPES.SUBAPP}>子应用</option>
              <option value={MENU_ITEM_TYPES.EXTERNAL}>外部链接</option>
              <option value={MENU_ITEM_TYPES.CATEGORY}>分类</option>
            </select>
          </div>

          {formData.type === MENU_ITEM_TYPES.SUBAPP && !item && (
            <div className={styles.quickFill}>
              <span>快速填充：</span>
              <button 
                type="button" 
                onClick={() => handleQuickFill('eia-s0')}
                className={styles.fillButton}
              >
                Governance BC
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickFill('remote1')}
                className={styles.fillButton}
              >
                示例应用1
              </button>
            </div>
          )}
        </div>

        {/* Basic Fields */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>标签 *</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              placeholder="例如：Governance BC"
              maxLength={50}
            />
            {errors.label && <span className={styles.error}>{errors.label}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>图标（Emoji）</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => handleFieldChange('icon', e.target.value)}
              placeholder="例如：📋"
              maxLength={10}
            />
          </div>
        </div>

        {/* SubApp Config */}
        {formData.type === MENU_ITEM_TYPES.SUBAPP && (
          <>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>应用ID *</label>
                <input
                  type="text"
                  value={formData.config.appId || ''}
                  onChange={(e) => handleConfigChange('appId', e.target.value)}
                  placeholder="例如：eia-s0-app"
                />
                {errors.appId && <span className={styles.error}>{errors.appId}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>路由 *</label>
                <input
                  type="text"
                  value={formData.config.route || ''}
                  onChange={(e) => handleConfigChange('route', e.target.value)}
                  placeholder="例如：/eia-s0-app"
                />
                {errors.route && <span className={styles.error}>{errors.route}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>入口URL *</label>
                <input
                  type="text"
                  value={formData.config.entryUrl || ''}
                  onChange={(e) => handleConfigChange('entryUrl', e.target.value)}
                  placeholder="http://localhost:7002/remoteEntry.js"
                />
                {errors.entryUrl && <span className={styles.error}>{errors.entryUrl}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>容器名 *</label>
                <input
                  type="text"
                  value={formData.config.containerName || ''}
                  onChange={(e) => handleConfigChange('containerName', e.target.value)}
                  placeholder="例如：eiaS0App"
                />
                {errors.containerName && <span className={styles.error}>{errors.containerName}</span>}
              </div>
            </div>
          </>
        )}

        {/* External Link Config */}
        {formData.type === MENU_ITEM_TYPES.EXTERNAL && (
          <>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>URL *</label>
                <input
                  type="text"
                  value={formData.config.url || ''}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  placeholder="https://example.com"
                />
                {errors.url && <span className={styles.error}>{errors.url}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>打开方式 *</label>
                <select
                  value={formData.config.openMode || EXTERNAL_OPEN_MODES.NEW_TAB}
                  onChange={(e) => handleConfigChange('openMode', e.target.value)}
                >
                  <option value={EXTERNAL_OPEN_MODES.NEW_TAB}>新窗口打开</option>
                  <option value={EXTERNAL_OPEN_MODES.IFRAME}>嵌入iframe</option>
                </select>
                {errors.openMode && <span className={styles.error}>{errors.openMode}</span>}
              </div>
            </div>
          </>
        )}

        {/* Category Info */}
        {formData.type === MENU_ITEM_TYPES.CATEGORY && (
          <div className={styles.infoBox}>
            <p>ℹ️ 分类用于组织菜单结构，保存后可以点击"添加子项"按钮添加子菜单。</p>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            {item ? '保存' : '添加'}
          </button>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
}