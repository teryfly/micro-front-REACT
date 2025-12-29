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
 * Syncs token between React state and localStorage for persistence
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.initialToken] - Initial token (from host app or Module Federation)
 * 
 * @example
 * <AuthProvider initialToken={hostToken}>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children, initialToken }) => {
  // Initialize token from prop or localStorage
  const [token, setToken] = useState(initialToken || getStoredToken());

  // Sync token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      setStoredToken(token);
    } else {
      removeStoredToken();
    }
  }, [token]);

  /**
   * Login with JWT token
   * Stores token in both state and localStorage
   * 
   * @param {string} newToken - JWT token from authentication server
   * 
   * @example
   * const { login } = useAuth();
   * login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   */
  const login = useCallback((newToken) => {
    setToken(newToken);
  }, []);

  /**
   * Logout and clear authentication
   * Removes token from both state and localStorage
   * 
   * @example
   * const { logout } = useAuth();
   * logout();
   */
  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const value = { token, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};