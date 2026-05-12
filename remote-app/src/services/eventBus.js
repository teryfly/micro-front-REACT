/**
 * Event bus for remote-app.
 *
 * In embedded mode the host injects its global EventBus via the `eventBus` prop
 * on EmbeddedApp. This module provides a lightweight standalone fallback with the
 * same interface so components work identically in both modes.
 *
 * Usage inside sub-app components:
 *   import { getEventBus } from '../services/eventBus';
 *   const bus = getEventBus(props.eventBus);
 *   bus.emit('my:event', payload);
 */

class LocalEventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.events.has(event)) return;
    const next = this.events.get(event).filter((h) => h !== handler);
    if (next.length === 0) this.events.delete(event);
    else this.events.set(event, next);
  }

  emit(event, data) {
    (this.events.get(event) || []).forEach((h) => {
      try { h(data); } catch (e) { console.error(`[EventBus] Handler error for "${event}":`, e); }
    });
  }

  once(event, handler) {
    const wrapped = (data) => { handler(data); this.off(event, wrapped); };
    this.on(event, wrapped);
  }
}

const localBus = new LocalEventBus();

/**
 * Returns the injected host event bus if available, otherwise the local fallback.
 * Checks window.__MICRO_APP_EVENT_BUS__ (set by host-app's EventBus singleton).
 */
export function getEventBus(injected) {
  return injected || window.__MICRO_APP_EVENT_BUS__ || localBus;
}

export default localBus;
