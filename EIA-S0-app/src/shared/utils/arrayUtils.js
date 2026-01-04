/**
 * Array Utilities Module
 * Helper functions for array manipulation
 * @module arrayUtils
 */

/**
 * Remove duplicates from array
 * @param {Array} arr - Input array
 * @returns {Array} Array without duplicates
 * 
 * @example
 * unique([1, 2, 2, 3, 3, 3]) // Returns: [1, 2, 3]
 * unique(['a', 'b', 'a']) // Returns: ['a', 'b']
 */
export const unique = (arr) => {
  return [...new Set(arr)];
};

/**
 * Group array of objects by key
 * @param {Array<Object>} arr - Array of objects to group
 * @param {string} key - Property name to group by
 * @returns {Object} Grouped object with keys as group names
 * 
 * @example
 * groupBy([{type: 'A', val: 1}, {type: 'A', val: 2}, {type: 'B', val: 3}], 'type')
 * // Returns: { A: [{type: 'A', val: 1}, {type: 'A', val: 2}], B: [{type: 'B', val: 3}] }
 */
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

/**
 * Sort array of objects by property
 * @param {Array<Object>} arr - Array to sort
 * @param {string} key - Property name to sort by
 * @param {string} [order='asc'] - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array (new array, does not mutate original)
 * 
 * @example
 * sortBy([{name: 'Bob'}, {name: 'Alice'}], 'name')
 * // Returns: [{name: 'Alice'}, {name: 'Bob'}]
 * sortBy([{age: 30}, {age: 20}], 'age', 'desc')
 * // Returns: [{age: 30}, {age: 20}]
 */
export const sortBy = (arr, key, order = 'asc') => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Input array
 * @param {number} size - Chunk size
 * @returns {Array<Array>} Array of chunks
 * 
 * @example
 * chunk([1, 2, 3, 4, 5], 2)
 * // Returns: [[1, 2], [3, 4], [5]]
 */
export const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Move item in array from one index to another
 * @param {Array} arr - Input array
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Destination index
 * @returns {Array} New array with item moved (does not mutate original)
 * 
 * @example
 * moveItem(['a', 'b', 'c', 'd'], 0, 2)
 * // Returns: ['b', 'c', 'a', 'd']
 */
export const moveItem = (arr, fromIndex, toIndex) => {
  const newArr = [...arr];
  const [removed] = newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, removed);
  return newArr;
};

/**
 * Find item in array by property value
 * @param {Array<Object>} arr - Array to search
 * @param {string} key - Property name
 * @param {any} value - Value to match
 * @returns {Object|null} Found item or null
 * 
 * @example
 * findByProperty([{id: 1, name: 'A'}, {id: 2, name: 'B'}], 'id', 2)
 * // Returns: {id: 2, name: 'B'}
 */
export const findByProperty = (arr, key, value) => {
  return arr.find(item => item[key] === value) || null;
};

/**
 * Remove item from array by property value
 * @param {Array<Object>} arr - Array to filter
 * @param {string} key - Property name
 * @param {any} value - Value to match for removal
 * @returns {Array} New array without matching items
 * 
 * @example
 * removeByProperty([{id: 1}, {id: 2}, {id: 3}], 'id', 2)
 * // Returns: [{id: 1}, {id: 3}]
 */
export const removeByProperty = (arr, key, value) => {
  return arr.filter(item => item[key] !== value);
};