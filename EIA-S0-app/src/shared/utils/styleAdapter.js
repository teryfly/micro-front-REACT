/**
 * Style Adapter Utility
 * Dynamic CSS variable injection and theme management
 * @module styleAdapter
 */

/**
 * Apply theme variables to DOM element
 * @param {Object} theme - Theme object with CSS variables
 * @param {HTMLElement} [targetElement=document.documentElement] - Target element
 * 
 * @example
 * applyThemeVariables({
 *   '--color-primary': '#1890ff',
 *   '--color-bg': '#ffffff'
 * });
 */
export function applyThemeVariables(theme, targetElement = document.documentElement) {
  if (!theme || typeof theme !== 'object') {
    console.error('[StyleAdapter] Invalid theme object:', theme);
    return;
  }

  Object.entries(theme).forEach(([key, value]) => {
    if (typeof value === 'string') {
      targetElement.style.setProperty(key, value);
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 [StyleAdapter] Applied theme variables:', {
      count: Object.keys(theme).length,
      target: targetElement === document.documentElement ? 'document.documentElement' : 'custom element',
    });
  }
}

/**
 * Apply theme with CSS transition
 * Smoothly transitions between theme changes
 * 
 * @param {Object} theme - Theme object
 * @param {number} [duration=300] - Transition duration in milliseconds
 * 
 * @example
 * applyThemeWithTransition(darkTheme, 500);
 */
export function applyThemeWithTransition(theme, duration = 300) {
  const root = document.documentElement;
  
  // Add transition
  root.style.transition = `all ${duration}ms ease`;
  
  // Apply theme
  applyThemeVariables(theme, root);
  
  // Remove transition after completion
  setTimeout(() => {
    root.style.transition = '';
  }, duration);
}

/**
 * Get current CSS variable value
 * @param {string} variableName - CSS variable name (with or without --)
 * @param {HTMLElement} [element=document.documentElement] - Element to read from
 * @returns {string} Variable value or empty string
 * 
 * @example
 * const primaryColor = getCSSVariable('--color-primary');
 * const bgColor = getCSSVariable('color-bg'); // Auto-adds --
 */
export function getCSSVariable(variableName, element = document.documentElement) {
  const varName = variableName.startsWith('--') ? variableName : `--${variableName}`;
  return getComputedStyle(element).getPropertyValue(varName).trim();
}

/**
 * Compare two theme objects and return differences
 * Useful for debugging theme sync issues
 * 
 * @param {Object} theme1 - First theme object
 * @param {Object} theme2 - Second theme object
 * @returns {Object} Comparison result
 * 
 * @example
 * const diff = compareThemes(localTheme, hostTheme);
 * console.log('Different variables:', diff.different);
 */
export function compareThemes(theme1, theme2) {
  const all1 = Object.keys(theme1);
  const all2 = Object.keys(theme2);
  
  const matched = [];
  const different = [];
  const onlyIn1 = [];
  const onlyIn2 = [];

  all1.forEach(key => {
    if (key in theme2) {
      if (theme1[key] === theme2[key]) {
        matched.push(key);
      } else {
        different.push({
          key,
          value1: theme1[key],
          value2: theme2[key],
        });
      }
    } else {
      onlyIn1.push(key);
    }
  });

  all2.forEach(key => {
    if (!(key in theme1)) {
      onlyIn2.push(key);
    }
  });

  return {
    totalVariables: all1.length,
    matched: matched.length,
    different: different.length,
    differentDetails: different,
    onlyInFirst: onlyIn1,
    onlyInSecond: onlyIn2,
  };
}

/**
 * Validate theme object structure
 * Ensures all required CSS variables are present
 * 
 * @param {Object} theme - Theme object to validate
 * @param {Array<string>} requiredVariables - Required variable names
 * @returns {Object} Validation result
 * 
 * @example
 * const result = validateTheme(hostTheme, ['--color-primary', '--color-bg']);
 * if (!result.valid) {
 *   console.error('Missing variables:', result.missing);
 * }
 */
export function validateTheme(theme, requiredVariables = []) {
  const missing = [];
  const invalid = [];

  requiredVariables.forEach(varName => {
    if (!(varName in theme)) {
      missing.push(varName);
    } else if (typeof theme[varName] !== 'string') {
      invalid.push({ key: varName, value: theme[varName] });
    }
  });

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}