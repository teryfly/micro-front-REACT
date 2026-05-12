/**
 * Development Mode Debug Panel
 * Visual confirmation of mode detection and prop injection
 * Only renders in development mode
 */

import React, { useState } from 'react';
import { useMode } from './providers/ModeContext';
import { useAuth } from '../shared/hooks/useAuth';

// FIX: Accept receivedProps as a prop
const DebugPanel = ({ receivedProps = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, embedded, eventBus } = useMode();
  const { token, userInfo } = useAuth();

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={togglePanel}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: embedded ? '#52c41a' : '#1890ff',
          color: 'white',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9998,
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Toggle Debug Panel"
      >
        🐛
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '400px',
            maxHeight: '600px',
            backgroundColor: '#ffffff',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            zIndex: 9999,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e8e8e8',
              backgroundColor: embedded ? '#f6ffed' : '#e6f7ff',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>🐛 Debug Panel</span>
            <button
              onClick={togglePanel}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '16px' }}>
            {/* Mode Status */}
            <Section title="🎯 Running Mode">
              <Row label="Mode" value={mode} highlight={embedded ? 'green' : 'blue'} />
              <Row label="Embedded" value={String(embedded)} highlight={embedded ? 'green' : 'red'} />
            </Section>

            {/* EventBus Status */}
            <Section title="📡 Communication">
              <Row label="EventBus" value={eventBus ? '✅ Connected' : '❌ Not Available'} />
              {eventBus && (
                <Row label="EventBus Type" value={typeof eventBus} />
              )}
            </Section>

            {/* Auth Status */}
            <Section title="🔐 Authentication">
              <Row label="Token" value={token ? `${token.substring(0, 20)}...` : 'None'} />
              <Row label="UserInfo" value={userInfo ? '✅ Present' : 'None'} />
            </Section>

            {/* Router Status */}
            <Section title="🔀 Router">
              <Row label="Current Path" value={window.location.pathname} />
              <Row label="Search" value={window.location.search || 'None'} />
            </Section>

            {/* Props Summary */}
            <Section title="📦 Received Props">
              <div style={{ fontSize: '11px', color: '#666' }}>
                {/* FIX: Use receivedProps instead of props */}
                {Object.keys(receivedProps).join(', ') || 'No props received'}
              </div>
            </Section>
          </div>
        </div>
      )}
    </>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
      {title}
    </div>
    <div style={{ paddingLeft: '12px' }}>
      {children}
    </div>
  </div>
);

const Row = ({ label, value, highlight }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between',
    marginBottom: '4px',
    padding: '4px 8px',
    backgroundColor: highlight ? `${highlight === 'green' ? '#f6ffed' : highlight === 'blue' ? '#e6f7ff' : '#fff2f0'}` : 'transparent',
    borderRadius: '4px',
  }}>
    <span style={{ color: '#666' }}>{label}:</span>
    <span style={{ 
      color: highlight === 'green' ? '#52c41a' : highlight === 'red' ? '#ff4d4f' : '#333',
      fontWeight: highlight ? 'bold' : 'normal',
    }}>
      {value}
    </span>
  </div>
);

export default DebugPanel;