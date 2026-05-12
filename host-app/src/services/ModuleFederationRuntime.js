// Runtime dynamic loader for Module Federation remotes.
// Injects <script> tags on demand instead of relying on build-time remote declarations.

const loadedScripts = new Set();

/**
 * Dynamically load a module from a remote entry.
 *
 * @param {object} options
 * @param {string} options.entryUrl      - URL to remoteEntry.js
 * @param {string} options.containerName - Webpack container name (must match remote's `name`)
 * @param {string} options.modulePath    - Exposed path, e.g. './EmbeddedApp'
 * @returns {Promise<any>} the module's default export factory result
 */
export async function loadRemoteModule({ entryUrl, containerName, modulePath }) {
  if (!loadedScripts.has(entryUrl)) {
    await injectScript(entryUrl);
    loadedScripts.add(entryUrl);
    // eslint-disable-next-line no-undef
    await __webpack_init_sharing__('default');
  }

  const container = window[containerName];
  if (!container) {
    throw new Error(
      `Container "${containerName}" not found after loading ${entryUrl}. ` +
        `Make sure the remote app's webpack name matches containerName.`
    );
  }

  // eslint-disable-next-line no-undef
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(modulePath);
  return factory();
}

function injectScript(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load remote entry: ${url}`));
    document.head.appendChild(script);
  });
}

/** Remove a cached entry so the next load re-fetches the script. */
export function invalidateRemote(entryUrl) {
  loadedScripts.delete(entryUrl);
}
