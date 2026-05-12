/**
 * 配置验证器
 * 负责验证apps-config.json的格式和必填字段
 */

const REQUIRED_APP_FIELDS = ['id', 'name', 'displayName', 'entry', 'route', 'enabled'];
const REQUIRED_ENTRY_FIELDS = ['development', 'production'];

/**
 * 验证单个应用配置
 * @param {Object} app - 应用配置对象
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateApp(app) {
  const errors = [];

  // 检查必填字段
  REQUIRED_APP_FIELDS.forEach(field => {
    if (!app[field] && app[field] !== false) {
      errors.push(`应用配置缺少必填字段: ${field}`);
    }
  });

  // 验证entry对象
  if (app.entry && typeof app.entry === 'object') {
    REQUIRED_ENTRY_FIELDS.forEach(env => {
      if (!app.entry[env]) {
        errors.push(`应用 ${app.id} 的entry缺少 ${env} 环境配置`);
      }
    });
  } else {
    errors.push(`应用 ${app.id} 的entry必须是对象`);
  }

  // 验证route格式
  if (app.route && !app.route.startsWith('/')) {
    errors.push(`应用 ${app.id} 的route必须以/开头`);
  }

  // 验证permissions是数组
  if (app.permissions && !Array.isArray(app.permissions)) {
    errors.push(`应用 ${app.id} 的permissions必须是数组`);
  }

  // FIX: 验证name字段格式（Module Federation容器名）
  if (app.name) {
    // 容器名只能包含字母、数字、下划线、连字符
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(app.name)) {
      errors.push(`应用 ${app.id} 的name格式无效，必须以字母开头，只能包含字母、数字、下划线、连字符`);
    }
  }

  // FIX: 验证entry URL格式
  if (app.entry) {
    Object.entries(app.entry).forEach(([env, url]) => {
      if (!url.endsWith('/remoteEntry.js')) {
        errors.push(`应用 ${app.id} 的${env}环境entry URL必须以/remoteEntry.js结尾`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证完整配置文件
 * @param {Object} config - 配置对象
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateConfig(config) {
  const errors = [];

  // 检查顶层结构
  if (!config) {
    return { valid: false, errors: ['配置对象为空'] };
  }

  if (!config.version) {
    errors.push('配置缺少version字段');
  }

  if (!config.apps || !Array.isArray(config.apps)) {
    errors.push('配置缺少apps数组');
    return { valid: false, errors };
  }

  // 验证每个应用
  config.apps.forEach((app, index) => {
    const result = validateApp(app);
    if (!result.valid) {
      errors.push(`应用[${index}] ${app.id || 'unknown'}: ${result.errors.join(', ')}`);
    }
  });

  // 检查应用ID唯一性
  const appIds = config.apps.map(app => app.id);
  const duplicates = appIds.filter((id, index) => appIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`应用ID重复: ${duplicates.join(', ')}`);
  }

  // FIX: 检查容器名唯一性
  const containerNames = config.apps.map(app => app.name);
  const duplicateNames = containerNames.filter((name, index) => containerNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push(`Module Federation容器名重复: ${duplicateNames.join(', ')}`);
  }

  // 验证menuGroups
  if (config.menuGroups && !Array.isArray(config.menuGroups)) {
    errors.push('menuGroups必须是数组');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证并过滤配置
 * @param {Object} config - 原始配置
 * @returns {Object} 验证后的配置
 */
export function validateAndFilter(config) {
  const result = validateConfig(config);
  
  if (!result.valid) {
    console.error('配置验证失败:', result.errors);
    throw new Error(`配置验证失败: ${result.errors.join('; ')}`);
  }

  // 过滤禁用的应用
  const filteredConfig = {
    ...config,
    apps: config.apps.filter(app => app.enabled !== false)
  };

  // FIX: 添加配置摘要日志
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [ConfigValidator] 配置验证通过:', {
      totalApps: filteredConfig.apps.length,
      enabledApps: filteredConfig.apps.filter(a => a.enabled !== false).length,
      containers: filteredConfig.apps.map(a => `${a.id} → ${a.name}`),
    });
  }

  return filteredConfig;
}