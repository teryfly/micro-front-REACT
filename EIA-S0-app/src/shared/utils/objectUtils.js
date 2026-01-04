/**
 * Object Utilities Module
 * Helper functions for object manipulation
 * @module objectUtils
 */

/**
 * Deep clone object using JSON serialization
 * Note: Does not clone functions, undefined, or symbols
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 * 
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(original);
 * cloned.b.c = 3;
 * console.log(original.b.c); // Still 2
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty (has no own properties)
 * @param {Object} obj - Object to check
 * @returns {boolean} True if object is empty
 * 
 * @example
 * isEmpty({}) // Returns: true
 * isEmpty({ a: 1 }) // Returns: false
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Pick specific properties from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to pick
 * @returns {Object} New object with only picked properties
 * 
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
 * // Returns: { a: 1, c: 3 }
 */
export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

/**
 * Omit specific properties from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to omit
 * @returns {Object} New object without omitted properties
 * 
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ['b'])
 * // Returns: { a: 1, c: 3 }
 */
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object (new object, does not mutate inputs)
 * 
 * @example
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
 * // Returns: { a: 1, b: { c: 2, d: 3 } }
 */
export const deepMerge = (target, source) => {
  const result = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  });
  
  return result;
};

/**
 * Get nested property value safely
 * @param {Object} obj - Object to access
 * @param {string} path - Dot-separated path (e.g., 'user.profile.name')
 * @param {any} [defaultValue=undefined] - Default value if path not found
 * @returns {any} Property value or default value
 * 
 * @example
 * get({ a: { b: { c: 123 } } }, 'a.b.c') // Returns: 123
 * get({ a: { b: {} } }, 'a.b.c', 'default') // Returns: 'default'
 */
export const get = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result;
};