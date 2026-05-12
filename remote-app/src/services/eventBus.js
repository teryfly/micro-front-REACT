// Lightweight event bus for cross-app communication.
// Host passes its own eventBus instance via props; this fallback is used in standalone mode.
const listeners = {};

const eventBus = {
  on(event, handler) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(handler);
    return () => this.off(event, handler);
  },

  off(event, handler) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter((h) => h !== handler);
  },

  emit(event, payload) {
    if (!listeners[event]) return;
    listeners[event].forEach((h) => h(payload));
  },
};

export default eventBus;
