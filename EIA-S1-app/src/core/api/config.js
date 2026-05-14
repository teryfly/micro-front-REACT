/**
 * S1 API configuration
 * Base URL is injected by webpack DefinePlugin from REACT_APP_API_BASE_URL env var,
 * or overridden at runtime by the host-app via EmbeddedApp prop `apiBaseUrl`.
 */

export const DEFAULT_API_BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) ||
  'http://localhost:5091';

export const API_TIMEOUT = 30000;

export const API_VERSION = 'v1';
