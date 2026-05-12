/**
 * Module Federation运行时封装
 * 处理动态remote加载的底层逻辑
 */

/**
 * 动态加载远程容器
 * @param {string} remoteUrl - remoteEntry.js的URL
 * @param {string} scope - 远程容器名称
 * @returns {Promise<Object>} 远程容器对象
 */
export async function loadRemoteContainer(remoteUrl, scope) {
  // 检查容器是否已加载
  if (window[scope]) {
    console.log(`[MF Runtime] 容器 ${scope} 已存在`);
    return window[scope];
  }

  // 动态创建script标签加载remoteEntry.js
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = remoteUrl;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => {
      console.log(`[MF Runtime] ${scope} remoteEntry.js 加载成功`);
      resolve();
    };

    script.onerror = () => {
      // FIX: Enhanced error message
      const error = new Error(
        `Failed to load remote entry: ${remoteUrl}\n` +
        `请检查:\n` +
        `1. 子应用是否正在运行\n` +
        `2. URL是否正确\n` +
        `3. CORS配置是否正确`
      );
      reject(error);
    };

    document.head.appendChild(script);
  });

  // 等待容器初始化
  if (!window[scope]) {
    // FIX: Enhanced error with troubleshooting steps
    const availableContainers = Object.keys(window).filter(key => 
      typeof window[key] === 'object' && 
      window[key]?.init && 
      window[key]?.get
    );

    throw new Error(
      `Container "${scope}" not found after loading ${remoteUrl}\n\n` +
      `可能的原因:\n` +
      `1. webpack.config.js中的name配置与apps-config.json不匹配\n` +
      `2. 子应用的ModuleFederationPlugin配置错误\n` +
      `3. remoteEntry.js加载成功但容器初始化失败\n\n` +
      `当前可用容器: ${availableContainers.length > 0 ? availableContainers.join(', ') : '无'}\n` +
      `期望容器名: ${scope}`
    );
  }

  return window[scope];
}

/**
 * 初始化远程容器的共享作用域
 * @param {Object} container - 远程容器对象
 * @returns {Promise<void>}
 */
export async function initRemoteContainer(container) {
  try {
    // 初始化共享作用域
    await __webpack_init_sharing__('default');
    await container.init(__webpack_share_scopes__.default);
    console.log('[MF Runtime] 容器共享作用域初始化完成');
  } catch (error) {
    // FIX: Enhanced error logging
    console.error('[MF Runtime] 共享作用域初始化失败:', error);
    throw new Error(
      `共享作用域初始化失败\n` +
      `可能原因:\n` +
      `1. React版本不兼容\n` +
      `2. shared配置不一致\n` +
      `原始错误: ${error.message}`
    );
  }
}

/**
 * 从远程容器获取模块
 * @param {Object} container - 远程容器对象
 * @param {string} module - 模块路径（如 './Button'）
 * @returns {Promise<any>} 模块导出
 */
export async function getRemoteModule(container, module) {
  try {
    const factory = await container.get(module);
    const Module = factory();
    return Module;
  } catch (error) {
    // FIX: Enhanced error with available modules
    const availableModules = [];
    try {
      // Try to get exposed modules (if container provides this info)
      if (container._config && container._config.exposes) {
        availableModules.push(...Object.keys(container._config.exposes));
      }
    } catch (e) {
      // Ignore
    }

    throw new Error(
      `无法获取模块 "${module}"\n\n` +
      `可能原因:\n` +
      `1. 模块路径错误\n` +
      `2. 子应用webpack.config.js中未expose此模块\n` +
      `3. 模块导出格式错误\n\n` +
      (availableModules.length > 0 
        ? `可用模块: ${availableModules.join(', ')}\n` 
        : '提示: 检查子应用webpack.config.js的exposes配置\n') +
      `原始错误: ${error.message}`
    );
  }
}

/**
 * 完整的远程模块加载流程
 *
 * 支持两种调用方式:
 *   loadRemoteModule(url, scope, module)              — 位置参数 (向后兼容)
 *   loadRemoteModule({ entryUrl, containerName, modulePath })  — 对象参数 (推荐)
 *
 * @returns {Promise<any>} 模块导出
 */
export async function loadRemoteModule(remoteUrlOrOpts, scope, module) {
  // Normalise: support object-param style for cleaner call sites
  if (remoteUrlOrOpts && typeof remoteUrlOrOpts === 'object') {
    const { entryUrl, containerName, modulePath } = remoteUrlOrOpts;
    return loadRemoteModule(entryUrl, containerName, modulePath);
  }

  const remoteUrl = remoteUrlOrOpts;
  try {
    console.log(`[MF Runtime] 开始加载远程模块: ${scope}/${module} from ${remoteUrl}`);
    
    // 1. 加载远程容器
    const container = await loadRemoteContainer(remoteUrl, scope);
    
    // 2. 初始化共享作用域
    await initRemoteContainer(container);
    
    // 3. 获取模块
    const moduleExports = await getRemoteModule(container, module);
    
    console.log(`[MF Runtime] 远程模块加载成功: ${scope}/${module}`);
    return moduleExports;

  } catch (error) {
    console.error(`[MF Runtime] 远程模块加载失败: ${scope}/${module}`, error);
    
    // FIX: Add detailed troubleshooting info
    console.error(
      `\n📋 故障排查清单:\n` +
      `1. 确认子应用正在运行: ${remoteUrl.replace('/remoteEntry.js', '')}\n` +
      `2. 检查apps-config.json中的name字段: "${scope}"\n` +
      `3. 检查子应用webpack.config.js中的name字段\n` +
      `4. 检查子应用webpack.config.js中的exposes配置是否包含: "${module}"\n` +
      `5. 打开浏览器Network标签，确认remoteEntry.js是否成功加载\n`
    );
    
    throw error;
  }
}

/**
 * 预加载远程容器（优化首屏性能）
 * @param {Array<Object>} apps - 应用配置数组
 * @returns {Promise<void>}
 */
export async function preloadRemoteContainers(apps) {
  const preloadPromises = apps.map(async (app) => {
    try {
      await loadRemoteContainer(app.entryUrl, app.name);
      console.log(`[MF Runtime] 预加载容器成功: ${app.name}`);
    } catch (error) {
      console.warn(`[MF Runtime] 预加载容器失败: ${app.name}`, error);
      // FIX: Don't throw, just warn - allow app to retry on demand
    }
  });

  await Promise.allSettled(preloadPromises);
}