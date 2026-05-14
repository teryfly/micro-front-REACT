import React from 'react';
import EmbeddedApp from './EmbeddedApp';

// Standalone mode: renders the EmbeddedApp with default props
function App() {
  return (
    <div style={{ height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <EmbeddedApp
        embedded={false}
        appName="{{APP_NAME}} (standalone)"
        theme={{ primaryColor: '{{PRIMARY_COLOR}}' }}
      />
    </div>
  );
}

export default App;
