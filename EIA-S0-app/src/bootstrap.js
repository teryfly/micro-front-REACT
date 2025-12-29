import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
// Import global CSS variables
import './shared/ui/common.module.css';

/**
 * Application bootstrap
 * Supports both standalone mode and Module Federation embedded mode
 * 
 * Configuration Sources (in priority order):
 * 1. URL parameters (?token=...&apiBaseUrl=...)
 * 2. localStorage (for standalone mode)
 * 3. Environment variables (fallback)
 * 
 * URL Parameter Examples:
 * - Standalone: http://localhost:7002/
 * - With token: http://localhost:7002/?token=abc123
 * - Full config: http://localhost:7002/?token=abc123&apiBaseUrl=https://api.host.com
 */

// Parse URL parameters for embedded mode
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token') || localStorage.getItem('auth_token');
const baseURL = urlParams.get('apiBaseUrl') || process.env.REACT_APP_API_BASE_URL;

// Log configuration in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Bootstrap Configuration:', {
    hasToken: !!token,
    baseURL: baseURL || 'default',
    mode: urlParams.has('token') ? 'embedded' : 'standalone',
  });
}

// Render application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App token={token} baseURL={baseURL} />
);