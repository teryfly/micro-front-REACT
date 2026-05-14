import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ primaryColor: '#1890ff', theme: null });

function injectCssVars(vars) {
  if (!vars || typeof vars !== 'object') return;
  Object.entries(vars).forEach(([k, v]) => {
    if (k.startsWith('--')) document.documentElement.style.setProperty(k, v);
  });
}

export function ThemeProvider({ children, theme, eventBus }) {
  const [primaryColor, setPrimaryColor] = useState(
    (theme && theme['--color-primary']) || (theme && theme.primaryColor) || '#1890ff'
  );

  // Initial injection
  useEffect(() => {
    if (theme) injectCssVars(theme);
  }, []);

  // Live theme updates via EventBus
  useEffect(() => {
    if (!eventBus) return;
    const unsub = eventBus.on('host:theme:changed', ({ vars }) => {
      if (vars) {
        injectCssVars(vars);
        if (vars['--color-primary']) setPrimaryColor(vars['--color-primary']);
      }
    });
    return () => typeof unsub === 'function' && unsub();
  }, [eventBus]);

  return (
    <ThemeContext.Provider value={{ primaryColor, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
