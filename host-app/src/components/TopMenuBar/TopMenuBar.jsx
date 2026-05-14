/**
 * 顶部菜单栏组件
 * 从用户菜单配置动态渲染
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuConfigService } from '../../services/menuConfigService';
import Logo from './Logo';
import DynamicMenuItem from './DynamicMenuItem';
import UserInfo from './UserInfo';
import styles from './TopMenuBar.module.css';

export default function TopMenuBar() {
  const navigate = useNavigate();
  const [menuConfig, setMenuConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load menu configuration on mount
  useEffect(() => {
    loadMenuConfig();
  }, []);

  const loadMenuConfig = async () => {
    try {
      setLoading(true);
      const data = await menuConfigService.getUserMenuConfig();
      setMenuConfig(data.menuConfig);
      console.log('[TopMenuBar] Menu config loaded:', data);
    } catch (error) {
      console.error('[TopMenuBar] Failed to load menu config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigClick = () => {
    navigate('/menu-config');
  };

  // Build tree structure for rendering
  const menuTree = React.useMemo(() => {
    if (!menuConfig) return [];
    return buildMenuTree(menuConfig.items);
  }, [menuConfig]);

  if (loading) {
    return (
      <div className={styles.menuBar}>
        <div className={styles.leftSection}>
          <Logo branding={{ logo: '🏠', title: '主应用' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.menuBar}>
      <div className={styles.leftSection}>
        <Logo branding={{ logo: '🏠', title: '主应用' }} />
        
        <div className={styles.menuList}>
          {menuTree.map(node => (
            <DynamicMenuItem
              key={node.id}
              node={node}
              level={0}
            />
          ))}
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Menu Config Icon */}
        <div
          className={styles.configIcon}
          onClick={handleConfigClick}
          title="菜单配置"
        >
          <span>⚙️</span>
        </div>

        <UserInfo />
      </div>
    </div>
  );
}

/**
 * Build tree structure from flat items
 */
function buildMenuTree(items) {
  const map = {};
  const roots = [];

  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  items.forEach(item => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  // Sort by order
  const sortByOrder = (arr) => {
    arr.sort((a, b) => a.order - b.order);
    arr.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(roots);
  return roots;
}