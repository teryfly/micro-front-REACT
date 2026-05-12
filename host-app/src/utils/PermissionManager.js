/**
 * 权限管理工具
 * 处理用户权限检查和过滤
 */

/**
 * 获取用户权限列表
 * @returns {Array<string>}
 */
export function getUserPermissions() {
  try {
    // 从localStorage或AuthContext获取
    const permissions = localStorage.getItem('USER_PERMISSIONS');
    return permissions ? JSON.parse(permissions) : [];
  } catch (error) {
    console.error('[PermissionManager] 获取权限失败:', error);
    return [];
  }
}

/**
 * 设置用户权限
 * @param {Array<string>} permissions
 */
export function setUserPermissions(permissions) {
  try {
    localStorage.setItem('USER_PERMISSIONS', JSON.stringify(permissions));
  } catch (error) {
    console.error('[PermissionManager] 保存权限失败:', error);
  }
}

/**
 * 检查是否有指定权限
 * @param {string|Array<string>} permission - 权限标识
 * @returns {boolean}
 */
export function hasPermission(permission) {
  const userPermissions = getUserPermissions();
  
  if (Array.isArray(permission)) {
    return permission.some(p => checkSinglePermission(p, userPermissions));
  }
  
  return checkSinglePermission(permission, userPermissions);
}

/**
 * 检查单个权限
 * @param {string} permission
 * @param {Array<string>} userPermissions
 * @returns {boolean}
 */
function checkSinglePermission(permission, userPermissions) {
  return userPermissions.some(userPerm => {
    if (userPerm === permission) {
      return true;
    }
    
    // 支持通配符
    if (userPerm.endsWith('.*')) {
      const prefix = userPerm.slice(0, -2);
      return permission.startsWith(prefix + '.');
    }
    
    return false;
  });
}

/**
 * 清除权限
 */
export function clearPermissions() {
  localStorage.removeItem('USER_PERMISSIONS');
}