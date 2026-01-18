/**
 * 顶部菜单栏组件
 * 显示Logo、菜单、主题切换和用户信息
 */

import React, { useEffect } from 'react';
import { useConfig } from '../../config/useConfig';
import Logo from './Logo';
import MenuGroup from './MenuGroup';
import ThemeSwitcher from './ThemeSwitcher';
import UserInfo from './UserInfo';
import styles from './TopMenuBar.module.css';

export default function TopMenuBar() {
  const { config, appsByGroup, menuGroups } = useConfig();

  // FIX: Log menu bar state
  useEffect(() => {
    console.log('[TopMenuBar] Rendered with:', {
      hasConfig: !!config,
      menuGroupsCount: menuGroups?.length || 0,
      menuGroups: menuGroups?.map(g => g.name),
      appsByGroup: Object.keys(appsByGroup || {}),
      totalApps: Object.values(appsByGroup || {}).flat().length,
    });

    if (appsByGroup) {
      Object.entries(appsByGroup).forEach(([groupName, apps]) => {
        console.log(`[TopMenuBar] Group "${groupName}":`, apps.map(a => ({
          id: a.id,
          displayName: a.displayName,
          route: a.route,
        })));
      });
    }
  }, [config, appsByGroup, menuGroups]);

  if (!config) {
    console.warn('[TopMenuBar] Config is null, not rendering menu');
    return null;
  }

  return (
    <div className={styles.menuBar}>
      <div className={styles.leftSection}>
        <Logo branding={config.branding} />
        
        <div className={styles.menuList}>
          {menuGroups.map(group => {
            const groupApps = appsByGroup[group.name] || [];
            console.log('[TopMenuBar] Rendering MenuGroup:', {
              groupId: group.id,
              groupName: group.name,
              appsCount: groupApps.length,
            });
            
            return (
              <MenuGroup
                key={group.id}
                group={group}
                apps={groupApps}
              />
            );
          })}
          
          {/* 未分组的应用 */}
          {appsByGroup['其他'] && appsByGroup['其他'].length > 0 && (
            <MenuGroup
              group={{ id: 'other', name: '其他', icon: '📋' }}
              apps={appsByGroup['其他']}
            />
          )}
        </div>
      </div>

      <div className={styles.rightSection}>
        {config.theme?.allowSwitch && <ThemeSwitcher />}
        <UserInfo />
      </div>
    </div>
  );
}