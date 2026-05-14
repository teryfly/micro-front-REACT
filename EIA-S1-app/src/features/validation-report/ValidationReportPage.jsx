import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../core/api/client';
import { endpoints } from '../../core/api/endpoints';
import { useNotification } from '../../app/providers/NotificationContext';
import { useTheme } from '../../app/providers/ThemeContext';
import { ISSUE_SEVERITY } from '../../core/constants';

const SEVERITY_COLOR = {
  Error:   '#ff4d4f',
  Warning: '#faad14',
  Info:    '#1890ff',
};

const SEVERITY_ICON = {
  Error:   '❌',
  Warning: '⚠️',
  Info:    'ℹ️',
};

/* ── Issue list ───────────────────────────────────────────────── */
function IssueList({ issues, primaryColor }) {
  if (!issues || issues.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#52c41a', fontSize: 15 }}>
        ✅ 未发现任何问题
      </div>
    );
  }

  const grouped = issues.reduce((acc, issue) => {
    acc[issue.severity] = acc[issue.severity] || [];
    acc[issue.severity].push(issue);
    return acc;
  }, {});

  const order = [ISSUE_SEVERITY.ERROR, ISSUE_SEVERITY.WARNING, ISSUE_SEVERITY.INFO];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {order.map((sev) =>
        grouped[sev]
          ? grouped[sev].map((issue, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  borderRadius: 6,
                  border: `1px solid ${SEVERITY_COLOR[issue.severity]}30`,
                  borderLeft: `4px solid ${SEVERITY_COLOR[issue.severity]}`,
                  background: `${SEVERITY_COLOR[issue.severity]}08`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span>{SEVERITY_ICON[issue.severity]}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: SEVERITY_COLOR[issue.severity] }}>
                    {issue.severity}
                  </span>
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>[{issue.type}]</span>
                  {issue.workflowId && (
                    <span style={{ fontSize: 11, color: '#bfbfbf' }}>工作流: {issue.workflowId}</span>
                  )}
                  {issue.nodeId && (
                    <span style={{ fontSize: 11, color: '#bfbfbf' }}>节点: {issue.nodeId}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#333' }}>{issue.message}</div>
              </div>
            ))
          : null
      )}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function ValidationReportPage() {
  const { templateId } = useParams();
  const navigate       = useNavigate();
  const { primaryColor } = useTheme();
  const { success, error } = useNotification();

  const [report,      setReport]      = useState(undefined); // undefined=loading, null=no report
  const [validating,  setValidating]  = useState(false);
  const [publishing,  setPublishing]  = useState(false);
  const [templateName, setTemplateName] = useState('');

  const loadReport = async () => {
    try {
      const res = await apiClient.get(endpoints.templates.validationReport(templateId));
      setReport(res.data);
    } catch {
      setReport(null);
    }
  };

  useEffect(() => {
    // Load template name
    apiClient.get(endpoints.templates.get(templateId))
      .then((res) => setTemplateName(res.data.name))
      .catch(() => {});
    loadReport();
  }, [templateId]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await apiClient.post(endpoints.templates.validate(templateId));
      setReport(res.data);
      if (res.data.valid) success('验证通过，模板无错误问题');
    } catch {
      error('验证请求失败');
    } finally {
      setValidating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await apiClient.post(endpoints.templates.publish(templateId));
      success('模板已成功发布');
      navigate(`/templates/${templateId}/editor`);
    } catch (err) {
      const issues = err.response?.data?.issues;
      if (issues) {
        setReport({ valid: false, issues });
        error('发布失败，请修复以下错误');
      } else {
        error('发布失败');
      }
    } finally {
      setPublishing(false);
    }
  };

  const hasErrors = report?.issues?.some((i) => i.severity === ISSUE_SEVERITY.ERROR);

  const btnBase = { padding: '6px 16px', borderRadius: 4, fontSize: 13, cursor: 'pointer', border: '1px solid transparent' };

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(`/templates/${templateId}/editor`)} style={{ ...btnBase, border: '1px solid #d9d9d9', background: '#fff', color: '#595959' }}>
          ← 返回编辑器
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>验证结果</h2>
          {templateName && <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>{templateName}</div>}
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={handleValidate}
          disabled={validating}
          style={{ ...btnBase, border: `1px solid ${primaryColor}`, color: primaryColor, background: '#fff' }}
        >
          {validating ? '验证中…' : '重新验证'}
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing || hasErrors || report === undefined}
          style={{ ...btnBase, background: (publishing || hasErrors || !report) ? '#f5f5f5' : primaryColor, color: (publishing || hasErrors || !report) ? '#8c8c8c' : '#fff', border: 'none' }}
        >
          {publishing ? '发布中…' : '立即发布模板'}
        </button>
      </div>

      {/* Report */}
      {report === undefined ? (
        <div style={{ color: '#8c8c8c', textAlign: 'center', padding: 40 }}>加载中…</div>
      ) : report === null ? (
        <div style={{ color: '#8c8c8c', textAlign: 'center', padding: 40, border: '1px dashed #e8e8e8', borderRadius: 8 }}>
          暂无验证报告，请点击「重新验证」执行验证。
        </div>
      ) : (
        <div>
          {/* Summary badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: 8, marginBottom: 20,
            background: report.valid ? '#f6ffed' : '#fff2f0',
            border: `1px solid ${report.valid ? '#b7eb8f' : '#ffccc7'}`,
          }}>
            <span style={{ fontSize: 22 }}>{report.valid ? '✅' : '❌'}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: report.valid ? '#52c41a' : '#ff4d4f' }}>
                {report.valid ? '验证通过' : '验证失败'}
              </div>
              {report.createdAt && (
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  验证时间：{new Date(report.createdAt).toLocaleString('zh-CN')}
                </div>
              )}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 13 }}>
              {[ISSUE_SEVERITY.ERROR, ISSUE_SEVERITY.WARNING].map((sev) => {
                const count = report.issues?.filter((i) => i.severity === sev).length || 0;
                return count > 0 ? (
                  <span key={sev} style={{ color: SEVERITY_COLOR[sev], fontWeight: 600 }}>
                    {SEVERITY_ICON[sev]} {sev === 'Error' ? '错误' : '警告'} {count}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Issue list */}
          <IssueList issues={report.issues} primaryColor={primaryColor} />
        </div>
      )}
    </div>
  );
}
