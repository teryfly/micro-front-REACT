/**
 * 404页面组件
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 60px)',
      marginTop: '60px'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
      <p style={{ fontSize: '18px', margin: '16px 0' }}>页面未找到</p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '10px 24px',
          fontSize: '14px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: '#1890ff',
          color: '#ffffff'
        }}
      >
        返回首页
      </button>
    </div>
  );
}