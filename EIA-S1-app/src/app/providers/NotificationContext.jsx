import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let _idSeq = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const add = useCallback(({ type = 'info', message, duration = 3000 }) => {
    const id = ++_idSeq;
    setNotifications((prev) => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((message, opts) => add({ type: 'success', message, ...opts }), [add]);
  const error   = useCallback((message, opts) => add({ type: 'error',   message, ...opts }), [add]);
  const warning = useCallback((message, opts) => add({ type: 'warning', message, ...opts }), [add]);
  const info    = useCallback((message, opts) => add({ type: 'info',    message, ...opts }), [add]);

  const typeColor = { success: '#52c41a', error: '#ff4d4f', warning: '#faad14', info: '#1890ff' };

  return (
    <NotificationContext.Provider value={{ notifications, add, remove, success, error, warning, info }}>
      {children}
      {/* Toast overlay */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => remove(n.id)}
            style={{
              padding: '8px 14px',
              background: '#fff',
              border: `1px solid ${typeColor[n.type] || '#d9d9d9'}`,
              borderLeft: `4px solid ${typeColor[n.type] || '#d9d9d9'}`,
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              fontSize: 13,
              cursor: 'pointer',
              maxWidth: 360,
            }}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
