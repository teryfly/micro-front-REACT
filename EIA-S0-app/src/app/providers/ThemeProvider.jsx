import React, { createContext, useEffect, useState, useCallback } from 'react';

/**
 * Theme context
 * Provides theme configuration to child components
 */
export const ThemeContext = createContext(null);

/**
 * Maps host-app CSS variable names → EIA-S0-app internal variable names.
 *
 * The two apps share many of the same variable names (--color-primary, --color-bg, …)
 * but differ on a handful of tokens.  This bridge ensures those gaps are filled
 * whenever the host passes down its theme object.
 */
const HOST_TO_LOCAL_BRIDGE = {
  '--color-bg-secondary':   '--color-bg-light',    // host secondary bg   → eia light bg
  '--color-bg-hover':       '--color-bg-dark',     // host hover bg       → eia dark bg
  '--color-error':          '--color-danger',      // host error color    → eia danger
  '--border-radius-md':     '--border-radius',     // host md radius      → eia generic radius
  '--color-text-secondary': '--color-text-light',  // host secondary text → eia text-light
};

/**
 * Design-token defaults for variables the host app does not supply.
 * Applied in embedded mode so that EIA-S0-app components never see
 * un-resolved custom properties.
 */
const LOCAL_TOKEN_DEFAULTS = {
  '--border-width':       '1px',
  '--font-family':        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  '--font-size-xs':       '12px',
  '--font-size-sm':       '14px',
  '--font-size-md':       '16px',
  '--font-size-lg':       '18px',
  '--font-size-xl':       '20px',
  '--transition-fast':    '0.15s ease',
  '--transition-normal':  '0.3s ease',
  '--transition-slow':    '0.5s ease',
  '--z-dropdown':         '100',
  '--z-sticky':           '200',
  '--z-modal-backdrop':   '1000',
  '--z-modal':            '1001',
  '--z-tooltip':          '1100',
  '--color-text-muted':   '#999999',   // not present in standard host theme
  '--color-secondary':    '#f0f0f0',   // not present in standard host theme
};

/**
 * Theme Provider - Manages CSS variable injection
 * Supports both local theme (standalone mode) and external theme (embedded mode)
 *
 * @param {Object}          props
 * @param {React.ReactNode} props.children      - Child components
 * @param {Object}          [props.theme]       - External theme object from host app (CSS-var map)
 * @param {Object}          [props.eventBus]    - Event bus for theme change events
 * @param {boolean}         [props.embedded]    - Embedded mode flag
 */
export const ThemeProvider = ({ children, theme: externalTheme, eventBus, embedded = false }) => {
  const [currentTheme, setCurrentTheme] = useState(null);

  /**
   * Apply a flat CSS-variable map to :root (inline style).
   * Inline styles always win over any stylesheet-level :root rules,
   * so this correctly overrides any defaults from tokens.css.
   */
  const applyTheme = useCallback(
    (theme) => {
      if (!theme || typeof theme !== 'object') {
        console.warn('[ThemeProvider] Invalid theme object:', theme);
        return;
      }

      const root = document.documentElement;

      // 1. Apply every variable the caller provided (host or local)
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // 2. Bridge: also set EIA-S0-app-internal names for host vars that differ
      if (embedded) {
        Object.entries(HOST_TO_LOCAL_BRIDGE).forEach(([hostVar, localVar]) => {
          const value = theme[hostVar];
          if (value) {
            root.style.setProperty(localVar, value);
          }
        });

        // 3. Supplement with defaults for tokens the host doesn't provide
        Object.entries(LOCAL_TOKEN_DEFAULTS).forEach(([varName, defaultValue]) => {
          // Only set if the host didn't already supply this variable
          if (!theme[varName]) {
            root.style.setProperty(varName, defaultValue);
          }
        });
      }

      setCurrentTheme(theme);

      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 [ThemeProvider] Theme applied:', {
          variableCount: Object.keys(theme).length,
          source: embedded ? 'host-app' : 'local',
        });
      }
    },
    [embedded],
  );

  /**
   * Load local theme configuration (standalone mode only)
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
   * Initialize theme on mount / when embedding context changes
   */
  useEffect(() => {
    if (embedded && externalTheme) {
      applyTheme(externalTheme);
    } else {
      loadLocalTheme();
    }
  }, [embedded, externalTheme, applyTheme, loadLocalTheme]);

  /**
   * Listen for live theme-change events (embedded mode only)
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
    return () => eventBus.off('host:theme:changed', handleThemeChange);
  }, [embedded, eventBus, applyTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
