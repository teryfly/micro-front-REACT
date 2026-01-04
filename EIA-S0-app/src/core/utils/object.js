/**
 * Object Utilities
 * Helper functions for object manipulation
 * @module utils/object
 */

export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const isEmpty = (obj) => Object.keys(obj).length === 0;

export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

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