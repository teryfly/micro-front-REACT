/**
 * API Endpoint Definitions
 * All endpoints use exact casing from Swagger specification
 * @module api/endpoints
 */

const BASE_URL = '/api/governance';

export const endpoints = {
  doctype: {
    list: `${BASE_URL}/DocType`,
    detail: (id) => `${BASE_URL}/DocType/${id}`,
    create: `${BASE_URL}/DocType`,
    update: (id) => `${BASE_URL}/DocType/${id}`,
    delete: (id) => `${BASE_URL}/DocType/${id}`,
  },

  phase: {
    list: `${BASE_URL}/Phase`,
    detail: (id) => `${BASE_URL}/Phase/${id}`,
    create: `${BASE_URL}/Phase`,
    update: (id) => `${BASE_URL}/Phase/${id}`,
    delete: (id) => `${BASE_URL}/Phase/${id}`,
  },

  aiService: {
    list: `${BASE_URL}/AIService`,
    detail: (id) => `${BASE_URL}/AIService/${id}`,
    create: `${BASE_URL}/AIService`,
    update: (id) => `${BASE_URL}/AIService/${id}`,
    delete: (id) => `${BASE_URL}/AIService/${id}`,
  },

  promptTemplate: {
    list: `${BASE_URL}/PromptTemplate`,
    detail: (id) => `${BASE_URL}/PromptTemplate/${id}`,
    create: `${BASE_URL}/PromptTemplate`,
    update: (id) => `${BASE_URL}/PromptTemplate/${id}`,
    delete: (id) => `${BASE_URL}/PromptTemplate/${id}`,
    versions: (id) => `${BASE_URL}/PromptTemplate/${id}/versions`,
  },

  category: {
    tree: `${BASE_URL}/Category/tree`,
    detail: (id) => `${BASE_URL}/Category/${id}`,
    create: `${BASE_URL}/Category`,
    update: (id) => `${BASE_URL}/Category/${id}`,
    delete: (id) => `${BASE_URL}/Category/${id}`,
  },

  systemParam: {
    list: `${BASE_URL}/SystemParameter`,
    detail: (key) => `${BASE_URL}/SystemParameter/${key}`,
    update: (key) => `${BASE_URL}/SystemParameter/${key}`,
  },

  role: {
    list: `${BASE_URL}/Role`,
    detail: (id) => `${BASE_URL}/Role/${id}`,
    create: `${BASE_URL}/Role`,
    update: (id) => `${BASE_URL}/Role/${id}`,
    delete: (id) => `${BASE_URL}/Role/${id}`,
    permission: (id) => `${BASE_URL}/Role/${id}/permission`,
  },
};

export const buildUrlWithParams = (baseUrl, params = {}) => {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};