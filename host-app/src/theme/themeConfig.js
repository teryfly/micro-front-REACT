/**
 * 主题配置
 * 定义light和dark两套主题的CSS变量
 */

export const themes = {
  light: {
    // 主色调
    '--color-primary': '#1890ff',
    '--color-primary-light': '#e6f7ff',
    '--color-primary-dark': '#096dd9',
    '--color-accent': '#52c41a',
    
    // 背景色
    '--color-bg': '#ffffff',
    '--color-bg-secondary': '#f5f5f5',
    '--color-bg-hover': '#f0f0f0',
    
    // 文字颜色
    '--color-text': '#333333',
    '--color-text-secondary': '#666666',
    '--color-text-inverse': '#ffffff',
    
    // 边框颜色
    '--color-border': '#d9d9d9',
    '--color-border-light': '#e8e8e8',
    
    // 状态颜色
    '--color-success': '#52c41a',
    '--color-warning': '#faad14',
    '--color-error': '#ff4d4f',
    '--color-info': '#1890ff',
    
    // 信息背景色
    '--color-success-bg': '#f6ffed',
    '--color-warning-bg': '#fffbe6',
    '--color-error-bg': '#fff2f0',
    '--color-info-bg': '#e6f7ff',
    
    // 间距
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--spacing-xl': '32px',
    
    // 圆角
    '--border-radius-sm': '2px',
    '--border-radius-md': '4px',
    '--border-radius-lg': '8px',
    
    // 阴影
    '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
    '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.15)',
    '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.2)'
  },
  
  dark: {
    // 主色调
    '--color-primary': '#177ddc',
    '--color-primary-light': '#112545',
    '--color-primary-dark': '#15417e',
    '--color-accent': '#49aa19',
    
    // 背景色
    '--color-bg': '#1e1e1e',
    '--color-bg-secondary': '#2a2a2a',
    '--color-bg-hover': '#333333',
    
    // 文字颜色
    '--color-text': '#e0e0e0',
    '--color-text-secondary': '#a0a0a0',
    '--color-text-inverse': '#1e1e1e',
    
    // 边框颜色
    '--color-border': '#3a3a3a',
    '--color-border-light': '#2a2a2a',
    
    // 状态颜色
    '--color-success': '#49aa19',
    '--color-warning': '#d89614',
    '--color-error': '#d32029',
    '--color-info': '#177ddc',
    
    // 信息背景色
    '--color-success-bg': '#162312',
    '--color-warning-bg': '#2b2111',
    '--color-error-bg': '#2a1215',
    '--color-info-bg': '#111d2c',
    
    // 间距（与light相同）
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--spacing-xl': '32px',
    
    // 圆角（与light相同）
    '--border-radius-sm': '2px',
    '--border-radius-md': '4px',
    '--border-radius-lg': '8px',
    
    // 阴影
    '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
    '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
    '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.5)'
  }
};

/**
 * 获取主题变量对象
 * @param {string} themeName - 主题名称
 * @returns {Object}
 */
export function getThemeVars(themeName) {
  return themes[themeName] || themes.light;
}

/**
 * 应用主题到DOM
 * @param {string} themeName - 主题名称
 */
export function applyTheme(themeName) {
  const themeVars = getThemeVars(themeName);
  const root = document.documentElement;
  
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  console.log(`[Theme] 应用主题: ${themeName}`);
}