import React, { createContext, useEffect, useState, useCallback } from 'react';

/**
 * Theme context
 * Provides theme configuration to child components
 */
export const ThemeContext = createContext(null);

/**
 * Theme Provider - Manages CSS variable injection
 * Supports both local theme (standalone mode) and external theme (embedded mode)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.theme] - External theme object from host app
 * @param {Object} [props.eventBus] - Event bus for theme change events
 * @param {boolean} [props.embedded=false] - Embedded mode flag
 * 
 * @example
 * <ThemeProvider theme={hostTheme} eventBus={eventBus} embedded={true}>
 *   <App />
 * </ThemeProvider>
 */
export const ThemeProvider = ({ children, theme: externalTheme, eventBus, embedded = false }) => {
  const [currentTheme, setCurrentTheme] = useState(null);

  /**
   * Apply theme variables to :root
   * @param {Object} theme - Theme object with CSS variables
   */
  const applyTheme = useCallback((theme) => {
    if (!theme || typeof theme !== 'object') {
      console.warn('[ThemeProvider] Invalid theme object:', theme);
      return;
    }

    // Apply CSS variables to document root
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    setCurrentTheme(theme);

    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 [ThemeProvider] Theme applied:', {
        variableCount: Object.keys(theme).length,
        source: embedded ? 'host-app' : 'local',
      });
    }
  }, [embedded]);

  /**
   * Load local theme configuration
   * Used in standalone mode
   */
  const loadLocalTheme = useCallback(async () => {
    try {
      const { lightTheme } = await import('../../theme/themeConfig');
      applyTheme(lightTheme);
    } catch (err) {
      console.error('[ThemeProvider] Failed to load local theme:', err);
    }
  }, [applyTheme]);

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    if (embedded && externalTheme) {
      // Embedded mode: use external theme
      applyTheme(externalTheme);
    } else {
      // Standalone mode: load local theme
      loadLocalTheme();
    }
  }, [embedded, externalTheme, applyTheme, loadLocalTheme]);

  /**
   * Listen for theme change events (embedded mode only)
   */
  useEffect(() => {
    if (!embedded || !eventBus) return;

    const handleThemeChange = (newTheme) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 [ThemeProvider] Theme changed via EventBus');
      }
      applyTheme(newTheme);
    };

    eventBus.on('host:theme:changed', handleThemeChange);

    return () => {
      eventBus.off('host:theme:changed', handleThemeChange);
    };
  }, [embedded, eventBus, applyTheme]);

  const value = { currentTheme, applyTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};