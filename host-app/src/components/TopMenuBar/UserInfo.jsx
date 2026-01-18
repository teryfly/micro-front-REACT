/**
 * 用户信息组件
 * 显示用户头像和下拉菜单
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './UserInfo.module.css';

export default function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 模拟用户信息（实际应从AuthContext获取）
  const userInfo = {
    name: '管理员',
    avatar: '👤',
    role: 'Admin'
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
    // 清除缓存
    localStorage.clear();
    sessionStorage.clear();
    // 重定向到登录页（实际应用中的逻辑）
    console.log('[UserInfo] 退出登录');
    window.location.href = '/login';
  };

  return (
    <div className={styles.userInfo} ref={dropdownRef}>
      <div 
        className={styles.userTrigger} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.avatar}>{userInfo.avatar}</span>
        <span className={styles.userName}>{userInfo.name}</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownItem}>
            <span>👤</span>
            <span>个人中心</span>
          </div>
          <div className={styles.divider}></div>
          <div 
            className={styles.dropdownItem}
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>退出登录</span>
          </div>
        </div>
      )}
    </div>
  );
}