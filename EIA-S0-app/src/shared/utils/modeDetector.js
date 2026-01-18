/**
 * Mode Detector Utility
 * Detects application running mode (standalone vs embedded)
 * @module modeDetector
 */

/**
 * Running mode enumeration
 */
export const RUN_MODES = Object.freeze({
  STANDALONE: 'standalone',
  EMBEDDED: 'embedded',
});

/**
 * Mode detection source enumeration
 */
export const MODE_SOURCES = Object.freeze({
  PROPS: 'props',
  URL: 'url',
  ENV: 'env',
  DEFAULT: 'default',
});

/**
 * Detect application running mode
 * Priority: props.embedded > URL param > env variable > default
 * 
 * @param {Object} props - Component props from host app
 * @param {boolean} [props.embedded] - Embedded mode flag
 * @returns {Object} Detection result
 * @returns {string} return.mode - Running mode (standalone | embedded)
 * @returns {string} return.source - Detection source
 * 
 * @example
 * const { mode, source } = detectRunMode(props);
 * if (mode === RUN_MODES.EMBEDDED) {
 *   // Render embedded layout
 * }
 */
export const detectRunMode = (props = {}) => {
  let mode = RUN_MODES.STANDALONE;
  let source = MODE_SOURCES.DEFAULT;

  // FIX: Priority 1 - Check props.embedded explicitly (HIGHEST PRIORITY)
  // This is the most reliable signal from host app via Module Federation
  if (typeof props.embedded === 'boolean') {
    mode = props.embedded ? RUN_MODES.EMBEDDED : RUN_MODES.STANDALONE;
    source = MODE_SOURCES.PROPS;
    
    // Early return to avoid cache interference
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [Mode Detection] Props-based detection (highest priority):', { 
        mode, 
        source,
        propValue: props.embedded 
      });
    }
    return { mode, source };
  }

  // Check sessionStorage cache only if no explicit prop
  const cached = getCachedMode();
  if (cached && cached.source === MODE_SOURCES.PROPS) {
    // Trust cached prop-based detection
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [Mode Detection] Using cached prop-based detection:', cached);
    }
    return cached;
  }

  // Priority 2: Check URL parameter ?embedded=true
  if (checkUrlParameter('embedded')) {
    mode = RUN_MODES.EMBEDDED;
    source = MODE_SOURCES.URL;
  }
  // Priority 3: Check environment variable (development only)
  else if (checkEnvVariable('REACT_APP_FORCE_MODE')) {
    const envMode = getEnvValue('REACT_APP_FORCE_MODE');
    if (envMode === 'embedded') {
      mode = RUN_MODES.EMBEDDED;
      source = MODE_SOURCES.ENV;
    }
  }

  const result = { mode, source };

  // Cache result to sessionStorage (but props-based detection takes precedence)
  if (source !== MODE_SOURCES.PROPS) {
    cacheMode(result);
  }

  // Log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [Mode Detection] Final result:', result);
  }

  return result;
};

/**
 * Check URL parameter
 * @param {string} param - Parameter name
 * @returns {boolean} True if parameter exists and equals 'true'
 */
const checkUrlParameter = (param) => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) === 'true';
};

/**
 * Check environment variable
 * @param {string} varName - Variable name
 * @returns {boolean} True if variable exists
 */
const checkEnvVariable = (varName) => {
  try {
    return typeof process !== 'undefined' && 
           process.env && 
           varName in process.env;
  } catch (err) {
    return false;
  }
};

/**
 * Get environment variable value
 * @param {string} varName - Variable name
 * @returns {string|undefined}
 */
const getEnvValue = (varName) => {
  try {
    return process.env[varName];
  } catch (err) {
    return undefined;
  }
};

/**
 * Get cached mode from sessionStorage
 * @returns {Object|null} Cached mode result or null
 */
const getCachedMode = () => {
  if (typeof sessionStorage === 'undefined') return null;
  
  try {
    const cached = sessionStorage.getItem('__app_run_mode__');
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
};

/**
 * Cache mode to sessionStorage
 * @param {Object} result - Mode detection result
 */
const cacheMode = (result) => {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    sessionStorage.setItem('__app_run_mode__', JSON.stringify(result));
  } catch (err) {
    console.error('Failed to cache mode:', err);
  }
};

/**
 * Clear cached mode (for development/debugging)
 * 
 * @example
 * clearCachedMode(); // Force re-detection on next render
 */
export const clearCachedMode = () => {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    sessionStorage.removeItem('__app_run_mode__');
    console.log('✅ Cached mode cleared');
  } catch (err) {
    console.error('Failed to clear cached mode:', err);
  }
};

/**
 * Force switch mode (for development/debugging)
 * @param {string} mode - Target mode (standalone | embedded)
 * 
 * @example
 * forceMode(RUN_MODES.EMBEDDED); // Force embedded mode
 */
export const forceMode = (mode) => {
  if (!Object.values(RUN_MODES).includes(mode)) {
    console.error('Invalid mode:', mode);
    return;
  }

  const result = { mode, source: 'forced' };
  cacheMode(result);
  
  console.log('🔄 Mode forced to:', mode);
  console.log('⚠️  Please refresh the page to apply changes');
};