/**
 * Storage Utilities
 * LocalStorage wrapper with error handling
 * @module utils/storage
 */

const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
});

export const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (err) {
    console.error('Failed to get token from storage:', err);
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (err) {
    console.error('Failed to store token:', err);
  }
};

export const removeStoredToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (err) {
    console.error('Failed to remove token:', err);
  }
};

export const getUserPreferences = () => {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return prefs ? JSON.parse(prefs) : {};
  } catch (err) {
    console.error('Failed to get user preferences:', err);
    return {};
  }
};

export const setUserPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (err) {
    console.error('Failed to store user preferences:', err);
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
};

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