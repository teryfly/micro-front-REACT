import { lazy } from 'react';

/**
 * Application route configuration
 * All feature routes are lazy-loaded for code splitting
 * Each route maps to a feature manager component
 * 
 * Route Structure:
 * - path: URL path for the route
 * - element: Lazy-loaded React component
 * - label: Display name for navigation menu
 * - icon: Emoji icon for visual identification
 * 
 * @module routeConfig
 */

/**
 * Application routes
 * Note: '/' and '/doctype' both map to DocTypeManager (default route)
 */
export const routes = [
  {
    path: '/',
    element: lazy(() => import('../../features/doctype/DocTypeManager')),
    label: 'Document Types',
    icon: '📄',
  },
  {
    path: '/doctype',
    element: lazy(() => import('../../features/doctype/DocTypeManager')),
    label: 'Document Types',
    icon: '📄',
  },
  {
    path: '/phase',
    element: lazy(() => import('../../features/phase/PhaseManager')),
    label: 'Phases',
    icon: '🔄',
  },
  {
    path: '/ai-service',
    element: lazy(() => import('../../features/ai-service/AIServiceManager')),
    label: 'AI Services',
    icon: '🤖',
  },
  {
    path: '/prompt-template',
    element: lazy(() => import('../../features/prompt-template/PromptTemplateManager')),
    label: 'Prompt Templates',
    icon: '📝',
  },
  {
    path: '/category',
    element: lazy(() => import('../../features/category/CategoryManager')),
    label: 'Categories',
    icon: '📁',
  },
  {
    path: '/system-param',
    element: lazy(() => import('../../features/system-param/SystemParamManager')),
    label: 'System Parameters',
    icon: '⚙️',
  },
  {
    path: '/role-permission',
    element: lazy(() => import('../../features/role-permission/RolePermissionManager')),
    label: 'Roles & Permissions',
    icon: '🔐',
  },
];