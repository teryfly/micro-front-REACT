/**
 * Local Theme Configuration
 * Extracted from common.module.css for JavaScript usage
 * Used in standalone mode when no external theme is provided
 * @module themeConfig
 */

/**
 * Light theme configuration
 * All CSS variables from common.module.css
 */
export const lightTheme = Object.freeze({
  // Primary Colors
  '--color-primary': '#4CAF50',
  '--color-primary-dark': '#45a049',
  '--color-secondary': '#f0f0f0',
  '--color-danger': '#f44336',
  '--color-warning': '#ff9800',
  '--color-info': '#2196F3',
  '--color-success': '#4CAF50',

  // Text Colors
  '--color-text': '#333',
  '--color-text-light': '#666',
  '--color-text-muted': '#999',

  // Background Colors
  '--color-bg': '#ffffff',
  '--color-bg-light': '#f5f5f5',
  '--color-bg-dark': '#e0e0e0',

  // Border Colors
  '--color-border': '#ddd',
  '--border-radius': '4px',

  // Spacing Scale
  '--spacing-xs': '4px',
  '--spacing-sm': '8px',
  '--spacing-md': '16px',
  '--spacing-lg': '24px',
  '--spacing-xl': '32px',

  // Shadow Levels
  '--shadow-sm': '0 1px 3px rgba(0,0,0,0.1)',
  '--shadow-md': '0 2px 8px rgba(0,0,0,0.15)',
  '--shadow-lg': '0 4px 16px rgba(0,0,0,0.2)',
});

/**
 * Dark theme configuration (for future expansion)
 * Not used in current phase but prepared for theme switching
 */
export const darkTheme = Object.freeze({
  // Primary Colors
  '--color-primary': '#66BB6A',
  '--color-primary-dark': '#4CAF50',
  '--color-secondary': '#424242',
  '--color-danger': '#EF5350',
  '--color-warning': '#FFA726',
  '--color-info': '#42A5F5',
  '--color-success': '#66BB6A',

  // Text Colors
  '--color-text': '#e0e0e0',
  '--color-text-light': '#b0b0b0',
  '--color-text-muted': '#808080',

  // Background Colors
  '--color-bg': '#1e1e1e',
  '--color-bg-light': '#2d2d2d',
  '--color-bg-dark': '#121212',

  // Border Colors
  '--color-border': '#404040',
  '--border-radius': '4px',

  // Spacing Scale (same as light)
  '--spacing-xs': '4px',
  '--spacing-sm': '8px',
  '--spacing-md': '16px',
  '--spacing-lg': '24px',
  '--spacing-xl': '32px',

  // Shadow Levels (darker shadows)
  '--shadow-sm': '0 1px 3px rgba(0,0,0,0.3)',
  '--shadow-md': '0 2px 8px rgba(0,0,0,0.4)',
  '--shadow-lg': '0 4px 16px rgba(0,0,0,0.5)',
});

/**
 * Get theme by name
 * @param {string} name - Theme name ('light' | 'dark')
 * @returns {Object} Theme configuration object
 * 
 * @example
 * const theme = getTheme('light');
 */
export const getTheme = (name = 'light') => {
  switch (name) {
    case 'dark':
      return darkTheme;
    case 'light':
    default:
      return lightTheme;
  }
};

/**
 * Get all available theme names
 * @returns {Array<string>} Theme names
 */
export const getThemeNames = () => ['light', 'dark'];