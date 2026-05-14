import React from 'react';
import EmbeddedApp from './app/EmbeddedApp';

function App() {
  return (
    <div style={{ height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <EmbeddedApp
        embedded={false}
        appName="EIA S1 — 模板管理中心（独立模式）"
        apiBaseUrl={process.env.REACT_APP_API_BASE_URL}
      />
    </div>
  );
}

export default App;
