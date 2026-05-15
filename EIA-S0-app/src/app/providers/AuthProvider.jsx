import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken 
} from '../../shared/utils/storage';

/**
 * Authentication context
 * Provides authentication state and actions to child components
 */
export const AuthContext = createContext(null);

/**
 * Auth Provider - Manages authentication token and user session
 * Supports both local authentication (standalone) and external authentication (embedded)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.initialToken] - Initial token (from URL or localStorage)
 * @param {Object} [props.userInfo] - User info from host app (embedded mode)
 * @param {boolean} [props.embedded=false] - Embedded mode flag
 * @param {Object} [props.eventBus] - Event bus for auth events
 * 
 * @example
 * // Standalone mode
 * <AuthProvider initialToken={urlToken}>
 *   <App />
 * </AuthProvider>
 * 
 * // Embedded mode
 * <AuthProvider 
 *   userInfo={hostUserInfo}
 *   embedded={true}
 *   eventBus={eventBus}
 * >
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ 
  children, 
  initialToken,
  userInfo: externalUserInfo,
  embedded = false,
  eventBus = null,
}) => {
  // Initialize token with priority: externalUserInfo > initialToken > localStorage
  const [token, setToken] = useState(() => {
    if (externalUserInfo?.token) return externalUserInfo.token;
    if (initialToken) return initialToken;
    return getStoredToken();
  });

  const [userInfo, setUserInfo] = useState(externalUserInfo || null);

  /**
   * Sync token to localStorage (standalone mode only)
   */
  useEffect(() => {
    if (embedded) return; // Don't persist in embedded mode

    if (token) {
      setStoredToken(token);
    } else {
      removeStoredToken();
    }
  }, [token, embedded]);

  /**
   * Sync external userInfo changes (embedded mode)
   */
  useEffect(() => {
    if (embedded && externalUserInfo) {
      setUserInfo(externalUserInfo);
      if (externalUserInfo.token) {
        setToken(externalUserInfo.token);
      }
    }
  }, [embedded, externalUserInfo]);

  /**
   * Login with JWT token
   * In embedded mode, notifies host app instead of local storage
   * 
   * @param {string} newToken - JWT token from authentication server
   * @param {Object} [newUserInfo] - User information object
   * 
   * @example
   * const { login } = useAuth();
   * login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', { id: '123', username: 'admin' });
   */
  const login = useCallback((newToken, newUserInfo = null) => {
    if (embedded && eventBus) {
      // Embedded mode: notify host app
      eventBus.emit('subapp:auth:login', { 
        token: newToken, 
        userInfo: newUserInfo,
        source: 'eia-s0-app',
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 [AuthProvider] Login event sent to host app');
      }
    } else {
      // Standalone mode: local handling
      setToken(newToken);
      setUserInfo(newUserInfo);
    }
  }, [embedded, eventBus]);

  /**
   * Logout and clear authentication
   * In embedded mode, notifies host app
   * 
   * @example
   * const { logout } = useAuth();
   * logout();
   */
  const logout = useCallback(() => {
    if (embedded && eventBus) {
      // Embedded mode: notify host app
      eventBus.emit('subapp:auth:logout', { 
        source: 'eia-s0-app',
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 [AuthProvider] Logout event sent to host app');
      }
    }
    
    // Clear local state (both modes)
    setToken(null);
    setUserInfo(null);
  }, [embedded, eventBus]);

  /**
   * Listen for logout events from host app (embedded mode)
   */
  useEffect(() => {
    if (!embedded || !eventBus) return;

    const handleHostLogout = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [AuthProvider] Logout event received from host app');
      }
      
      setToken(null);
      setUserInfo(null);
    };

    eventBus.on('host:auth:logout', handleHostLogout);

    return () => {
      eventBus.off('host:auth:logout', handleHostLogout);
    };
  }, [embedded, eventBus]);

  /**
   * Listen for token refresh events (embedded mode)
   */
  useEffect(() => {
    if (!embedded || !eventBus) return;

    const handleTokenRefresh = (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [AuthProvider] Token refresh received from host app');
      }
      
      if (data.token) {
        setToken(data.token);
      }
      if (data.userInfo) {
        setUserInfo(data.userInfo);
      }
    };

    eventBus.on('host:auth:token:refresh', handleTokenRefresh);

    return () => {
      eventBus.off('host:auth:token:refresh', handleTokenRefresh);
    };
  }, [embedded, eventBus]);

  const value = { token, userInfo, login, logout, embedded };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};