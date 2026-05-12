/**
 * 主布局组件
 * 包含顶部菜单栏和内容区域
 */

import React, { useEffect } from 'react';
import TopMenuBar from '../components/TopMenuBar/TopMenuBar';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }) {
  // FIX: Log when layout renders
  useEffect(() => {
    console.log('[MainLayout] Rendered');
  }, []);

  // FIX: Log children
  useEffect(() => {
    console.log('[MainLayout] Children:', {
      hasChildren: !!children,
      childrenType: typeof children,
    });
  }, [children]);

  return (
    <div className={styles.mainLayout}>
      <TopMenuBar />
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
}