/**
 * 测试页面 - 验证路由和渲染
 */

import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

export default function TestPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[TestPage] Mounted with:', {
      params,
      pathname: location.pathname,
      search: location.search,
    });
  }, [params, location]);

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      marginTop: '60px',
    }}>
      <h1>🧪 测试页面</h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2>路由信息</h2>
        <pre>{JSON.stringify({
          params,
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        }, null, 2)}</pre>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <h2>导航测试</h2>
        <button onClick={() => navigate('/')}>
          返回首页
        </button>
        <button onClick={() => navigate('/app/governance')}>
          导航到 Governance
        </button>
        <button onClick={() => navigate('/test')}>
          导航到测试页
        </button>
      </div>
    </div>
  );
}