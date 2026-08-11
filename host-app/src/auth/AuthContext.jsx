/**
 * 鉴权上下文
 * 统一管理单点登录状态机：
 *   initializing -> (authenticating | redirecting) -> authenticated / unauthenticated / forbidden / error
 *
 * 触发单点登录的场景：
 *   1. 无 token 或 token 过期
 *   2. 接口返回 401（token 失效）
 *   3. 接口返回 403 且开启了 reloginOnForbidden（仅重试一次，避免死循环）
 *
 * @module auth/AuthContext
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getSsoConfig } from './ssoConfig';
import ssoService, { AuthError } from './ssoService';
import {
  getSession,
  getScopes,
  getUserInfo,
  getUserFromToken,
  isTokenValid,
  saveUserInfo,
  clearAuth,
  SESSION_KEYS,
} from './tokenStorage';
import { setUserPermissions, clearPermissions } from '../utils/PermissionManager';
import { AUTH_EVENTS } from './authEvents';

/** 鉴权状态 */
export const AuthStatus = {
  INITIALIZING: 'initializing',
  AUTHENTICATING: 'authenticating',
  REDIRECTING: 'redirecting',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  FORBIDDEN: 'forbidden',
  ERROR: 'error',
};

export { AUTH_EVENTS };

const CURRENT_USER_KEY = 'CURRENT_USER_ID';
const TOKEN_CHECK_INTERVAL = 30 * 1000;

const AuthContext = createContext(null);

/** 关闭单点登录时使用的本地用户 */
const MOCK_USER = {
  sub: 'local-dev-user',
  name: '本地开发用户',
  role: 'Admin',
  workno: '000000',
  gender: '',
  birthdate: '',
};

/**
 * 把用户身份同步给主应用其它模块（菜单配置按用户隔离、权限管理）
 * @param {Object} userInfo
 * @param {Array<string>} scopes
 */
function syncIdentity(userInfo, scopes) {
  const config = getSsoConfig();

  if (config.syncUserId && userInfo && userInfo.sub) {
    try {
      const previous = localStorage.getItem(CURRENT_USER_KEY);
      if (previous !== userInfo.sub) {
        localStorage.setItem(CURRENT_USER_KEY, userInfo.sub);
        console.log('[SSO] 当前用户已切换为:', userInfo.sub);
      }
    } catch (error) {
      console.warn('[SSO] 同步用户 ID 失败:', error);
    }
  }

  // 权限来源：令牌 scope + 用户角色
  const permissions = [...(scopes || [])];
  if (userInfo && userInfo.role) {
    const roles = Array.isArray(userInfo.role) ? userInfo.role : String(userInfo.role).split(',');
    roles
      .map((role) => role.trim())
      .filter(Boolean)
      .forEach((role) => {
        permissions.push(role);
        permissions.push(`role:${role}`);
      });
  }
  setUserPermissions(Array.from(new Set(permissions)));
}

/**
 * 暴露给子应用使用的全局鉴权对象
 * @param {Object} snapshot
 */
function exposeToSubApps(snapshot) {
  if (typeof window === 'undefined') return;
  window.__HOST_AUTH__ = snapshot;
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.AUTH_CHANGE, { detail: snapshot }));
}

/**
 * 鉴权 Provider
 */
