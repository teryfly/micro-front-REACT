/**
 * 主题Context
 * 提供全局主题管理
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { applyTheme, getThemeVars } from './themeConfig';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'MICRO_APP_THEME';

/**
 * 主题Provider组件
 */
export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setTheme] = useState(() => {
    // 从localStorage恢复主题
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved || defaultTheme;
  });

  // 应用主题到DOM
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // 通过事件总线通知子应用主题变化
    if (window.__MICRO_APP_EVENT_BUS__) {
      window.__MICRO_APP_EVENT_BUS__.emit('theme:changed', {
        theme,
        vars: getThemeVars(theme)
      });
    }
  }, [theme]);

  const switchTheme = (newTheme) => {
    if (newTheme !== theme) {
      setTheme(newTheme);
      console.log(`[ThemeProvider] 切换主题: ${newTheme}`);
    }
  };

  const toggleTheme = () => {
    switchTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    themeVars: getThemeVars(theme),
    switchTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 使用主题Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}