import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../core/api/client';
import { endpoints } from '../../core/api/endpoints';
import {
  TEMPLATE_STATUS_LABEL,
  TEMPLATE_STATUS_COLOR,
  TEMPLATE_CATEGORY_LABEL,
  DEFAULT_PAGE_SIZE,
} from '../../core/constants';
import { useNotification } from '../../app/providers/NotificationContext';
import { useTheme } from '../../app/providers/ThemeContext';

/* ── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const color = TEMPLATE_STATUS_COLOR[status] || '#8c8c8c';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 600,
      color: '#fff',
      background: color,
      letterSpacing: '0.03em',
    }}>
      {TEMPLATE_STATUS_LABEL[status] || status}
    </span>
  );
}

/* ── Action button ────────────────────────────────────────────── */
function ActionBtn({ label, onClick, color, disabled, title }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      style={{
        padding: '3px 10px', fontSize: 12, borderRadius: 4,
        border: `1px solid ${disabled ? '#d9d9d9' : color}`,
        color: disabled ? '#bfbfbf' : color,
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

/* ── Template card ────────────────────────────────────────────── */
function TemplateCard({ template, onOpen, onClone, onArchive, onValidate, primaryColor }) {
  const [hover, setHover] = useState(false);
  const isStandard = template.category === 'Standard';
  const canArchive = template.status === 'Published' && !isStandard;
  const canValidate = !!template.hasValidationReport;

  return (
    <div
      style={{
        border: `1px solid ${hover ? primaryColor : '#e8e8e8'}`,
        borderRadius: 8,
        padding: 16,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
        background: '#fff',
        position: 'relative',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(template)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {template.name}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {TEMPLATE_CATEGORY_LABEL[template.category] || template.category}
          </div>
        </div>
        <StatusBadge status={template.status} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#595959', marginBottom: 12 }}>
        <span>工作流 {template.workflowCount ?? 0}</span>
        <span>节点 {template.nodeCount ?? 0}</span>
        {template.estimatedDuration && <span>⏱ {template.estimatedDuration}</span>}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
        <span style={{ fontSize: 11, color: '#bfbfbf' }}>
          更新于 {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString('zh-CN') : '—'}
        </span>

        {/* Action buttons — visible on hover */}
        {hover && (
          <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
            {canValidate && (
              <ActionBtn label="查看验证" onClick={() => onValidate(template)} color={primaryColor} />
            )}
            <ActionBtn label="复制" onClick={() => onClone(template)} color="#1890ff" />
            {canArchive && (
              <ActionBtn label="归档" onClick={() => onArchive(template)} color="#faad14" />
            )}
            {/* US-01 (B-08): 查看版本 — disabled in MVP */}
            <ActionBtn
              label="查看版本"
              disabled
              color="#8c8c8c"
              title="版本对比功能即将推出"
            />
          </div>
        )}
      </div>

      {/* Standard read-only badge */}
      {isStandard && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 10, color: '#8c8c8c', background: '#f5f5f5',
          padding: '2px 6px', borderRadius: 4, border: '1px solid #e8e8e8',
        }}>
          只读
        </div>
      )}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function TemplateListPage() {
  const navigate         = useNavigate();
  const { primaryColor } = useTheme();
  const { success, error } = useNotification();

  const [templates, setTemplates] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [filters, setFilters]     = useState({
    name: '', status: '', category: '', sortBy: 'updatedAt', sortOrder: 'desc',
  });

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: DEFAULT_PAGE_SIZE, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await apiClient.get(endpoints.templates.list(), { params });
      setTemplates(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      error('加载模板列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  /* ── Handlers ── */
  const handleCreate = async () => {
    try {
      const res = await apiClient.post(endpoints.templates.create(), {});
      navigate(`/templates/${res.data.id}/editor`);
    } catch {
      error('创建模板失败');
    }
  };

  const handleOpen = (t) => navigate(`/templates/${t.id}/editor`);

  const handleClone = async (t) => {
    try {
      const res = await apiClient.post(endpoints.templates.clone(t.id), {});
      success(`已克隆「${t.name}」，正在进入新模板…`);
      navigate(`/templates/${res.data.newTemplateId}/editor`);
    } catch {
      error('克隆模板失败');
    }
  };

  const handleArchive = async (t) => {
    if (!window.confirm(`确认归档模板「${t.name}」？归档后不可被新项目引用。`)) return;
    try {
      await apiClient.post(endpoints.templates.archive(t.id));
      success('模板已归档');
      loadTemplates();
    } catch {
      error('归档失败');
    }
  };

  const handleValidate = (t) => navigate(`/templates/${t.id}/validate`);

  const setFilter = (key, val) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: val }));
  };

  /* ── Styles ── */
  const inputStyle = { padding: '6px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, outline: 'none' };

  return (
    <div style={{ padding: 24, minHeight: '100%' }}>
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>RUP 模板列表</h2>
        <span style={{ fontSize: 13, color: '#8c8c8c' }}>共 {total} 个模板</span>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, padding: 14, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
        <input
          style={{ ...inputStyle, width: 200 }}
          placeholder="搜索模板名称…"
          value={filters.name}
          onChange={(e) => setFilter('name', e.target.value)}
        />
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
          <option value="">全部分类</option>
          <option value="Standard">系统内置</option>
          <option value="Custom">自定义</option>
        </select>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">全部状态</option>
          <option value="Draft">草稿</option>
          <option value="Published">已发布</option>
          <option value="Archived">已归档</option>
        </select>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={filters.sortBy} onChange={(e) => setFilter('sortBy', e.target.value)}>
          <option value="updatedAt">按更新时间</option>
          <option value="createdAt">按创建时间</option>
          <option value="name">按名称</option>
        </select>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={filters.sortOrder} onChange={(e) => setFilter('sortOrder', e.target.value)}>
          <option value="desc">降序</option>
          <option value="asc">升序</option>
        </select>
      </div>

      {/* Card grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>加载中…</div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>
          暂无模板，点击右下角 ＋ 创建第一个模板。
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16, marginBottom: 24 }}>
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onOpen={handleOpen}
              onClone={handleClone}
              onArchive={handleArchive}
              onValidate={handleValidate}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > DEFAULT_PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '4px 12px', cursor: 'pointer' }}>上一页</button>
          <span style={{ padding: '4px 8px', fontSize: 13, color: '#595959' }}>
            第 {page} / {Math.ceil(total / DEFAULT_PAGE_SIZE)} 页
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / DEFAULT_PAGE_SIZE)} style={{ padding: '4px 12px', cursor: 'pointer' }}>下一页</button>
        </div>
      )}

      {/* FAB — new template */}
      <button
        onClick={handleCreate}
        title="新建模板"
        style={{
          position: 'fixed', bottom: 32, right: 32,
          width: 52, height: 52, borderRadius: '50%',
          background: primaryColor, color: '#fff',
          border: 'none', fontSize: 26, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
          lineHeight: 1,
        }}
      >
        ＋
      </button>
    </div>
  );
}
