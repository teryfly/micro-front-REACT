/**
 * 单点登录服务
 * 实现认证中心对接的四个步骤：
 *   1. 跳转 /connect/authorize 登录
 *   2. 回跳携带授权码 code
 *   3. POST /connect/token 用授权码换令牌
 *   4. GET  /connect/userinfo 获取用户信息（可选）
 * 以及登出（/connect/endsession）与重定向死循环保护。
 *
 * @module auth/ssoService
 */

import { getSsoConfig } from './ssoConfig';
import {
  SESSION_KEYS,
  saveTokens,
  saveUserInfo,
  getIdToken,
  getAuthorizationHeader,
  clearAuth,
} from './tokenStorage';

/** 认证中心回跳时会带上的参数，处理完成后需要从地址栏清理掉 */
const CALLBACK_PARAMS = ['code', 'scope', 'state', 'session_state', 'iss', 'error', 'error_description'];

/**
 * 鉴权错误
 */
export class AuthError extends Error {
  constructor(message, code = 'AUTH_ERROR', detail) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.detail = detail;
  }
}

function sessionGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function sessionSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    /* ignore */
  }
}

function sessionRemove(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    /* ignore */
  }
}

function randomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const cryptoObj = typeof window !== 'undefined' ? window.crypto || window.msCrypto : null;

  if (cryptoObj && cryptoObj.getRandomValues) {
    const buffer = new Uint32Array(length);
    cryptoObj.getRandomValues(buffer);
    for (let i = 0; i < length; i += 1) {
      result += chars[buffer[i] % chars.length];
    }
    return result;
  }

  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * 读取当前地址栏中的回调参数
 * @returns {{ code: string, state: string, scope: string, error: string, errorDescription: string, isCallback: boolean }}
 */
