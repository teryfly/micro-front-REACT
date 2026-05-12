/**
 * 菜单分组组件
 * 支持下拉菜单展示分组内的应用
 */

import React, { useState, useRef, useEffect } from 'react';
import MenuItem from './MenuItem';
import styles from './MenuGroup.module.css';

export default function MenuGroup({ group, apps }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 如果只有一个应用，直接显示为菜单项
  if (apps.length === 1) {
    return <MenuItem app={apps[0]} />;
  }

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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.menuGroup} ref={dropdownRef}>
      <div className={styles.groupTrigger} onClick={toggleDropdown}>
        {group.icon && <span className={styles.icon}>{group.icon}</span>}
        <span className={styles.text}>{group.name}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {apps.map(app => (
            <MenuItem key={app.id} app={app} onClick={handleItemClick} />
          ))}
        </div>
      )}
    </div>
  );
}