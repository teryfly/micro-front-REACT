/**
 * 错误降级页面组件
 * 当子应用加载或渲染失败时显示
 */

import React from 'react';
import styles from './ErrorFallback.module.css';

export default function ErrorFallback({ appConfig, error, errorInfo, onReset }) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleOpenInNewTab = () => {
    // 尝试在新窗口打开子应用独立访问地址
    const url = appConfig.entryUrl.replace('/remoteEntry.js', '');
    window.open(url, '_blank');
  };

  return (
    <div className={styles.errorFallback}>
      <div className={styles.errorIcon}>⚠️</div>
      
      <h2 className={styles.errorTitle}>
        应用加载失败
      </h2>
      
      <p className={styles.errorMessage}>
        {appConfig.displayName} 暂时无法访问
      </p>

      {isDevelopment && error && (
        <div className={styles.errorDetails}>
          <h3>错误详情：</h3>
          <pre>{error.toString()}</pre>
          {errorInfo && (
            <>
              <h3>组件堆栈：</h3>
              <pre>{errorInfo.componentStack}</pre>
            </>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.primaryButton} onClick={onReset}>
          重新加载
        </button>
        
        <button className={styles.secondaryButton} onClick={handleOpenInNewTab}>
          在新窗口打开
        </button>
        
        <button 
          className={styles.secondaryButton} 
          onClick={() => window.location.href = '/'}
        >
          返回首页
        </button>
      </div>

      <div className={styles.tips}>
        <p>💡 提示：</p>
        <ul>
          <li>请检查网络连接是否正常</li>
          <li>确认子应用服务是否正在运行</li>
          <li>尝试刷新页面或清除浏览器缓存</li>
        </ul>
      </div>
    </div>
  );
}