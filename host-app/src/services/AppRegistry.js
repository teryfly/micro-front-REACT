// In-memory cache of already-loaded remote React components.
// Avoids re-loading the same remoteEntry.js across re-renders.

const registry = new Map();

export const AppRegistry = {
  /** Store a loaded component by appId */
  register(appId, component) {
    registry.set(appId, component);
  },

  /** Retrieve a cached component */
  get(appId) {
    return registry.get(appId);
  },

  /** Check if a component is already cached */
  has(appId) {
    return registry.has(appId);
  },

  /** Remove one or all cached entries (triggers re-fetch on next render) */
  invalidate(appId) {
    if (appId) {
      registry.delete(appId);
    } else {
      registry.clear();
    }
  },
};
