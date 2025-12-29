/**
 * API Configuration Constants
 * Centralized API settings for the application
 * @module api.constants
 */

/**
 * API configuration settings
 * Base URL can be overridden via environment variable
 */
export const API_CONFIG = Object.freeze({
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5090',
  PREFIX: '/api/governance',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
});

/**
 * Standard HTTP headers
 */
export const HEADERS = Object.freeze({
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
  AUTHORIZATION: 'Authorization',
  REQUEST_TIME: 'X-Request-Time',
});

/**
 * HTTP methods enumeration
 */
export const HTTP_METHODS = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
});

/**
 * HTTP status codes
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});