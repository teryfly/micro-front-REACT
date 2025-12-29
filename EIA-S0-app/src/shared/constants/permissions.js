/**
 * Permission Constants Module
 * Hardcoded permission list for role-permission matrix
 * Since there is no /api/governance/permission endpoint,
 * permissions are defined here as constants.
 * @module permissions
 */

/**
 * Complete permission list for RBAC
 * Each permission has: id, name, category, description
 */
export const PERMISSIONS = Object.freeze([
  // DocType permissions
  {
    id: 'doctype.view',
    name: 'View DocType',
    category: 'DocType',
    description: 'View document type definitions',
  },
  {
    id: 'doctype.create',
    name: 'Create DocType',
    category: 'DocType',
    description: 'Create new document types',
  },
  {
    id: 'doctype.edit',
    name: 'Edit DocType',
    category: 'DocType',
    description: 'Modify existing document types',
  },
  {
    id: 'doctype.delete',
    name: 'Delete DocType',
    category: 'DocType',
    description: 'Delete or disable document types',
  },

  // Phase permissions
  {
    id: 'phase.view',
    name: 'View Phase',
    category: 'Phase',
    description: 'View phase definitions',
  },
  {
    id: 'phase.create',
    name: 'Create Phase',
    category: 'Phase',
    description: 'Create new phases',
  },
  {
    id: 'phase.edit',
    name: 'Edit Phase',
    category: 'Phase',
    description: 'Modify existing phases',
  },
  {
    id: 'phase.delete',
    name: 'Delete Phase',
    category: 'Phase',
    description: 'Delete phases (if allowed)',
  },

  // AI Service permissions
  {
    id: 'aiservice.view',
    name: 'View AI Service',
    category: 'AI Service',
    description: 'View AI service configurations',
  },
  {
    id: 'aiservice.edit',
    name: 'Edit AI Service',
    category: 'AI Service',
    description: 'Modify AI service configurations',
  },

  // Prompt Template permissions
  {
    id: 'prompttemplate.view',
    name: 'View Prompt Template',
    category: 'Prompt Template',
    description: 'View prompt templates',
  },
  {
    id: 'prompttemplate.create',
    name: 'Create Prompt Template',
    category: 'Prompt Template',
    description: 'Create new prompt templates',
  },
  {
    id: 'prompttemplate.edit',
    name: 'Edit Prompt Template',
    category: 'Prompt Template',
    description: 'Modify prompt templates',
  },

  // Category permissions
  {
    id: 'category.view',
    name: 'View Category',
    category: 'Category',
    description: 'View document categories',
  },
  {
    id: 'category.manage',
    name: 'Manage Category',
    category: 'Category',
    description: 'Create, edit, delete categories',
  },

  // System Parameter permissions
  {
    id: 'systemparam.view',
    name: 'View System Parameters',
    category: 'System',
    description: 'View system parameters',
  },
  {
    id: 'systemparam.edit',
    name: 'Edit System Parameters',
    category: 'System',
    description: 'Modify system parameters',
  },

  // Role Permission permissions
  {
    id: 'role.view',
    name: 'View Roles',
    category: 'Role',
    description: 'View role definitions',
  },
  {
    id: 'role.manage',
    name: 'Manage Roles',
    category: 'Role',
    description: 'Create, edit, delete roles',
  },
  {
    id: 'permission.manage',
    name: 'Manage Permissions',
    category: 'Role',
    description: 'Assign permissions to roles',
  },
]);

/**
 * Get permissions filtered by category
 * @param {string} category - Permission category
 * @returns {Array<Object>} Filtered permissions
 * 
 * @example
 * getPermissionsByCategory('DocType')
 * // Returns: [{id: 'doctype.view', ...}, {id: 'doctype.create', ...}, ...]
 */
export const getPermissionsByCategory = (category) => {
  return PERMISSIONS.filter(p => p.category === category);
};

/**
 * Get all unique permission categories
 * @returns {Array<string>} List of unique categories
 * 
 * @example
 * getPermissionCategories()
 * // Returns: ['DocType', 'Phase', 'AI Service', 'Prompt Template', 'Category', 'System', 'Role']
 */
export const getPermissionCategories = () => {
  return [...new Set(PERMISSIONS.map(p => p.category))];
};

/**
 * Get permission by ID
 * @param {string} id - Permission ID
 * @returns {Object|null} Permission object or null if not found
 * 
 * @example
 * getPermissionById('doctype.view')
 * // Returns: {id: 'doctype.view', name: 'View DocType', ...}
 */
export const getPermissionById = (id) => {
  return PERMISSIONS.find(p => p.id === id) || null;
};

/**
 * Get all permission IDs
 * @returns {Array<string>} List of all permission IDs
 * 
 * @example
 * getAllPermissionIds()
 * // Returns: ['doctype.view', 'doctype.create', 'doctype.edit', ...]
 */
export const getAllPermissionIds = () => {
  return PERMISSIONS.map(p => p.id);
};