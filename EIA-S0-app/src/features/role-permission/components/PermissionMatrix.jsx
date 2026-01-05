/**
 * Permission Matrix Component
 * Grid-based permission assignment UI with category grouping
 * @module PermissionMatrix
 */

import React, { useState, useEffect } from 'react';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import { getPermissionsByCategory, getPermissionCategories } from '../../../shared/constants/permissions';

/**
 * Permission matrix component
 * Grid layout: Roles (columns) × Permissions (rows)
 * @param {Object} props
 * @param {Array<Role>} props.roles - Role array
 * @param {Object} props.rolePermissions - Map of roleId → permissions[]
 * @param {Function} props.onSave - Save handler for a single role
 */
const PermissionMatrix = ({ roles, rolePermissions, onSave }) => {
  const [localPermissions, setLocalPermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state from props
  useEffect(() => {
    setLocalPermissions(rolePermissions);
    setHasChanges(false);
  }, [rolePermissions]);

  const categories = getPermissionCategories();

  const togglePermission = (roleId, permissionId) => {
    setLocalPermissions(prev => {
      const rolePerms = prev[roleId] || [];
      const newPerms = rolePerms.includes(permissionId)
        ? rolePerms.filter(p => p !== permissionId)
        : [...rolePerms, permissionId];
      
      return {
        ...prev,
        [roleId]: newPerms,
      };
    });
    setHasChanges(true);
  };

  const selectAllForRole = (roleId) => {
    const allPermissionIds = categories.flatMap(category => 
      getPermissionsByCategory(category).map(p => p.id)
    );
    
    setLocalPermissions(prev => ({
      ...prev,
      [roleId]: allPermissionIds,
    }));
    setHasChanges(true);
  };

  const clearAllForRole = (roleId) => {
    setLocalPermissions(prev => ({
      ...prev,
      [roleId]: [],
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    try {
      // Save all role permissions
      for (const [roleId, permissions] of Object.entries(localPermissions)) {
        await onSave(roleId, permissions);
      }
      setHasChanges(false);
    } catch (err) {
      // Error handled by onSave
    }
  };

  const handleReset = () => {
    setLocalPermissions(rolePermissions);
    setHasChanges(false);
  };

  if (roles.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: 'var(--color-text-muted)' 
      }}>
        No roles available. Create a role first.
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f0f8ff',
        borderRadius: '4px',
        alignItems: 'center'
      }}>
        <div>
          <strong>Permission Matrix</strong>
          {hasChanges && (
            <Badge type="warning" style={{ marginLeft: '8px' }}>
              Unsaved Changes
            </Badge>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant="primary" 
            onClick={handleSaveAll}
            disabled={!hasChanges}
          >
            Save All Changes
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Matrix Table */}
      <div style={{ 
        overflowX: 'auto',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '13px'
        }}>
          {/* Header Row */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left',
                borderBottom: '2px solid var(--color-border)',
                position: 'sticky',
                left: 0,
                backgroundColor: '#f5f5f5',
                minWidth: '280px',
                zIndex: 3
              }}>
                Permission
              </th>
              {roles.map(role => (
                <th 
                  key={role.id}
                  style={{ 
                    padding: '12px', 
                    textAlign: 'center',
                    borderBottom: '2px solid var(--color-border)',
                    minWidth: '120px'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{role.name}</div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '4px', 
                    marginTop: '8px',
                    justifyContent: 'center'
                  }}>
                    <Button 
                      size="small" 
                      onClick={() => selectAllForRole(role.id)}
                    >
                      All
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => clearAllForRole(role.id)}
                    >
                      None
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body - Grouped by Category */}
          <tbody>
            {categories.map(category => {
              const categoryPermissions = getPermissionsByCategory(category);
              
              return (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr>
                    <td 
                      colSpan={roles.length + 1}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e3f2fd',
                        fontWeight: 600,
                        borderTop: '1px solid var(--color-border)',
                        position: 'sticky',
                        left: 0,
                      }}
                    >
                      {category}
                    </td>
                  </tr>

                  {/* Permission Rows */}
                  {categoryPermissions.map((permission, index) => (
                    <tr 
                      key={permission.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                      }}
                    >
                      <td style={{ 
                        padding: '12px',
                        borderBottom: '1px solid var(--color-border)',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                        zIndex: 1
                      }}>
                        <div style={{ fontWeight: 500 }}>{permission.name}</div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: 'var(--color-text-muted)',
                          marginTop: '4px'
                        }}>
                          {permission.description}
                        </div>
                      </td>

                      {/* Checkbox for each role */}
                      {roles.map(role => {
                        const rolePerms = localPermissions[role.id] || [];
                        const isChecked = rolePerms.includes(permission.id);
                        
                        return (
                          <td 
                            key={role.id}
                            style={{ 
                              padding: '12px',
                              textAlign: 'center',
                              borderBottom: '1px solid var(--color-border)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(role.id, permission.id)}
                              style={{ 
                                width: '18px', 
                                height: '18px',
                                cursor: 'pointer',
                                accentColor: 'var(--color-primary)'
                              }}
                              aria-label={`${permission.name} for ${role.name}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionMatrix;