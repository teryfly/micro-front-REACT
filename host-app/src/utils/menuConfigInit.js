/**
 * Menu Configuration Initialization
 * Seeds initial menu data on first load
 * @module menuConfigInit
 */

import { menuConfigService } from '../services/menuConfigService';
import { DEFAULT_MENU_CONFIG } from '../types/menuConfig.types';

const INIT_FLAG_KEY = 'MENU_CONFIG_INITIALIZED';

/**
 * Initialize menu configuration for new users
 * Checks if user has any config, if not, seeds default
 * 
 * @returns {Promise<void>}
 */
export async function initializeMenuConfig() {
  try {
    // Check if already initialized
    const initFlag = sessionStorage.getItem(INIT_FLAG_KEY);
    if (initFlag === 'true') {
      console.log('[MenuConfigInit] Already initialized this session');
      return;
    }

    // Load current config
    const data = await menuConfigService.getUserMenuConfig();

    if (data.isDefault) {
      console.log('[MenuConfigInit] User has no custom config, using system default');
      // System default is already returned, no need to save
    } else {
      console.log('[MenuConfigInit] User has custom config, skipping init');
    }

    // Mark as initialized for this session
    sessionStorage.setItem(INIT_FLAG_KEY, 'true');

  } catch (error) {
    console.error('[MenuConfigInit] Initialization failed:', error);
  }
}

/**
 * Force reset to default menu (for testing/admin purposes)
 * 
 * @returns {Promise<void>}
 */
export async function forceResetMenuConfig() {
  try {
    await menuConfigService.resetToDefault();
    sessionStorage.removeItem(INIT_FLAG_KEY);
    console.log('[MenuConfigInit] Force reset completed');
    
    // Reload page to apply
    window.location.reload();
  } catch (error) {
    console.error('[MenuConfigInit] Force reset failed:', error);
  }
}

/**
 * TODO: Replace with real API initialization
 * 
 * When backend is ready:
 * 1. Remove sessionStorage init flag (use server-side check)
 * 2. Backend should check if user_menu_config exists for current user
 * 3. If not exists, return system_default_menu
 * 4. Frontend just calls getUserMenuConfig() - no client-side init needed
 */