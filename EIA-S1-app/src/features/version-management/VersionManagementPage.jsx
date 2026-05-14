import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../app/providers/ThemeContext';

/**
 * WF-L2-4 版本管理页 — Post-MVP 占位。
 * 回滚 API (PUT /api/templates/:id/rollback) 尚未在后端实现。
 */
export default function VersionManagementPage() {
  const { templateId } = useParams();
  const navigate       = useNavigate();
  const { primaryColor } = useTheme();

  const btnBase = { padding: '6px 16px', borderRadius: 4, fontSize: 13, cursor: 'pointer', border: '1px solid #d9d9d9', background: '#fff', color: '#595959' };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(`/templates/${templateId}/editor`)} style={btnBase}>← 返回编辑器</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>版本管理</h2>
      </div>

      <div style={{
        maxWidth: 560, margin: '0 auto', textAlign: 'center',
        padding: 48, border: '1px dashed #d9d9d9', borderRadius: 12,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📌</div>
        <h3 style={{ marginBottom: 8, color: '#1a1a1a' }}>版本管理（Post-MVP）</h3>
        <p style={{ color: '#8c8c8c', lineHeight: 1.7, marginBottom: 20 }}>
          版本快照查看、对比与回滚功能正在规划中，将在后续迭代中实现。
          <br />
          当前 MVP 阶段每次发布会覆盖单条 ValidationReport 记录。
        </p>
        <button
          onClick={() => navigate(`/templates/${templateId}/editor`)}
          style={{ padding: '7px 20px', borderRadius: 4, border: 'none', background: primaryColor, color: '#fff', fontSize: 13, cursor: 'pointer' }}
        >
          返回模板编辑器
        </button>
      </div>
    </div>
  );
}