export function readCallbackParams() {
  if (typeof window === 'undefined') {
    return { code: '', state: '', scope: '', error: '', errorDescription: '', isCallback: false };
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || '';
  const error = params.get('error') || '';

  return {
    code,
    state: params.get('state') || '',
    scope: params.get('scope') || '',
    error,
    errorDescription: params.get('error_description') || '',
    isCallback: Boolean(code || error),
  };
}

/**
 * 去掉地址栏中的单点登录回调参数，返回干净的相对地址
 * @returns {string}
 */
export function getCleanedUrl() {
  if (typeof window === 'undefined') return '/';

  const url = new URL(window.location.href);
  CALLBACK_PARAMS.forEach((key) => url.searchParams.delete(key));

  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ''}${url.hash || ''}`;
}

/**
 * 记录一次登录跳转，用于防止认证异常导致的无限重定向
 * @returns {boolean} true 表示允许跳转
 */
function allowLoginRedirect() {
  const { maxLoginAttempts, loginAttemptWindowMs } = getSsoConfig();
  const now = Date.now();

  let record = { count: 0, firstAt: now };
  const raw = sessionGet(SESSION_KEYS.LOGIN_ATTEMPTS);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && now - parsed.firstAt < loginAttemptWindowMs) {
        record = parsed;
      }
    } catch (error) {
      /* ignore */
    }
  }

  record.count += 1;
  sessionSet(SESSION_KEYS.LOGIN_ATTEMPTS, JSON.stringify(record));

  return record.count <= maxLoginAttempts;
}

/**
 * 重置登录跳转计数（登录成功后调用）
 */
export function resetLoginAttempts() {
  sessionRemove(SESSION_KEYS.LOGIN_ATTEMPTS);
  sessionRemove(SESSION_KEYS.FORBIDDEN_RETRIED);
}

/**
 * 构造认证中心登录地址
 * @param {Object} [options]
 * @param {string} [options.returnUrl] 登录成功后要恢复的应用内地址
 * @returns {string}
 */
export function buildAuthorizeUrl(options = {}) {
  const config = getSsoConfig();
  const returnUrl = options.returnUrl || getCleanedUrl();

  sessionSet(SESSION_KEYS.RETURN_URL, returnUrl);

  const params = new URLSearchParams();
  params.set('response_type', 'code');
  params.set('client_id', config.clientId);
  params.set('scope', config.scope);
  params.set('redirect_uri', config.redirectUri);

  if (config.secretInAuthorize && config.clientSecret) {
    params.set('client_secret', config.clientSecret);
  }
  // debugger
  if (config.useState) {
    const state = randomString(32);
    sessionSet(SESSION_KEYS.STATE, state);
    params.set('state', state);
  }
  console.log('***********************')
  console.log(JSON.stringify(params))
  return `${config.authorizeEndpoint}?${params.toString()}`;
}

/**
 * 跳转到认证中心登录
 * @param {Object} [options]
 * @param {string} [options.returnUrl] 登录后恢复的地址
 * @param {string} [options.reason] 触发登录的原因（日志用）
 * @returns {boolean} false 表示被防死循环保护拦截
 */
export function login(options = {}) {
  const config = getSsoConfig();

  if (!config.enabled) {
    console.warn('[SSO] 单点登录已关闭（REACT_APP_SSO_ENABLED=false），跳过跳转');
    return false;
  }

  if (!allowLoginRedirect()) {
    console.error('[SSO] 短时间内多次跳转登录，已中断以避免死循环。请检查认证中心配置。');
    return false;
  }

  const url = buildAuthorizeUrl(options);
  // 跳转前打印完整地址，便于核对 authorizeEndpoint / client_id / scope / redirect_uri 是否拼装正确
  console.log('[SSO] 即将跳转到单点登录（跳转前）:');
  console.log('      完整地址:', url);
  console.log('      回跳地址 redirect_uri:', getSsoConfig().redirectUri);
  window.location.replace(url);
  return true;
}

/**
 * 用授权码换取令牌
 * @param {string} code 授权码
 * @returns {Promise<Object>} 令牌响应
 */
export async function exchangeCodeForToken(code) {
  const config = getSsoConfig();

  // 方案一：后端代理换取（推荐，避免前端暴露 client_secret，同时规避跨域）
  if (config.tokenProxyUrl) {
    const response = await fetch(config.tokenProxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: config.redirectUri }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new AuthError(`换取令牌失败（代理接口 ${response.status}）`, 'TOKEN_EXCHANGE_FAILED', text);
    }
    return response.json();
  }

  // 方案二：前端直连认证中心（需要认证中心允许跨域）
  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('code', code);
  body.set('client_id', config.clientId);
  body.set('client_secret', config.clientSecret);
  body.set('scope', config.scope);
  body.set('redirect_uri', config.redirectUri);

  let response;
  try {
    response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (error) {
    throw new AuthError(
      '无法连接认证中心换取令牌，请检查网络或跨域(CORS)配置',
      'TOKEN_NETWORK_ERROR',
      error.message
    );
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && (data.error_description || data.error)) || `HTTP ${response.status}`;
    throw new AuthError(`换取令牌失败：${message}`, 'TOKEN_EXCHANGE_FAILED', data || text);
  }

  if (!data || !data.access_token) {
    throw new AuthError('认证中心未返回 access_token', 'TOKEN_INVALID_RESPONSE', data || text);
  }

  return data;
}

/**
 * 处理登录回调：校验 state -> 换取令牌 -> 落库 -> 清理地址栏
 * @returns {Promise<{ tokens: Object, returnUrl: string }>}
 */
export async function handleCallback() {
  const config = getSsoConfig();
  const { code, state, error, errorDescription } = readCallbackParams();

  if (error) {
    throw new AuthError(errorDescription || `认证中心返回错误：${error}`, 'AUTHORIZE_ERROR', error);
  }

  if (!code) {
    throw new AuthError('回调地址中未找到授权码 code', 'NO_CODE');
  }

  // state 校验（认证中心未回传时仅告警，不阻断）
  if (config.useState) {
    const expected = sessionGet(SESSION_KEYS.STATE);
    if (expected && state && expected !== state) {
      throw new AuthError('state 校验失败，可能存在 CSRF 风险', 'STATE_MISMATCH');
    }
    if (expected && !state) {
      console.warn('[SSO] 认证中心未回传 state，已跳过校验');
    }
  }

  const tokenResponse = await exchangeCodeForToken(code);
  const tokens = saveTokens(tokenResponse);

  sessionRemove(SESSION_KEYS.STATE);
  resetLoginAttempts();

  const returnUrl = sessionGet(SESSION_KEYS.RETURN_URL) || getCleanedUrl() || '/';
  sessionRemove(SESSION_KEYS.RETURN_URL);

  // 清理地址栏中的 code / session_state 等参数，避免刷新时重复换取
  try {
    window.history.replaceState(null, '', returnUrl);
  } catch (err) {
    console.warn('[SSO] 清理回调参数失败:', err);
  }

  console.log('[SSO] 登录成功，令牌有效期至:', new Date(tokens.expiresAt).toLocaleString());
  return { tokens, returnUrl };
}

/**
 * 获取用户信息
 * @returns {Promise<Object>}
 */
export async function fetchUserInfo() {
  const config = getSsoConfig();
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new AuthError('缺少访问令牌，无法获取用户信息', 'NO_TOKEN');
  }

  let response;
  try {
    response = await fetch(config.userInfoEndpoint, {
      method: 'GET',
      headers: { Authorization: authorization, Accept: 'application/json' },
    });
  } catch (error) {
    throw new AuthError('获取用户信息失败，请检查网络或跨域(CORS)配置', 'USERINFO_NETWORK_ERROR', error.message);
  }

  if (response.status === 401) {
    throw new AuthError('访问令牌已失效', 'TOKEN_EXPIRED');
  }

  if (response.status === 403) {
    throw new AuthError('当前账号无访问权限', 'FORBIDDEN');
  }

  if (!response.ok) {
    throw new AuthError(`获取用户信息失败：HTTP ${response.status}`, 'USERINFO_FAILED');
  }

  const userInfo = await response.json();
  saveUserInfo(userInfo);
  return userInfo;
}

/**
 * 登出
 * @param {Object} [options]
 * @param {boolean} [options.redirectToSso=true] 是否跳转认证中心统一登出
 */
export function logout(options = {}) {
  const { redirectToSso = true } = options;
  const config = getSsoConfig();
  const idToken = getIdToken();

  clearAuth();
  resetLoginAttempts();

  if (!config.enabled || !redirectToSso) {
    window.location.replace(config.postLogoutRedirectUri || '/');
    return;
  }

  const params = new URLSearchParams();
  if (idToken) params.set('id_token_hint', idToken);
  if (config.postLogoutRedirectUri) params.set('post_logout_redirect_uri', config.postLogoutRedirectUri);

  const query = params.toString();
  const url = query ? `${config.endSessionEndpoint}?${query}` : config.endSessionEndpoint;

  console.log('[SSO] 跳转统一登出:', url);
  window.location.replace(url);
}

/**
 * 令牌失效 / 401 时重新登录
 * @param {string} [reason]
 * @returns {boolean}
 */
export function reauthenticate(reason = 'token 失效') {
  const returnUrl = getCleanedUrl();
  clearAuth();
  return login({ returnUrl, reason });
}

export default {
  readCallbackParams,
  getCleanedUrl,
  buildAuthorizeUrl,
  login,
  logout,
  handleCallback,
  exchangeCodeForToken,
  fetchUserInfo,
  reauthenticate,
  resetLoginAttempts,
  AuthError,
};
