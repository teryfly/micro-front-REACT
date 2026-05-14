import React from 'react';
import EmbeddedApp from './EmbeddedApp';

// Standalone mode: renders the EmbeddedApp with default props
function App() {
  return (
    <div style={{ height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <EmbeddedApp
        embedded={false}
        appName="EIA-S1-app (standalone)"
        theme={{ primaryColor: '#1890ff' }}
      />
    </div>
  );
}

export default App;
