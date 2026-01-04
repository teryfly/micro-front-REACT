/**
 * Storage Utilities Module
 * LocalStorage wrapper with error handling
 * Handles Safari private mode and storage quota errors
 * @module storage
 */

/**
 * Storage keys enumeration
 */
const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
});

/**
 * Get stored authentication token
 * @returns {string|null} Token or null if not found
 * 
 * @example
 * const token = getStoredToken();
 * if (token) {
 *   // Use token
 * }
 */
export const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (err) {
    console.error('Failed to get token from storage:', err);
    return null;
  }
};

/**
 * Set authentication token in storage
 * @param {string} token - JWT token to store
 * 
 * @example
 * setStoredToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
export const setStoredToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (err) {
    console.error('Failed to store token:', err);
    // Fail silently - user will need to re-login
  }
};

/**
 * Remove authentication token from storage
 * 
 * @example
 * removeStoredToken(); // Called on logout
 */
export const removeStoredToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (err) {
    console.error('Failed to remove token:', err);
  }
};

/**
 * Get user preferences from storage
 * @returns {Object} User preferences object (empty object if not found or error)
 * 
 * @example
 * const prefs = getUserPreferences();
 * const theme = prefs.theme || 'light';
 */
export const getUserPreferences = () => {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return prefs ? JSON.parse(prefs) : {};
  } catch (err) {
    console.error('Failed to get user preferences:', err);
    return {};
  }
};

/**
 * Set user preferences in storage
 * @param {Object} preferences - Preferences object to store
 * 
 * @example
 * setUserPreferences({ theme: 'dark', language: 'en', pageSize: 20 });
 */
export const setUserPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (err) {
    console.error('Failed to store user preferences:', err);
    // Fail silently - preferences will use defaults
  }
};

/**
 * Clear all application storage
 * Used on logout or data reset
 * 
 * @example
 * clearStorage(); // Clear all stored data
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
};

/**
 * Check if localStorage is available
 * Useful for detecting Safari private mode
 * @returns {boolean} True if localStorage is available
 * 
 * @example
 * if (isStorageAvailable()) {
 *   // Safe to use storage
 * }
 */
export const isStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (err) {
    return false;
  }
};