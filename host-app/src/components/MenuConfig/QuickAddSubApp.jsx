/**
 * Quick Add SubApp Component
 * Simplified form for quickly adding a new subapp to menu
 * @module QuickAddSubApp
 */

import React, { useState } from 'react';
import styles from './QuickAddSubApp.module.css';

export default function QuickAddSubApp({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    label: '',
    icon: '📦',
    appId: '',
    route: '',
    entryUrl: '',
    containerName: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = '应用名称不能为空';
    }

    if (!formData.appId.trim()) {
      newErrors.appId = '应用ID不能为空';
    }

    if (!formData.route.trim()) {
      newErrors.route = '路由不能为空';
    } else if (!formData.route.startsWith('/')) {
      newErrors.route = '路由必须以/开头';
    }

    if (!formData.entryUrl.trim()) {
      newErrors.entryUrl = '入口URL不能为空';
    } else if (!formData.entryUrl.endsWith('/remoteEntry.js')) {
      newErrors.entryUrl = 'URL必须以/remoteEntry.js结尾';
    }

    if (!formData.containerName.trim()) {
      newErrors.containerName = '容器名不能为空';
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

  // Auto-fill helper
  const handleAutoFill = (port) => {
    const examples = {
      7001: {
        label: '示例远程应用1',
        icon: '🔵',
        appId: 'remote-app-1',
        route: '/remote1',
        entryUrl: 'http://localhost:7001/remoteEntry.js',
        containerName: 'remoteApp1',
      },
      7002: {
        label: 'Governance BC',
        icon: '📋',
        appId: 'eia-s0-app',
        route: '/eia-s0-app',
        entryUrl: 'http://localhost:7002/remoteEntry.js',
        containerName: 'eiaS0App',
      },
    };

    const example = examples[port];
    if (example) {
      setFormData(example);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>快速添加子应用</h2>
        <button onClick={onCancel} className={styles.closeButton}>×</button>
      </div>

      <div className={styles.quickFill}>
        <span>快速填充示例：</span>
        <button 
          type="button" 
          onClick={() => handleAutoFill(7001)}
          className={styles.exampleButton}
        >
          示例应用 (7001)
        </button>
        <button 
          type="button" 
          onClick={() => handleAutoFill(7002)}
          className={styles.exampleButton}
        >
          Governance BC (7002)
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>应用名称 *</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="例如：示例应用2"
          />
          {errors.label && <span className={styles.error}>{errors.label}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>图标</label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
            placeholder="例如：📦"
            maxLength={10}
          />
        </div>

        <div className={styles.formGroup}>
          <label>应用ID *</label>
          <input
            type="text"
            value={formData.appId}
            onChange={(e) => handleChange('appId', e.target.value)}
            placeholder="例如：remote-app-2"
          />
          {errors.appId && <span className={styles.error}>{errors.appId}</span>}
          <small>唯一标识符，用于内部识别</small>
        </div>

        <div className={styles.formGroup}>
          <label>路由 *</label>
          <input
            type="text"
            value={formData.route}
            onChange={(e) => handleChange('route', e.target.value)}
            placeholder="例如：/remote2"
          />
          {errors.route && <span className={styles.error}>{errors.route}</span>}
          <small>访问路径，必须以/开头且唯一</small>
        </div>

        <div className={styles.formGroup}>
          <label>入口URL *</label>
          <input
            type="text"
            value={formData.entryUrl}
            onChange={(e) => handleChange('entryUrl', e.target.value)}
            placeholder="例如：http://localhost:7003/remoteEntry.js"
          />
          {errors.entryUrl && <span className={styles.error}>{errors.entryUrl}</span>}
          <small>Module Federation入口文件地址</small>
        </div>

        <div className={styles.formGroup}>
          <label>容器名 *</label>
          <input
            type="text"
            value={formData.containerName}
            onChange={(e) => handleChange('containerName', e.target.value)}
            placeholder="例如：remoteApp2"
          />
          {errors.containerName && <span className={styles.error}>{errors.containerName}</span>}
          <small>Webpack配置中的name字段</small>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            添加到菜单
          </button>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            取消
          </button>
        </div>
      </form>
    </div>
  );
}