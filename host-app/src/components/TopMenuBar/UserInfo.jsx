/**
 * 用户信息组件
 * 展示单点登录返回的用户信息，并提供统一登出入口
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth';
import styles from './UserInfo.module.css';

export default function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, expiresAt } = useAuth();

  // 用户信息来自认证中心 /connect/userinfo
  const userInfo = {
    name: user?.name || user?.sub || '未登录',
    avatar: '👤',
    role: user?.role || '',
    workno: user?.workno || '',
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    // 清理本地缓存后跳转认证中心统一登出
    console.log('[UserInfo] 退出登录');
    sessionStorage.clear();
    logout();
  };

  const clearCache = () => {
    window.location.href = '/clear-cache.html';
  };

  return (
    <div className={styles.userInfo} ref={dropdownRef}>
      <div
        className={styles.userTrigger}
        onClick={() => setIsOpen(!isOpen)}
        title={expiresAt ? `登录有效期至 ${new Date(expiresAt).toLocaleString()}` : ''}
      >
        <span className={styles.avatar}>{userInfo.avatar}</span>
        <span className={styles.userName}>{userInfo.name}</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownItem}>
            <span>👤</span>
            <span>
              个人中心
              {userInfo.role ? `（${userInfo.role}）` : ''}
            </span>
          </div>
          {userInfo.workno ? (
            <div className={styles.dropdownItem}>
              <span>🪪</span>
              <span>工号：{userInfo.workno}</span>
            </div>
          ) : null}
          <div className={styles.dropdownItem} onClick={clearCache}>
            <span>🧹</span>
            <span>清除缓存</span>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.dropdownItem} onClick={handleLogout}>
            <span>🚪</span>
            <span>退出登录</span>
          </div>
        </div>
      )}
    </div>
  );
}