export function AuthProvider({ children }) {
  const config = useMemo(() => getSsoConfig(), []);
  const [status, setStatus] = useState(AuthStatus.INITIALIZING);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(() => getSession());

  // React StrictMode 下 effect 会执行两次，用 ref 保证授权码只换取一次
  const initializedRef = useRef(false);

  const applySession = useCallback((userInfo) => {
    const current = getSession();
    setSession(current);
    setUser(userInfo);
    syncIdentity(userInfo, current.scopes);
    exposeToSubApps({
      isAuthenticated: true,
      accessToken: current.accessToken,
      tokenType: current.tokenType,
      authorization: current.accessToken ? `${current.tokenType} ${current.accessToken}` : '',
      expiresAt: current.expiresAt,
      scopes: current.scopes,
      user: userInfo,
    });
  }, []);

  /** 加载用户信息（失败时降级为令牌解析结果） */
  const loadUserInfo = useCallback(async () => {
    if (!config.fetchUserInfo) {
      return getUserInfo() || getUserFromToken() || {};
    }

    try {
      return await ssoService.fetchUserInfo();
    } catch (err) {
      if (err instanceof AuthError && (err.code === 'TOKEN_EXPIRED' || err.code === 'FORBIDDEN')) {
        throw err;
      }
      console.warn('[SSO] 获取用户信息失败，降级使用令牌中的用户信息:', err.message);
      const fallback = getUserInfo() || getUserFromToken() || {};
      saveUserInfo(fallback);
      return fallback;
    }
  }, [config.fetchUserInfo]);

  /** 跳转单点登录 */
  const login = useCallback(
    (options = {}) => {
      setStatus(AuthStatus.REDIRECTING);
      const redirected = ssoService.login(options);
      if (!redirected) {
        setError(
          new AuthError(
            '跳转单点登录失败：短时间内重复跳转已被中断，请确认认证中心地址、client_id 与回调地址配置是否正确。',
            'LOGIN_BLOCKED'
          )
        );
        setStatus(AuthStatus.ERROR);
      }
    },
    []
  );

  /** 登出 */
  const logout = useCallback((options = {}) => {
    clearPermissions();
    exposeToSubApps({ isAuthenticated: false, accessToken: '', authorization: '', user: null });
    ssoService.logout(options);
  }, []);

  /** 401：令牌失效，重新登录 */
  const handleUnauthorized = useCallback(
    (reason = '接口返回 401') => {
      console.warn('[SSO] 登录态失效:', reason);
      clearAuth();
      clearPermissions();
      setUser(null);
      exposeToSubApps({ isAuthenticated: false, accessToken: '', authorization: '', user: null });

      if (config.autoLogin) {
        login({ reason });
      } else {
        setStatus(AuthStatus.UNAUTHENTICATED);
      }
    },
    [config.autoLogin, login]
  );

  /** 403：无权限。按配置重新走一次单点登录，仍失败则展示无权限页 */
  const handleForbidden = useCallback(
    (reason = '接口返回 403') => {
      console.warn('[SSO] 权限不足:', reason);

      let retried = false;
      try {
        retried = sessionStorage.getItem(SESSION_KEYS.FORBIDDEN_RETRIED) === 'true';
      } catch (err) {
        /* ignore */
      }

      if (config.reloginOnForbidden && !retried) {
        try {
          sessionStorage.setItem(SESSION_KEYS.FORBIDDEN_RETRIED, 'true');
        } catch (err) {
          /* ignore */
        }
        clearAuth();
        login({ reason: '权限不足，重新认证' });
        return;
      }

      setError(new AuthError(reason, 'FORBIDDEN'));
      setStatus(AuthStatus.FORBIDDEN);
    },
    [config.reloginOnForbidden, login]
  );

  /** 初始化：处理回调 / 校验令牌 / 触发登录 */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let cancelled = false;

    const initialize = async () => {
      // 单点登录关闭：本地开发直通
      if (!config.enabled) {
        console.warn('[SSO] 单点登录已关闭，使用本地模拟用户');
        setUser(MOCK_USER);
        syncIdentity(MOCK_USER, ['*']);
        exposeToSubApps({ isAuthenticated: true, accessToken: '', authorization: '', user: MOCK_USER });
        setStatus(AuthStatus.AUTHENTICATED);
        return;
      }

      const callback = ssoService.readCallbackParams();

      // 步骤 2/3：认证中心回跳，拿授权码换令牌
      if (callback.isCallback) {
        if (callback.error) {
          setError(new AuthError(callback.errorDescription || callback.error, 'AUTHORIZE_ERROR'));
          setStatus(AuthStatus.ERROR);
          return;
        }

        setStatus(AuthStatus.AUTHENTICATING);
        try {
          await ssoService.handleCallback();
          const userInfo = await loadUserInfo();
          if (cancelled) return;
          applySession(userInfo);
          setStatus(AuthStatus.AUTHENTICATED);
        } catch (err) {
          if (cancelled) return;
          console.error('[SSO] 登录回调处理失败:', err);
          if (err instanceof AuthError && err.code === 'FORBIDDEN') {
            handleForbidden('认证中心返回无访问权限');
            return;
          }
          setError(err);
          setStatus(AuthStatus.ERROR);
        }
        return;
      }

      // 已有有效令牌
      if (isTokenValid()) {
        try {
          const userInfo = await loadUserInfo();
          if (cancelled) return;
          applySession(userInfo);
          ssoService.resetLoginAttempts();
          setStatus(AuthStatus.AUTHENTICATED);
        } catch (err) {
          if (cancelled) return;
          if (err instanceof AuthError && err.code === 'FORBIDDEN') {
            handleForbidden('用户信息接口返回无权限');
            return;
          }
          handleUnauthorized('用户信息接口返回 401');
        }
        return;
      }

      // 步骤 1：无 token / token 过期 -> 跳转单点登录
      clearAuth();
      if (config.autoLogin) {
        login({ reason: '无有效登录态' });
      } else {
        setStatus(AuthStatus.UNAUTHENTICATED);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [config, applySession, loadUserInfo, login, handleForbidden, handleUnauthorized]);

  /** 令牌过期轮询 */
  useEffect(() => {
    if (!config.enabled || status !== AuthStatus.AUTHENTICATED) return undefined;

    const timer = setInterval(() => {
      if (!isTokenValid()) {
        handleUnauthorized('访问令牌已过期');
      }
    }, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(timer);
  }, [config.enabled, status, handleUnauthorized]);

  /** 监听 httpClient 抛出的 401 / 403 */
  useEffect(() => {
    const onUnauthorized = (event) => handleUnauthorized(event.detail?.reason || '接口返回 401');
    const onForbidden = (event) => handleForbidden(event.detail?.reason || '接口返回 403');

    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized);
    window.addEventListener(AUTH_EVENTS.FORBIDDEN, onForbidden);

    return () => {
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized);
      window.removeEventListener(AUTH_EVENTS.FORBIDDEN, onForbidden);
    };
  }, [handleUnauthorized, handleForbidden]);

  /** 主动刷新用户信息 */
  const refreshUserInfo = useCallback(async () => {
    const userInfo = await loadUserInfo();
    applySession(userInfo);
    return userInfo;
  }, [loadUserInfo, applySession]);

  /** 是否拥有某个 scope / 角色 */
  const hasScope = useCallback((scope) => getScopes().includes(scope), []);

  const value = useMemo(
    () => ({
      status,
      user,
      error,
      config,
      accessToken: session.accessToken,
      tokenType: session.tokenType,
      expiresAt: session.expiresAt,
      scopes: session.scopes,
      isAuthenticated: status === AuthStatus.AUTHENTICATED,
      isLoading: status === AuthStatus.INITIALIZING || status === AuthStatus.AUTHENTICATING,
      login,
      logout,
      refreshUserInfo,
      handleUnauthorized,
      handleForbidden,
      hasScope,
    }),
    [
      status,
      user,
      error,
      config,
      session,
      login,
      logout,
      refreshUserInfo,
      handleUnauthorized,
      handleForbidden,
      hasScope,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 获取鉴权上下文
 * @returns {Object}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 <AuthProvider> 内部使用');
  }
  return context;
}

export default AuthContext;
