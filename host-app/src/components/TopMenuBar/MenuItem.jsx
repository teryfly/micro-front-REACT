/**
 * 菜单项组件
 * 单个应用的菜单项
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MenuItem.module.css';

export default function MenuItem({ app, onClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  // FIX: Verify router context
  useEffect(() => {
    console.log('[MenuItem] Router context check:', {
      appId: app.id,
      hasNavigate: typeof navigate === 'function',
      hasLocation: !!location,
      currentPath: location?.pathname,
    });

    if (typeof navigate !== 'function') {
      console.error('[MenuItem] ❌ navigate is not a function! Router context missing!');
    }
  }, [app.id, navigate, location]);

  // FIX: Log when component mounts
  useEffect(() => {
    console.log('[MenuItem] Mounted:', {
      appId: app.id,
      displayName: app.displayName,
      route: app.route,
      targetPath: `/app${app.route}`,
    });
  }, [app.id, app.displayName, app.route]);

  // 检查是否为当前激活应用
  const isActive = location.pathname.startsWith(`/app/${app.id}`);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetPath = `/app${app.route}`;
    
    console.log('[MenuItem] Clicked:', {
      appId: app.id,
      displayName: app.displayName,
      currentPath: location.pathname,
      targetPath: targetPath,
      isActive,
      navigateType: typeof navigate,
    });

    try {
      // FIX: Check if navigate is available
      if (typeof navigate !== 'function') {
        console.error('[MenuItem] navigate is not a function, using window.location fallback');
        window.location.href = targetPath;
        return;
      }

      navigate(targetPath);
      console.log('[MenuItem] ✅ Navigation called successfully');
      
      if (onClick) {
        onClick();
      }
    } catch (error) {
      console.error('[MenuItem] ❌ Navigation failed:', error);
      // FIX: Fallback to window.location
      console.log('[MenuItem] Using window.location fallback');
      window.location.href = targetPath;
    }
  };

  return (
    <div
      className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      title={app.description}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
    >
      {app.icon && <span className={styles.icon}>{app.icon}</span>}
      <span className={styles.text}>{app.displayName}</span>
    </div>
  );
}