// ── Template status ───────────────────────────────────────────
export const TEMPLATE_STATUS = {
  DRAFT:             'Draft',
  PUBLISHED:         'Published',
  ARCHIVED:          'Archived',
  VALIDATION_FAILED: 'ValidationFailed',
};

export const TEMPLATE_STATUS_LABEL = {
  Draft:             '草稿',
  Published:         '已发布',
  Archived:          '已归档',
  ValidationFailed:  '验证失败',
};

export const TEMPLATE_STATUS_COLOR = {
  Draft:             '#8c8c8c',
  Published:         '#52c41a',
  Archived:          '#8c8c8c',
  ValidationFailed:  '#ff4d4f',
};

// ── Template category ─────────────────────────────────────────
export const TEMPLATE_CATEGORY = {
  STANDARD: 'Standard',
  CUSTOM:   'Custom',
};

export const TEMPLATE_CATEGORY_LABEL = {
  Standard: '系统内置',
  Custom:   '自定义',
};

// ── Workflow codes ────────────────────────────────────────────
export const WORKFLOW_CODES = [
  { code: 'business_modeling',  label: '业务建模',        defaultPhaseCodes: ['Inception', 'Elaboration'] },
  { code: 'requirements',       label: '需求',             defaultPhaseCodes: ['Inception', 'Elaboration'] },
  { code: 'analysis_design',    label: '分析与设计',       defaultPhaseCodes: ['Elaboration', 'Construction'] },
  { code: 'implementation',     label: '实现',             defaultPhaseCodes: ['Construction'] },
  { code: 'test',               label: '测试',             defaultPhaseCodes: ['Construction', 'Transition'] },
  { code: 'deployment',         label: '部署',             defaultPhaseCodes: ['Transition'] },
  { code: 'config_change_mgmt', label: '配置与变更管理',   defaultPhaseCodes: ['Inception', 'Elaboration', 'Construction', 'Transition'] },
  { code: 'project_management', label: '项目管理',         defaultPhaseCodes: ['Inception', 'Elaboration', 'Construction', 'Transition'] },
  { code: 'environment',        label: '环境',             defaultPhaseCodes: ['Inception', 'Elaboration', 'Construction', 'Transition'] },
];

// ── Phase codes ───────────────────────────────────────────────
export const PHASE_CODES = [
  { code: 'Inception',    label: '初始阶段', order: 1 },
  { code: 'Elaboration',  label: '细化阶段', order: 2 },
  { code: 'Construction', label: '构建阶段', order: 3 },
  { code: 'Transition',   label: '移交阶段', order: 4 },
];

export const PHASE_CODE_LABEL = Object.fromEntries(
  PHASE_CODES.map(({ code, label }) => [code, label])
);

// ── Edge type ─────────────────────────────────────────────────
export const EDGE_TYPE = {
  REQUIRED: 'Required',
  OPTIONAL: 'Optional',
};

// ── Completion condition ──────────────────────────────────────
export const COMPLETION_CONDITION_TYPE = {
  MANUAL_CONFIRM: 'ManualConfirm',
  MIN_DOCUMENTS:  'MinDocuments',
  CHECKLIST:      'Checklist',
};

// ── Validation issue severity ─────────────────────────────────
export const ISSUE_SEVERITY = {
  ERROR:   'Error',
  WARNING: 'Warning',
  INFO:    'Info',
};

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
