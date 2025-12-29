import React from 'react';
import Button from './Button';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>B -📡 Remote App (远程应用-B)</h1>
      <p>这是运行在 localhost:7001 的独立应用B </p>
      <Button />
    </div>
  );
}

export default App;