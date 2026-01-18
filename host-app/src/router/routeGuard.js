/**
 * 路由守卫
 * 处理权限检查和应用启用状态验证
 */

import AppRegistry from '../core/AppRegistry';

/**
 * 检查用户是否有权限访问应用
 * @param {Array<string>} requiredPermissions - 应用要求的权限
 * @param {Array<string>} userPermissions - 用户拥有的权限
 * @returns {boolean}
 */
export function hasPermission(requiredPermissions, userPermissions) {
  // 无权限要求，允许所有人访问
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // 检查用户是否拥有任一所需权限
  return requiredPermissions.some(requiredPerm => 
    userPermissions.some(userPerm => 
      matchPermission(userPerm, requiredPerm)
    )
  );
}

/**
 * 权限匹配（支持通配符）
 * @param {string} userPerm - 用户权限
 * @param {string} requiredPerm - 要求的权限
 * @returns {boolean}
 */
function matchPermission(userPerm, requiredPerm) {
  if (userPerm === requiredPerm) {
    return true;
  }

  // 支持通配符 (如 'governance.*' 匹配 'governance.view')
  if (userPerm.endsWith('.*')) {
    const prefix = userPerm.slice(0, -2);
    return requiredPerm.startsWith(prefix + '.');
  }

  return false;
}

/**
 * 路由守卫：检查应用是否可访问
 * @param {string} appId - 应用ID
 * @param {Array<string>} userPermissions - 用户权限列表
 * @returns {Object} { allowed: boolean, reason: string }
 */
export function canAccessApp(appId, userPermissions = []) {
  const appConfig = AppRegistry.getAppConfig(appId);

  // 应用不存在
  if (!appConfig) {
    return {
      allowed: false,
      reason: '应用不存在'
    };
  }

  // 应用已禁用
  if (!appConfig.enabled) {
    return {
      allowed: false,
      reason: '应用已禁用'
    };
  }

  // 权限检查
  if (!hasPermission(appConfig.permissions, userPermissions)) {
    return {
      allowed: false,
      reason: '权限不足'
    };
  }

  return {
    allowed: true,
    reason: ''
  };
}

/**
 * 过滤用户可访问的应用列表
 * @param {Array<Object>} apps - 应用配置数组
 * @param {Array<string>} userPermissions - 用户权限列表
 * @returns {Array<Object>}
 */
export function filterAppsByPermission(apps, userPermissions = []) {
  return apps.filter(app => {
    const result = canAccessApp(app.id, userPermissions);
    return result.allowed;
  });
}