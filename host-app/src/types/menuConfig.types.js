/**
 * Menu Configuration Data Model
 * Type definitions for menu configuration system
 * @module menuConfig.types
 */

/**
 * @typedef {'subapp' | 'external' | 'category'} MenuItemType
 */

/**
 * @typedef {'newTab' | 'iframe'} ExternalLinkOpenMode
 */

/**
 * @typedef {Object} SubAppConfig
 * @property {string} appId - Unique application identifier
 * @property {string} route - Route path (must start with /)
 * @property {string} entryUrl - Module Federation remoteEntry.js URL
 * @property {string} containerName - Webpack container name
 */

/**
 * @typedef {Object} ExternalLinkConfig
 * @property {string} url - External URL (must be valid HTTP/HTTPS)
 * @property {ExternalLinkOpenMode} openMode - How to open the link
 */

/**
 * @typedef {Object} CategoryConfig
 * @property {Object} [metadata] - Optional metadata for category
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id - Unique menu item ID (UUID)
 * @property {MenuItemType} type - Menu item type
 * @property {string} label - Display label
 * @property {string} [icon] - Icon (emoji or identifier)
 * @property {number} order - Sort order (integer)
 * @property {string|null} parentId - Parent menu item ID (null for root)
 * @property {SubAppConfig|ExternalLinkConfig|CategoryConfig} config - Type-specific config
 */

/**
 * @typedef {Object} MenuConfiguration
 * @property {string} version - Config schema version
 * @property {string} defaultAppId - Default app ID to load on startup
 * @property {MenuItem[]} items - Menu items array
 */

/**
 * @typedef {Object} UserMenuConfig
 * @property {string} userId - User UUID
 * @property {MenuConfiguration} menuConfig - Menu configuration
 * @property {boolean} isDefault - Whether using system default
 * @property {string} lastModified - ISO 8601 timestamp
 */

/**
 * Validation Rules
 */
export const MENU_VALIDATION_RULES = Object.freeze({
  MAX_LABEL_LENGTH: 50,
  MAX_TREE_DEPTH: 10,
  ROUTE_PATTERN: /^\/[a-zA-Z0-9\-_\/]*$/,
  URL_PATTERN: /^https?:\/\/.+/,
  REQUIRED_FIELDS: {
    ALL: ['id', 'type', 'label', 'order'],
    SUBAPP: ['appId', 'route', 'entryUrl', 'containerName'],
    EXTERNAL: ['url', 'openMode'],
  },
});

/**
 * Default menu configuration (system initial data)
 * FIX: Match actual app configurations from original setup
 */
export const DEFAULT_MENU_CONFIG = Object.freeze({
  version: '1.0.0',
  defaultAppId: 'eia-s0-app',
  items: [
    {
      id: 'eia-s0-app',
      type: 'subapp',
      label: 'Governance BC',
      icon: '📋',
      order: 1,
      parentId: null,
      config: {
        appId: 'eia-s0-app',
        route: '/eia-s0-app',
        entryUrl: 'http://localhost:7002/remoteEntry.js',
        containerName: 'eiaS0App',
      },
    },
    {
      id: 'remote-app-1',
      type: 'subapp',
      label: '示例远程子应用1',
      icon: '🔵',
      order: 2,
      parentId: null,
      config: {
        appId: 'remote-app-1',
        route: '/remote1',
        entryUrl: 'http://localhost:7001/remoteEntry.js',
        containerName: 'remoteApp1',
      },
    },
  ],
});

/**
 * Menu item type enumeration
 */
export const MENU_ITEM_TYPES = Object.freeze({
  SUBAPP: 'subapp',
  EXTERNAL: 'external',
  CATEGORY: 'category',
});

/**
 * External link open modes
 */
export const EXTERNAL_OPEN_MODES = Object.freeze({
  NEW_TAB: 'newTab',
  IFRAME: 'iframe',
});