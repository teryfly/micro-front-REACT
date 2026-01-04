/**
 * Permission Constants
 * Hardcoded permission list for RBAC
 * @module constants/permissions
 */

export const PERMISSIONS = Object.freeze([
  { id: 'doctype.view', name: 'View DocType', category: 'DocType', description: 'View document type definitions' },
  { id: 'doctype.create', name: 'Create DocType', category: 'DocType', description: 'Create new document types' },
  { id: 'doctype.edit', name: 'Edit DocType', category: 'DocType', description: 'Modify existing document types' },
  { id: 'doctype.delete', name: 'Delete DocType', category: 'DocType', description: 'Delete or disable document types' },
  
  { id: 'phase.view', name: 'View Phase', category: 'Phase', description: 'View phase definitions' },
  { id: 'phase.create', name: 'Create Phase', category: 'Phase', description: 'Create new phases' },
  { id: 'phase.edit', name: 'Edit Phase', category: 'Phase', description: 'Modify existing phases' },
  { id: 'phase.delete', name: 'Delete Phase', category: 'Phase', description: 'Delete phases (if allowed)' },
  
  { id: 'aiservice.view', name: 'View AI Service', category: 'AI Service', description: 'View AI service configurations' },
  { id: 'aiservice.edit', name: 'Edit AI Service', category: 'AI Service', description: 'Modify AI service configurations' },
  
  { id: 'prompttemplate.view', name: 'View Prompt Template', category: 'Prompt Template', description: 'View prompt templates' },
  { id: 'prompttemplate.create', name: 'Create Prompt Template', category: 'Prompt Template', description: 'Create new prompt templates' },
  { id: 'prompttemplate.edit', name: 'Edit Prompt Template', category: 'Prompt Template', description: 'Modify prompt templates' },
  
  { id: 'category.view', name: 'View Category', category: 'Category', description: 'View document categories' },
  { id: 'category.manage', name: 'Manage Category', category: 'Category', description: 'Create, edit, delete categories' },
  
  { id: 'systemparam.view', name: 'View System Parameters', category: 'System', description: 'View system parameters' },
  { id: 'systemparam.edit', name: 'Edit System Parameters', category: 'System', description: 'Modify system parameters' },
  
  { id: 'role.view', name: 'View Roles', category: 'Role', description: 'View role definitions' },
  { id: 'role.manage', name: 'Manage Roles', category: 'Role', description: 'Create, edit, delete roles' },
  { id: 'permission.manage', name: 'Manage Permissions', category: 'Role', description: 'Assign permissions to roles' },
]);

export const getPermissionsByCategory = (category) => 
  PERMISSIONS.filter(p => p.category === category);

export const getPermissionCategories = () => 
  [...new Set(PERMISSIONS.map(p => p.category))];

export const getPermissionById = (id) => 
  PERMISSIONS.find(p => p.id === id) || null;

export const getAllPermissionIds = () => 
  PERMISSIONS.map(p => p.id);