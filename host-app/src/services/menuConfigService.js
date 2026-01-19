/**
 * Menu Configuration Service
 * Mock API service using localStorage with user-scoped storage
 * TODO: Replace with real API calls when backend is ready
 * @module menuConfigService
 */

import { DEFAULT_MENU_CONFIG, MENU_VALIDATION_RULES, MENU_ITEM_TYPES } from '../types/menuConfig.types';

const STORAGE_KEY_PREFIX = 'MENU_CONFIG_USER_';
const CURRENT_USER_KEY = 'CURRENT_USER_ID';

/**
 * Get current user ID from auth context
 * TODO: Replace with real authentication system
 * @returns {string} User ID
 */
function getCurrentUserId() {
  let userId = localStorage.getItem(CURRENT_USER_KEY);
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(CURRENT_USER_KEY, userId);
    console.log('[MenuConfigService] Generated user ID:', userId);
  }
  return userId;
}

/**
 * Get storage key for current user
 * @returns {string}
 */
function getUserStorageKey() {
  const userId = getCurrentUserId();
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

/**
 * Simulate API delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>}
 */
function simulateApiDelay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate menu configuration structure
 * @param {Object} menuConfig - Menu configuration object
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateMenuConfig(menuConfig) {
  const errors = [];

  // Check required top-level fields
  if (!menuConfig.version) {
    errors.push({ field: 'version', message: 'Version is required' });
  }

  if (!menuConfig.defaultAppId) {
    errors.push({ field: 'defaultAppId', message: 'Default app ID is required' });
  }

  if (!Array.isArray(menuConfig.items)) {
    errors.push({ field: 'items', message: 'Items must be an array' });
    return { valid: false, errors };
  }

  // Validate each menu item
  const itemIds = new Set();
  const routes = new Set();

  menuConfig.items.forEach((item, index) => {
    // Check required fields
    MENU_VALIDATION_RULES.REQUIRED_FIELDS.ALL.forEach(field => {
      if (item[field] === undefined || item[field] === null) {
        errors.push({ 
          field: `items[${index}].${field}`, 
          message: `${field} is required` 
        });
      }
    });

    // Check unique ID
    if (itemIds.has(item.id)) {
      errors.push({ 
        field: `items[${index}].id`, 
        message: `Duplicate ID: ${item.id}` 
      });
    }
    itemIds.add(item.id);

    // Type-specific validation
    if (item.type === MENU_ITEM_TYPES.SUBAPP) {
      const requiredFields = MENU_VALIDATION_RULES.REQUIRED_FIELDS.SUBAPP;
      requiredFields.forEach(field => {
        if (!item.config || !item.config[field]) {
          errors.push({ 
            field: `items[${index}].config.${field}`, 
            message: `${field} is required for subapp` 
          });
        }
      });

      // Validate route format
      if (item.config?.route && !MENU_VALIDATION_RULES.ROUTE_PATTERN.test(item.config.route)) {
        errors.push({ 
          field: `items[${index}].config.route`, 
          message: 'Invalid route format' 
        });
      }

      // Check unique route
      if (item.config?.route) {
        if (routes.has(item.config.route)) {
          errors.push({ 
            field: `items[${index}].config.route`, 
            message: `Duplicate route: ${item.config.route}` 
          });
        }
        routes.add(item.config.route);
      }
    } else if (item.type === MENU_ITEM_TYPES.EXTERNAL) {
      const requiredFields = MENU_VALIDATION_RULES.REQUIRED_FIELDS.EXTERNAL;
      requiredFields.forEach(field => {
        if (!item.config || !item.config[field]) {
          errors.push({ 
            field: `items[${index}].config.${field}`, 
            message: `${field} is required for external link` 
          });
        }
      });

      // Validate URL format
      if (item.config?.url && !MENU_VALIDATION_RULES.URL_PATTERN.test(item.config.url)) {
        errors.push({ 
          field: `items[${index}].config.url`, 
          message: 'Invalid URL format (must be http:// or https://)' 
        });
      }
    }
    // Category type has no required config fields
  });

  // Check circular references in parentId chain
  const circularCheck = detectCircularReferences(menuConfig.items);
  if (circularCheck.hasCircular) {
    errors.push({ 
      field: 'items', 
      message: `Circular reference detected: ${circularCheck.path.join(' → ')}` 
    });
  }

  // Validate defaultAppId exists and is subapp
  const defaultApp = menuConfig.items.find(item => item.id === menuConfig.defaultAppId);
  if (!defaultApp) {
    errors.push({ 
      field: 'defaultAppId', 
      message: 'Default app ID does not exist in menu items' 
    });
  } else if (defaultApp.type !== MENU_ITEM_TYPES.SUBAPP) {
    errors.push({ 
      field: 'defaultAppId', 
      message: 'Default app must be a subapp type' 
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detect circular references in menu tree
 * @param {Array} items - Menu items
 * @returns {Object} { hasCircular: boolean, path: Array }
 */
function detectCircularReferences(items) {
  const visited = new Set();
  const recursionStack = new Set();
  const itemMap = new Map(items.map(item => [item.id, item]));

  function dfs(itemId, path = []) {
    if (recursionStack.has(itemId)) {
      return { hasCircular: true, path: [...path, itemId] };
    }

    if (visited.has(itemId)) {
      return { hasCircular: false, path: [] };
    }

    visited.add(itemId);
    recursionStack.add(itemId);

    const item = itemMap.get(itemId);
    if (item && item.parentId) {
      const result = dfs(item.parentId, [...path, itemId]);
      if (result.hasCircular) {
        return result;
      }
    }

    recursionStack.delete(itemId);
    return { hasCircular: false, path: [] };
  }

  for (const item of items) {
    const result = dfs(item.id);
    if (result.hasCircular) {
      return result;
    }
  }

  return { hasCircular: false, path: [] };
}

/**
 * Menu Configuration Service
 */
export const menuConfigService = {
  /**
   * Get user's menu configuration
   * Simulates: GET /api/menu-config
   * @returns {Promise<UserMenuConfig>}
   */
  async getUserMenuConfig() {
    await simulateApiDelay();

    const userId = getCurrentUserId();
    const storageKey = getUserStorageKey();
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('[MenuConfigService] Loaded user config from localStorage');
        return {
          userId,
          menuConfig: parsed,
          isDefault: false,
          lastModified: new Date().toISOString(),
        };
      } catch (error) {
        console.error('[MenuConfigService] Failed to parse stored config:', error);
      }
    }

    // Return system default (deep clone to avoid mutation)
    console.log('[MenuConfigService] Returning system default menu');
    return {
      userId,
      menuConfig: JSON.parse(JSON.stringify(DEFAULT_MENU_CONFIG)),
      isDefault: true,
      lastModified: new Date().toISOString(),
    };
  },

  /**
   * Update user's menu configuration
   * Simulates: PUT /api/menu-config
   * @param {MenuConfiguration} menuConfig - Menu configuration to save
   * @returns {Promise<Object>} { success: boolean, message: string, errors?: Array }
   */
  async updateUserMenuConfig(menuConfig) {
    await simulateApiDelay();

    // Validate configuration
    const validation = validateMenuConfig(menuConfig);
    if (!validation.valid) {
      console.error('[MenuConfigService] Validation failed:', validation.errors);
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid menu configuration',
        errors: validation.errors,
      };
    }

    // Save to localStorage
    const userId = getCurrentUserId();
    const storageKey = getUserStorageKey();

    try {
      localStorage.setItem(storageKey, JSON.stringify(menuConfig));
      console.log('[MenuConfigService] Menu config saved successfully');
      
      return {
        success: true,
        message: 'Menu configuration saved successfully',
        userId,
        lastModified: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[MenuConfigService] Save failed:', error);
      return {
        success: false,
        errorCode: 'SERVER_ERROR',
        message: 'Failed to save menu configuration',
        errors: [{ field: 'storage', message: error.message }],
      };
    }
  },

  /**
   * Reset to system default menu
   * Simulates: POST /api/menu-config/reset
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  async resetToDefault() {
    await simulateApiDelay();

    const userId = getCurrentUserId();
    const storageKey = getUserStorageKey();

    try {
      localStorage.removeItem(storageKey);
      console.log('[MenuConfigService] Menu config reset to default');
      
      return {
        success: true,
        message: 'Menu configuration reset to default',
        userId,
      };
    } catch (error) {
      console.error('[MenuConfigService] Reset failed:', error);
      return {
        success: false,
        errorCode: 'SERVER_ERROR',
        message: 'Failed to reset menu configuration',
      };
    }
  },

  /**
   * Validate menu configuration (client-side)
   * @param {MenuConfiguration} menuConfig - Menu configuration
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validateConfig(menuConfig) {
    return validateMenuConfig(menuConfig);
  },
};