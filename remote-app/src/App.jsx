import React from 'react';
import Button from './Button';

function App({ embedded = false }) {
  return (
    <div style={{ fontFamily: 'Arial' }}>
      {/* Only show header in standalone mode */}
      {!embedded && (
        <div style={{
          padding: '20px',
          backgroundColor: '#1890ff',
          color: '#ffffff',
          marginBottom: '20px',
        }}>
          <h1 style={{ margin: 0 }}>📡 Remote App (远程应用-B)</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            运行在 localhost:7001 的独立应用
          </p>
        </div>
      )}
      
      <div style={{ padding: embedded ? '0' : '20px' }}>
        <h2>B - 示例远程子应用1</h2>
        <p>这是运行在 localhost:7001 的独立应用B</p>
        <Button />
        
        {embedded && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#e6f7ff',
            borderRadius: '4px',
            fontSize: '14px',
          }}>
            ℹ️ 当前以<strong>嵌入模式</strong>运行在主应用中
          </div>
        )}
      </div>
    </div>
  );
}

export default App;