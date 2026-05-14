import { lazy } from 'react';

/**
 * S1 route configuration
 *
 * Pages:
 *   WF-L2-1  /templates               模板列表页
 *   WF-L2-2  /templates/:id/editor    模板编辑器
 *   WF-L2-3  /templates/:id/validate  模板验证结果页
 *   WF-L2-4  /templates/:id/versions  模板版本管理页（Post-MVP 占位）
 */
export const routes = [
  {
    path: '/',
    redirect: '/templates',
  },
  {
    path: '/templates',
    element: lazy(() => import('../../features/template-list/TemplateListPage')),
    label: '模板列表',
    icon: '📋',
  },
  {
    path: '/templates/new',
    element: lazy(() => import('../../features/template-editor/TemplateEditorPage')),
    label: '新建模板',
    icon: '➕',
    hideFromNav: true,
  },
  {
    path: '/templates/:templateId/editor',
    element: lazy(() => import('../../features/template-editor/TemplateEditorPage')),
    label: '模板编辑器',
    icon: '✏️',
    hideFromNav: true,
  },
  {
    path: '/templates/:templateId/validate',
    element: lazy(() => import('../../features/validation-report/ValidationReportPage')),
    label: '验证结果',
    icon: '✅',
    hideFromNav: true,
  },
  {
    path: '/templates/:templateId/versions',
    element: lazy(() => import('../../features/version-management/VersionManagementPage')),
    label: '版本管理',
    icon: '📌',
    hideFromNav: true,
  },
];
