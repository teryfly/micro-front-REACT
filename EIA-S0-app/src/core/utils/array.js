/**
 * Array Utilities
 * Helper functions for array manipulation
 * @module utils/array
 */

export const unique = (arr) => [...new Set(arr)];

export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const groupKey = item[key];
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});
};

export const sortBy = (arr, key, order = 'asc') => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return order === 'asc' ? comparison : -comparison;
  });
};

export const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const findByProperty = (arr, key, value) => {
  return arr.find(item => item[key] === value) || null;
};

export const removeByProperty = (arr, key, value) => {
  return arr.filter(item => item[key] !== value);
};