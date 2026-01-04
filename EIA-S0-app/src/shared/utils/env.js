/**
 * Environment Utilities (browser-safe)
 * Webpack 5 no longer polyfills Node globals like `process` by default.
 * This helper provides a safe way to access environment variables in browser.
 */

/**
 * Safely read an environment variable.
 * Falls back to `undefined` when `process.env` is not available.
 *
 * @param {string} key - Environment variable name
 * @param {any} [defaultValue] - Default value if not found
 * @returns {any} env value or defaultValue
 */
export const getEnv = (key, defaultValue = undefined) => {
  try {
    // In webpack builds, DefinePlugin may replace process.env.* at compile time.
    // In runtime without polyfills, `process` may be undefined.
    if (typeof process !== 'undefined' && process && process.env && key in process.env) {
      return process.env[key];
    }
  } catch (_) {
    // ignore
  }
  return defaultValue;
};

/**
 * Safely read NODE_ENV
 * @returns {string} 'development' | 'production' | 'test' | 'unknown'
 */
export const getNodeEnv = () => {
  return getEnv('NODE_ENV', 'development');
};

/**
 * Check if current env is development
 * @returns {boolean}
 */
export const isDev = () => getNodeEnv() === 'development';