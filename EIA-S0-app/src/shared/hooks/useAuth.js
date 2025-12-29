import { useContext } from 'react';
import { AuthContext } from '../../app/providers/AuthProvider';

/**
 * Hook to access authentication context
 * Provides auth state and actions to components
 * 
 * @returns {Object} Authentication context value
 * @returns {string|null} return.token - Current JWT token or null
 * @returns {Function} return.login - Login function
 * @returns {Function} return.logout - Logout function
 * 
 * @throws {Error} If used outside AuthProvider
 * 
 * @example
 * const { token, login, logout } = useAuth();
 * 
 * // Check authentication status
 * if (!token) {
 *   // Redirect to login
 * }
 * 
 * // Login
 * login('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * 
 * // Logout
 * logout();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};