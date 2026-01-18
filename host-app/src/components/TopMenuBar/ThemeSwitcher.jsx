/**
 * 主题切换器组件
 * 切换light/dark主题
 */

import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import styles from './ThemeSwitcher.module.css';

export default function ThemeSwitcher() {
  const { theme, switchTheme } = useTheme();

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    switchTheme(newTheme);
  };

  const icon = theme === 'light' ? '🌙' : '☀️';
  const label = theme === 'light' ? '深色模式' : '浅色模式';

  return (
    <div 
      className={styles.themeSwitcher} 
      onClick={handleToggle}
      title={label}
    >
      <span className={styles.icon}>{icon}</span>
    </div>
  );
}