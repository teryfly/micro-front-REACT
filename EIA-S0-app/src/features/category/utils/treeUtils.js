/**
 * Tree Manipulation Utilities
 * Helper functions for tree structure management
 * @module treeUtils
 */

/**
 * Build tree structure from flat list
 * @param {Array<DocumentCategory>} categories - Flat category list
 * @returns {Array<DocumentCategory>} Tree structure
 */
export const buildTree = (categories) => {
  const map = {};
  const roots = [];
  
  // Create map for O(1) access
  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });
  
  // Build tree relationships
  categories.forEach(cat => {
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });
  
  return roots;
};

/**
 * Flatten tree structure to list
 * @param {Array<DocumentCategory>} tree - Tree structure
 * @returns {Array<DocumentCategory>} Flat list
 */
export const flattenTree = (tree) => {
  const result = [];
  
  const traverse = (nodes) => {
    nodes.forEach(node => {
      // Destructure to remove children from flat object
      const { children, ...nodeData } = node;
      result.push(nodeData);
      
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  };
  
  traverse(tree);
  return result;
};

/**
 * Get all descendant IDs for a given category
 * Used for circular reference validation
 * @param {DocumentCategory} category - Category node
 * @returns {Array<string>} List of descendant IDs
 */
export const getDescendantIds = (category) => {
  const ids = [];
  
  const traverse = (node) => {
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        ids.push(child.id);
        traverse(child);
      });
    }
  };
  
  traverse(category);
  return ids;
};

/**
 * Calculate maximum tree depth
 * @param {DocumentCategory} category - Category node
 * @returns {number} Depth level
 */
export const getTreeDepth = (category) => {
  if (!category.children || category.children.length === 0) {
    return 1;
  }
  
  const childDepths = category.children.map(child => getTreeDepth(child));
  return 1 + Math.max(...childDepths);
};

/**
 * Find category by ID in tree structure
 * @param {Array<DocumentCategory>} tree - Tree structure
 * @param {string} id - Category ID to find
 * @returns {DocumentCategory | null} Found category or null
 */
export const findCategoryById = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findCategoryById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get category path (breadcrumb) from root to node
 * @param {Array<DocumentCategory>} tree - Tree structure
 * @param {string} id - Target category ID
 * @returns {Array<DocumentCategory>} Path array
 */
export const getCategoryPath = (tree, id) => {
  const path = [];
  
  const traverse = (nodes, currentPath) => {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      
      if (node.id === id) {
        path.push(...newPath);
        return true;
      }
      
      if (node.children && node.children.length > 0) {
        if (traverse(node.children, newPath)) {
          return true;
        }
      }
    }
    return false;
  };
  
  traverse(tree, []);
  return path;
};