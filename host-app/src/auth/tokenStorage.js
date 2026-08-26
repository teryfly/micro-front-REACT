/**
 * 令牌存储
 * 负责 access_token / id_token / 过期时间 / 用户信息 的本地持久化与校验
 *
 * @module auth/tokenStorage
 */

import { getSsoConfig } from './ssoConfig';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'SSO_ACCESS_TOKEN',
  ID_TOKEN: 'SSO_ID_TOKEN',
  TOKEN_TYPE: 'SSO_TOKEN_TYPE',
  EXPIRES_AT: 'SSO_EXPIRES_AT',
  SCOPE: 'SSO_SCOPE',
  USER_INFO: 'SSO_USER_INFO',
};

/** 登录流程中的临时数据（会话级） */
export const SESSION_KEYS = {
  STATE: 'SSO_STATE',
  RETURN_URL: 'SSO_RETURN_URL',
  LOGIN_ATTEMPTS: 'SSO_LOGIN_ATTEMPTS',
  FORBIDDEN_RETRIED: 'SSO_FORBIDDEN_RETRIED',
};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('[SSO] 读取存储失败:', key, error);
    return null;
  }
}

function safeSet(key, value) {
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn('[SSO] 写入存储失败:', key, error);
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    /* ignore */
  }
}

/**
 * 保存令牌响应
 * @param {Object} tokenResponse /connect/token 的返回值
 * @returns {Object} 规范化后的令牌信息
 */
export function saveTokens(tokenResponse = {}) {
  const {
    access_token: accessToken,
    id_token: idToken,
    token_type: tokenType = 'Bearer',
    expires_in: expiresIn,
    scope,
  } = tokenResponse;

  const expiresAt = expiresIn
    ? Date.now() + Number(expiresIn) * 1000
    : Date.now() + 12 * 3600 * 1000;

  safeSet(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  safeSet(STORAGE_KEYS.ID_TOKEN, idToken);
  safeSet(STORAGE_KEYS.TOKEN_TYPE, tokenType);
  safeSet(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));
  safeSet(STORAGE_KEYS.SCOPE, scope);

  return { accessToken, idToken, tokenType, expiresAt, scope };
}

/** @returns {string|null} */
export function getAccessToken() {
  return safeGet(STORAGE_KEYS.ACCESS_TOKEN);
}

/** @returns {string|null} */
export function getIdToken() {
  return safeGet(STORAGE_KEYS.ID_TOKEN);
}

/** @returns {string} */
export function getTokenType() {
  return safeGet(STORAGE_KEYS.TOKEN_TYPE) || 'Bearer';
}

/** @returns {number} 毫秒时间戳，0 表示未知 */
export function getExpiresAt() {
  const value = safeGet(STORAGE_KEYS.EXPIRES_AT);
  return value ? Number(value) : 0;
}

/** @returns {Array<string>} 令牌授予的 scope 列表 */
export function getScopes() {
  const scope = safeGet(STORAGE_KEYS.SCOPE) || '';
  return scope.split(' ').filter(Boolean);
}

/**
 * Authorization 请求头值，例如 "Bearer xxx"
 * @returns {string} 无令牌时返回空串
 */
export function getAuthorizationHeader() {
  const token = getAccessToken();
  if (!token) return '';
  return `${getTokenType()} ${token}`;
}

/**
 * 令牌是否有效（存在且未过期，含提前量）
 * @param {number} [bufferSeconds] 过期提前量，默认取配置
 * @returns {boolean}
 */
export function isTokenValid(bufferSeconds) {
  const token = getAccessToken();
  if (!token) return false;

  const expiresAt = getExpiresAt();
  if (!expiresAt) return true; // 无过期信息时交由接口 401 兜底

  const buffer = (bufferSeconds !== undefined ? bufferSeconds : getSsoConfig().expireBufferSeconds) * 1000;
  return Date.now() + buffer < expiresAt;
}

/**
 * 保存用户信息
 * @param {Object} userInfo
 */
export function saveUserInfo(userInfo) {
  try {
    safeSet(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo || null));
  } catch (error) {
    console.warn('[SSO] 用户信息序列化失败:', error);
  }
}

/** @returns {Object|null} */
export function getUserInfo() {
  const raw = safeGet(STORAGE_KEYS.USER_INFO);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

/**
 * 解析 JWT / Base64 编码令牌的载荷
 * @param {string} token
 * @returns {Object|null}
 */
export function decodeTokenPayload(token) {
  if (!token || typeof token !== 'string') return null;

  const segments = token.split('.');
  const payloadSegment = segments.length >= 2 ? segments[1] : segments[0];

  try {
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

/**
 * 从令牌中提取用户标识（userinfo 不可用时的兜底）
 * @returns {Object|null}
 */
export function getUserFromToken() {
  const payload = decodeTokenPayload(getIdToken()) || decodeTokenPayload(getAccessToken());
  if (!payload) return null;

  return {
    sub: payload.sub || payload.userId || payload.id || '',
    name: payload.name || payload.preferred_username || payload.sub || '',
    role: payload.role || '',
    workno: payload.workno || '',
    gender: payload.gender || '',
    birthdate: payload.birthdate || '',
  };
}

/**
 * 当前登录会话快照
 * @returns {Object}
 */
export function getSession() {
  return {
    accessToken: getAccessToken(),
    idToken: getIdToken(),
    tokenType: getTokenType(),
    expiresAt: getExpiresAt(),
    scopes: getScopes(),
    userInfo: getUserInfo(),
    valid: isTokenValid(),
  };
}

/**
 * 清除全部登录态
 */
export function clearAuth() {
  Object.values(STORAGE_KEYS).forEach(safeRemove);
  try {
    sessionStorage.removeItem(SESSION_KEYS.STATE);
    sessionStorage.removeItem(SESSION_KEYS.FORBIDDEN_RETRIED);
  } catch (error) {
    /* ignore */
  }
}
