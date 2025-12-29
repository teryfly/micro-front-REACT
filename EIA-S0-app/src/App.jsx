import React from 'react';
import Button from './Button';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>A-📡 Remote App (远程应用A)</h1>
      <p>这是运行在 localhost:7002 的独立应用A</p>
      <Button />
    </div>
  );
}

export default App;