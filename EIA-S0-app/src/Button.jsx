import React, { useState } from 'react';

function Button() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ 
      backgroundColor: '#f0f0f0', 
      padding: '20px', 
      borderRadius: '8px' 
    }}>
      <h3>🔵 EIA Button Component</h3>
      <p>EIA组件来自 localhost:7002</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        EIA点击次数: {count}
      </button>
    </div>
  );
}

export default Button;