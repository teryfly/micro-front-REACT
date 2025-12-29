/**
 * API Endpoint Definitions
 * All endpoints use exact casing from Swagger specification
 * @module endpoints
 */

/**
 * Base URL for all governance API endpoints
 */
const BASE_URL = '/api/governance';

/**
 * API endpoint configuration
 * Note: All endpoint paths use exact casing from backend Swagger (e.g., DocType, AIService)
 */
export const endpoints = {
  /**
   * DocType endpoints
   */
  doctype: {
    list: `${BASE_URL}/DocType`,
    detail: (id) => `${BASE_URL}/DocType/${id}`,
    create: `${BASE_URL}/DocType`,
    update: (id) => `${BASE_URL}/DocType/${id}`,
    delete: (id) => `${BASE_URL}/DocType/${id}`,
  },

  /**
   * Phase endpoints
   */
  phase: {
    list: `${BASE_URL}/Phase`,
    detail: (id) => `${BASE_URL}/Phase/${id}`,
    create: `${BASE_URL}/Phase`,
    update: (id) => `${BASE_URL}/Phase/${id}`,
    delete: (id) => `${BASE_URL}/Phase/${id}`,
  },

  /**
   * AIService endpoints
   */
  aiService: {
    list: `${BASE_URL}/AIService`,
    detail: (id) => `${BASE_URL}/AIService/${id}`,
    create: `${BASE_URL}/AIService`,
    update: (id) => `${BASE_URL}/AIService/${id}`,
    delete: (id) => `${BASE_URL}/AIService/${id}`,
  },

  /**
   * PromptTemplate endpoints
   */
  promptTemplate: {
    list: `${BASE_URL}/PromptTemplate`,
    detail: (id) => `${BASE_URL}/PromptTemplate/${id}`,
    create: `${BASE_URL}/PromptTemplate`,
    update: (id) => `${BASE_URL}/PromptTemplate/${id}`,
    delete: (id) => `${BASE_URL}/PromptTemplate/${id}`,
    versions: (id) => `${BASE_URL}/PromptTemplate/${id}/versions`,
  },

  /**
   * Category endpoints
   */
  category: {
    tree: `${BASE_URL}/Category/tree`,
    detail: (id) => `${BASE_URL}/Category/${id}`,
    create: `${BASE_URL}/Category`,
    update: (id) => `${BASE_URL}/Category/${id}`,
    delete: (id) => `${BASE_URL}/Category/${id}`,
  },

  /**
   * SystemParameter endpoints
   */
  systemParam: {
    list: `${BASE_URL}/SystemParameter`,
    detail: (key) => `${BASE_URL}/SystemParameter/${key}`,
    update: (key) => `${BASE_URL}/SystemParameter/${key}`,
  },

  /**
   * Role and Permission endpoints
   */
  role: {
    list: `${BASE_URL}/Role`,
    detail: (id) => `${BASE_URL}/Role/${id}`,
    create: `${BASE_URL}/Role`,
    update: (id) => `${BASE_URL}/Role/${id}`,
    delete: (id) => `${BASE_URL}/Role/${id}`,
    permission: (id) => `${BASE_URL}/Role/${id}/permission`,
  },

  /**
   * Values endpoints (test/demo endpoints)
   */
  values: {
    list: '/api/Values',
    create: '/api/Values',
  },
};

/**
 * Helper function to build URL with query parameters
 * @param {string} baseUrl - Base endpoint URL
 * @param {Object} params - Query parameters object
 * @returns {string} URL with query string
 */
export const buildUrlWithParams = (baseUrl, params = {}) => {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};