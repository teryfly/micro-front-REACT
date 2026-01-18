/**
 * 子应用加载骨架屏组件
 * 显示加载中的占位UI
 */

import React from 'react';
import styles from './SubAppSkeleton.module.css';

export default function SubAppSkeleton({ appName }) {
  return (
    <div className={styles.skeleton}>
      <div className={styles.header}>
        <div className={styles.shimmer}></div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.shimmer}></div>
        </div>
        
        <div className={styles.main}>
          <div className={styles.shimmer}></div>
          <div className={styles.shimmer}></div>
          <div className={styles.shimmer}></div>
        </div>
      </div>

      <div className={styles.loadingText}>
        正在加载 {appName}...
      </div>
    </div>
  );
}