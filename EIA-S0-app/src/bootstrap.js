// EIA-S0-app/src/bootstrap.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getEnv } from './shared/utils/env';

/**
 * Application bootstrap
 * Supports standalone mode and Module Federation mode via URL parameters.
 *
 * Supported query parameters:
 * - token: auth token to seed AuthProvider
 * - apiBaseUrl: base URL to override API client baseURL
 *
 * Example:
 * http://localhost:7002/?token=abc123&apiBaseUrl=https://api.host.com
 */
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token') || localStorage.getItem('auth_token') || null;

// Avoid direct `process.env` access in browser runtime
const baseURL =
  urlParams.get('apiBaseUrl') || getEnv('REACT_APP_API_BASE_URL', undefined);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App token={token} baseURL={baseURL} />);