/**
 * Menu Tree Editor Component
 * Drag-drop tree editor for menu configuration
 * @module MenuTreeEditor
 */

import React, { useState, useMemo } from 'react';
import MenuItemForm from './MenuItemForm';
import { MENU_ITEM_TYPES } from '../../types/menuConfig.types';
import styles from './MenuTreeEditor.module.css';

export default function MenuTreeEditor({ menuConfig, onChange, onQuickAdd }) {
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [parentIdForNew, setParentIdForNew] = useState(null);

  // Build tree structure from flat items
  const treeData = useMemo(() => {
    return buildTree(menuConfig.items);
  }, [menuConfig.items]);

  const handleAddRoot = () => {
    setEditingItem(null);
    setParentIdForNew(null);
    setShowForm(true);
  };

  const handleAddChild = (parentId) => {
    setEditingItem(null);
    setParentIdForNew(parentId);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setParentIdForNew(null);
    setShowForm(true);
  };

  const handleDelete = (itemId) => {
    if (!window.confirm('确定要删除此菜单项吗？子菜单也会一并删除。')) {
      return;
    }

    const descendantIds = getDescendantIds(menuConfig.items, itemId);
    const idsToDelete = new Set([itemId, ...descendantIds]);

    const newItems = menuConfig.items.filter(item => !idsToDelete.has(item.id));

    onChange({
      ...menuConfig,
      items: newItems,
      // Reset default app if it was deleted
      defaultAppId: idsToDelete.has(menuConfig.defaultAppId) 
        ? (newItems.find(item => item.type === 'subapp')?.id || '')
        : menuConfig.defaultAppId,
    });
  };

  const handleSetDefault = (itemId) => {
    const item = menuConfig.items.find(i => i.id === itemId);
    if (item?.type !== 'subapp') {
      alert('只有子应用类型可以设置为默认');
      return;
    }

    onChange({
      ...menuConfig,
      defaultAppId: itemId,
    });
  };

  const handleFormSubmit = (formData) => {
    let newItems;

    if (editingItem) {
      // Update existing item
      newItems = menuConfig.items.map(item =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      );
    } else {
      // Add new item
      const newItem = {
        ...formData,
        id: generateId(),
        parentId: parentIdForNew,
        order: getNextOrder(menuConfig.items, parentIdForNew),
      };
      newItems = [...menuConfig.items, newItem];
    }

    onChange({
      ...menuConfig,
      items: newItems,
    });

    setShowForm(false);
    setEditingItem(null);
    setParentIdForNew(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setParentIdForNew(null);
  };

  const handleReorder = (draggedId, targetId, position) => {
    const newItems = reorderItems(menuConfig.items, draggedId, targetId, position);
    onChange({
      ...menuConfig,
      items: newItems,
    });
  };

  if (showForm) {
    return (
      <MenuItemForm
        item={editingItem}
        parentId={parentIdForNew}
        allItems={menuConfig.items}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className={styles.treeEditor}>
      <div className={styles.toolbar}>
        <button onClick={handleAddRoot} className={styles.addButton}>
          + 添加菜单项
        </button>
        
        <div className={styles.toolbarInfo}>
          共 {menuConfig.items.length} 个菜单项
        </div>
      </div>

      <div className={styles.treeContainer}>
        {treeData.length === 0 ? (
          <div className={styles.empty}>
            <p>暂无菜单项</p>
            <p>点击"添加菜单项"开始配置</p>
          </div>
        ) : (
          treeData.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              level={0}
              defaultAppId={menuConfig.defaultAppId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
              onSetDefault={handleSetDefault}
              onReorder={handleReorder}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Recursive Tree Node Component
 */
function TreeNode({ 
  node, 
  level, 
  defaultAppId,
  onEdit, 
  onDelete, 
  onAddChild, 
  onSetDefault,
  onReorder 
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  const isDefault = node.id === defaultAppId;
  const canBeDefault = node.type === 'subapp';

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === node.id) return;

    onReorder(draggedId, node.id, 'before');
  };

  const getTypeLabel = () => {
    switch (node.type) {
      case 'subapp': return '子应用';
      case 'external': return '外部链接';
      case 'category': return '分类';
      default: return node.type;
    }
  };

  const getTypeColor = () => {
    switch (node.type) {
      case 'subapp': return '#1890ff';
      case 'external': return '#52c41a';
      case 'category': return '#faad14';
      default: return '#666666';
    }
  };

  return (
    <div 
      className={styles.treeNode}
      style={{ 
        marginLeft: `${level * 24}px`,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div
        className={styles.nodeContent}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className={styles.nodeLeft}>
          <span className={styles.dragHandle}>☰</span>
          
          {hasChildren && (
            <button
              className={styles.expandButton}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          {!hasChildren && <span className={styles.spacer}></span>}
          
          {node.icon && <span className={styles.icon}>{node.icon}</span>}
          
          <span className={styles.label}>{node.label}</span>
          
          <span 
            className={styles.typeBadge}
            style={{ backgroundColor: getTypeColor() }}
          >
            {getTypeLabel()}
          </span>

          {isDefault && (
            <span className={styles.defaultBadge}>⭐ 默认</span>
          )}
        </div>

        <div className={styles.nodeActions}>
          {canBeDefault && !isDefault && (
            <button
              className={styles.actionButton}
              onClick={() => onSetDefault(node.id)}
              title="设为默认应用"
            >
              设为默认
            </button>
          )}
          
          {node.type === 'category' && (
            <button
              className={styles.actionButton}
              onClick={() => onAddChild(node.id)}
            >
              添加子项
            </button>
          )}
          
          <button
            className={styles.actionButton}
            onClick={() => onEdit(node)}
          >
            编辑
          </button>
          
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => onDelete(node.id)}
          >
            删除
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className={styles.children}>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              defaultAppId={defaultAppId}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onSetDefault={onSetDefault}
              onReorder={onReorder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper Functions
 */

function buildTree(items) {
  const map = {};
  const roots = [];

  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  items.forEach(item => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  // Sort by order
  const sortByOrder = (arr) => {
    arr.sort((a, b) => a.order - b.order);
    arr.forEach(item => {
      if (item.children.length > 0) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(roots);
  return roots;
}

function getDescendantIds(items, parentId) {
  const descendants = [];
  const children = items.filter(item => item.parentId === parentId);
  
  children.forEach(child => {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(items, child.id));
  });
  
  return descendants;
}

function generateId() {
  return `menu-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getNextOrder(items, parentId) {
  const siblings = items.filter(item => item.parentId === parentId);
  if (siblings.length === 0) return 1;
  
  const maxOrder = Math.max(...siblings.map(item => item.order));
  return maxOrder + 1;
}

function reorderItems(items, draggedId, targetId, position) {
  const draggedItem = items.find(item => item.id === draggedId);
  const targetItem = items.find(item => item.id === targetId);
  
  if (!draggedItem || !targetItem) return items;

  // Remove dragged item
  let newItems = items.filter(item => item.id !== draggedId);

  // Find target index
  const targetIndex = newItems.findIndex(item => item.id === targetId);

  // Insert dragged item
  const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
  newItems.splice(insertIndex, 0, {
    ...draggedItem,
    parentId: targetItem.parentId,
  });

  // Recalculate orders for affected level
  const affectedParentId = targetItem.parentId;
  const siblings = newItems.filter(item => item.parentId === affectedParentId);
  siblings.forEach((item, index) => {
    item.order = index + 1;
  });

  return newItems;
}