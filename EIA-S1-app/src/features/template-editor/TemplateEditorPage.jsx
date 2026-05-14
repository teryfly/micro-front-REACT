import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import apiClient from '../../core/api/client';
import { endpoints } from '../../core/api/endpoints';
import { useNotification } from '../../app/providers/NotificationContext';
import { useTheme } from '../../app/providers/ThemeContext';
import {
  TEMPLATE_STATUS_LABEL,
  TEMPLATE_STATUS_COLOR,
  TEMPLATE_CATEGORY_LABEL,
  WORKFLOW_CODES,
  PHASE_CODES,
} from '../../core/constants';

/* ═══════════════════════════════════════════════════════════════
   Shared button styles
═══════════════════════════════════════════════════════════════ */
const btnBase = {
  padding: '5px 14px', borderRadius: 4, fontSize: 13,
  cursor: 'pointer', border: '1px solid transparent',
};
const btnOutline = (color) => ({ ...btnBase, border: `1px solid ${color}`, color, background: '#fff' });
const btnPrimary = (color) => ({ ...btnBase, background: color, color: '#fff', border: 'none' });
const btnGhost   = { ...btnBase, border: '1px solid #d9d9d9', background: '#fff', color: '#595959' };
const btnDisabled = { ...btnBase, border: '1px solid #d9d9d9', background: '#f5f5f5', color: '#bfbfbf', cursor: 'not-allowed' };

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   US-01 (B-09): Exit Confirmation Dialog
   Shown when template.status === 'Draft' and user tries to leave
═══════════════════════════════════════════════════════════════ */
function ExitDialog({ onPublishAndClose, onCloseAsDraft, onCancel, publishing }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 10, padding: 28,
        width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontSize: 20, marginBottom: 10 }}>⚠️ 模板尚未发布</div>
        <p style={{ fontSize: 14, color: '#595959', lineHeight: 1.7, marginBottom: 22 }}>
          当前模板处于「草稿」状态，所有编辑已即时写库保存。
          您可以现在发布，或保持草稿状态退出。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onPublishAndClose}
            disabled={publishing}
            style={{
              ...btnBase,
              background: publishing ? '#f5f5f5' : '#52c41a',
              color: publishing ? '#bfbfbf' : '#fff',
              border: 'none',
              padding: '8px 16px',
              fontSize: 14,
              cursor: publishing ? 'not-allowed' : 'pointer',
            }}
          >
            {publishing ? '发布中…' : '✅ 发布并关闭'}
          </button>
          <button
            onClick={onCloseAsDraft}
            disabled={publishing}
            style={{ ...btnGhost, padding: '8px 16px', fontSize: 14 }}
          >
            📂 关闭（保持草稿）
          </button>
          <button
            onClick={onCancel}
            disabled={publishing}
            style={{ ...btnBase, color: '#8c8c8c', background: 'transparent', padding: '8px 16px', fontSize: 14 }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Add Workflow Dialog — US-03
═══════════════════════════════════════════════════════════════ */
function AddWorkflowDialog({ onConfirm, onCancel, primaryColor }) {
  const [selectedCode, setSelectedCode] = useState('');
  const [customName, setCustomName]     = useState('');

  const selected = WORKFLOW_CODES.find((w) => w.code === selectedCode);

  const handleConfirm = () => {
    if (!selectedCode) return;
    onConfirm({
      code: selectedCode,
      name: customName.trim() || selected.label,
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 16 }}>新增工作流</h3>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>工作流类型 *</div>
          <select
            value={selectedCode}
            onChange={(e) => {
              setSelectedCode(e.target.value);
              const wf = WORKFLOW_CODES.find((w) => w.code === e.target.value);
              setCustomName(wf ? wf.label : '');
            }}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13 }}
          >
            <option value="">请选择…</option>
            {WORKFLOW_CODES.map((w) => (
              <option key={w.code} value={w.code}>{w.label}（{w.code}）</option>
            ))}
          </select>
        </label>

        {selected && (
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 12 }}>
            默认阶段：{selected.defaultPhaseCodes.join('、')}
          </div>
        )}

        <label style={{ display: 'block', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#333' }}>显示名称</div>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={selected?.label || '工作流名称'}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, boxSizing: 'border-box' }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost}>取消</button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCode}
            style={selectedCode ? btnPrimary(primaryColor) : btnDisabled}
          >
            添加工作流
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Delete Workflow Confirm Dialog — US-04
═══════════════════════════════════════════════════════════════ */
function DeleteWorkflowDialog({ workflow, impact, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#ff4d4f' }}>⚠️ 删除工作流</h3>
        <p style={{ fontSize: 14, color: '#595959', marginBottom: 16 }}>
          确认删除工作流「<strong>{workflow.name}</strong>」？
        </p>
        {impact && (
          <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6, padding: 12, marginBottom: 18, fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: '#cf1322' }}>将被删除的关联数据：</div>
            <div style={{ color: '#595959', lineHeight: 1.8 }}>
              • 节点：{impact.nodeCount ?? 0} 个<br />
              • 流程内依赖边：{impact.edgeCount ?? 0} 条<br />
              • 跨流程依赖：{impact.crossFlowCount ?? 0} 条
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost}>取消</button>
          <button onClick={onConfirm} style={{ ...btnBase, background: '#ff4d4f', color: '#fff', border: 'none' }}>确认删除</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Edit Workflow Dialog — US-05
   Edits name/description/priority/estimatedDuration + phase codes.
   Phase-code change triggers analyze-phase-change pre-check.
═══════════════════════════════════════════════════════════════ */
function EditWorkflowDialog({ workflow, templateId, primaryColor, onSave, onCancel, onError }) {
  // Valid phases per PhaseMapping static config for this workflow code
  const wfDef = WORKFLOW_CODES.find((w) => w.code === workflow.code);
  const validPhaseCodes = wfDef?.defaultPhaseCodes ?? PHASE_CODES.map((p) => p.code);

  const [name,              setName]              = useState(workflow.name || '');
  const [description,       setDescription]       = useState(workflow.description || '');
  const [priority,          setPriority]          = useState(workflow.priority ?? 0);
  const [estimatedDuration, setEstimatedDuration] = useState(workflow.estimatedDuration || '');
  const [selectedPhases,    setSelectedPhases]    = useState(new Set(workflow.allowedPhaseCodes || []));

  const [saving,        setSaving]        = useState(false);
  const [analyzing,     setAnalyzing]     = useState(false);
  const [affectedNodes, setAffectedNodes] = useState(null);  // null = not checked yet
  const [showPhaseWarn, setShowPhaseWarn] = useState(false);

  const originalPhases = new Set(workflow.allowedPhaseCodes || []);
  const phaseChanged = !setsEqual(selectedPhases, originalPhases);
  const attrChanged =
    name.trim() !== workflow.name ||
    (description || null) !== workflow.description ||
    priority !== (workflow.priority ?? 0) ||
    (estimatedDuration || null) !== workflow.estimatedDuration;
  const nothingChanged = !phaseChanged && !attrChanged;

  const togglePhase = (code) => {
    setSelectedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
    setAffectedNodes(null);
    setShowPhaseWarn(false);
  };

  const doSave = async () => {
    setSaving(true);
    try {
      let updatedWf = { ...workflow };

      if (attrChanged) {
        const res = await apiClient.put(endpoints.workflows.update(templateId, workflow.id), {
          name: name.trim(),
          description: description || null,
          priority,
          estimatedDuration: estimatedDuration || null,
        });
        updatedWf = { ...updatedWf, ...res.data };
      }

      if (phaseChanged) {
        await apiClient.put(endpoints.workflows.updatePhaseCodes(templateId, workflow.id), {
          phaseCodes: Array.from(selectedPhases),
        });
        updatedWf = { ...updatedWf, allowedPhaseCodes: Array.from(selectedPhases) };
      }

      onSave(updatedWf, phaseChanged || attrChanged);
    } catch {
      onError('保存工作流失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { onError('工作流名称不能为空'); return; }
    if (nothingChanged) { onCancel(); return; }

    // If phase codes changed, run analyze-phase-change first
    if (phaseChanged) {
      setAnalyzing(true);
      try {
        const search = new URLSearchParams();
        Array.from(selectedPhases).forEach((c) => search.append('newPhaseCodes', c));
        const res = await apiClient.get(
          `${endpoints.workflows.analyzePhase(templateId, workflow.id)}?${search.toString()}`
        );
        const nodes = res.data.affectedNodes || [];
        setAffectedNodes(nodes);
        if (nodes.length > 0) {
          setShowPhaseWarn(true);
          setAnalyzing(false);
          return;
        }
      } catch {
        // analyze failed — proceed anyway (backend will enforce on save)
      }
      setAnalyzing(false);
    }

    await doSave();
  };

  const inputStyle = {
    width: '100%', padding: '7px 10px', borderRadius: 4,
    border: '1px solid #d9d9d9', fontSize: 13, boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 500, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>编辑工作流</h3>

        {/* Basic attributes */}
        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>显示名称 *</div>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>描述</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>优先级</div>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              style={inputStyle}
            />
          </label>
          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>预计工期</div>
            <input
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="如 3months"
              style={inputStyle}
            />
          </label>
        </div>

        {/* Phase codes — only valid phases per PhaseMapping are selectable */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>允许阶段</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PHASE_CODES.map((p) => {
              const valid   = validPhaseCodes.includes(p.code);
              const checked = selectedPhases.has(p.code);
              return (
                <label
                  key={p.code}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 4,
                    cursor: valid ? 'pointer' : 'not-allowed',
                    border: `1px solid ${checked ? primaryColor : '#d9d9d9'}`,
                    background: checked ? `${primaryColor}18` : valid ? '#fff' : '#fafafa',
                    fontSize: 13,
                    color: valid ? (checked ? primaryColor : '#333') : '#bfbfbf',
                    opacity: valid ? 1 : 0.5,
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!valid}
                    onChange={() => valid && togglePhase(p.code)}
                    style={{ margin: 0 }}
                  />
                  {p.label}
                </label>
              );
            })}
          </div>
          {wfDef && (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 6 }}>
              仅可勾选「{wfDef.label}」工作流类型允许的阶段
            </div>
          )}
        </div>

        {/* Phase-change affected nodes warning */}
        {showPhaseWarn && affectedNodes?.length > 0 && (
          <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: '#d46b08' }}>⚠️ 阶段变更影响</div>
            <div style={{ color: '#595959', marginBottom: 10 }}>
              共 <strong>{affectedNodes.length}</strong> 个节点的 phaseCode 将超出新阶段范围。
              这些节点将保留原 phaseCode，但验证时会产生错误。
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={doSave}
                disabled={saving}
                style={{ ...btnBase, background: '#fa8c16', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? '保存中…' : '确认修改'}
              </button>
              <button onClick={() => setShowPhaseWarn(false)} style={btnGhost}>重新选择</button>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        {!showPhaseWarn && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onCancel} style={btnGhost} disabled={saving || analyzing}>取消</button>
            <button
              onClick={handleSave}
              disabled={saving || analyzing || nothingChanged}
              style={saving || analyzing || nothingChanged ? btnDisabled : btnPrimary(primaryColor)}
            >
              {analyzing ? '检查影响中…' : saving ? '保存中…' : '保存'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Workflow Panel (left sidebar) — US-03/04/05
═══════════════════════════════════════════════════════════════ */
function WorkflowPanel({ workflows, selectedWfId, onSelect, onAddWorkflow, onDeleteWorkflow, onEditWorkflow, primaryColor, isReadOnly }) {
  return (
    <div style={{ width: 220, borderRight: '1px solid #e8e8e8', background: '#fafafa', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e8e8' }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#595959' }}>工作流</span>
        {!isReadOnly && (
          <button
            onClick={onAddWorkflow}
            title="新增工作流"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: primaryColor, lineHeight: 1, padding: '0 2px' }}
          >
            ＋
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {workflows.length === 0 && (
          <div style={{ padding: '14px 12px', fontSize: 12, color: '#bfbfbf', textAlign: 'center' }}>
            {isReadOnly ? '无工作流' : '暂无工作流，点击 ＋ 添加'}
          </div>
        )}
        {workflows.map((wf) => (
          <WorkflowItem
            key={wf.id}
            wf={wf}
            active={wf.id === selectedWfId}
            onSelect={onSelect}
            onEdit={onEditWorkflow}
            onDelete={onDeleteWorkflow}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowItem({ wf, active, onSelect, onEdit, onDelete, primaryColor, isReadOnly }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center',
        padding: '9px 12px',
        cursor: 'pointer',
        fontSize: 13,
        borderLeft: active ? `3px solid ${primaryColor}` : '3px solid transparent',
        background: active ? `${primaryColor}10` : hover ? '#f0f0f0' : 'transparent',
        color: active ? primaryColor : '#333',
        transition: 'background 0.1s',
        userSelect: 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(wf.id)}
    >
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wf.name}</span>
      {!isReadOnly && hover && (
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(wf); }}
            title="编辑工作流"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: primaryColor, fontSize: 13, padding: '0 2px', lineHeight: 1 }}
          >
            ✏
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(wf); }}
            title="删除工作流"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff4d4f', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Node management — US-06 / US-07 / US-08
═══════════════════════════════════════════════════════════════ */

const PHASE_COLORS = {
  Inception: '#722ed1', Elaboration: '#1890ff',
  Construction: '#52c41a', Transition: '#fa8c16',
};
const PHASE_LABELS = {
  Inception: '初始', Elaboration: '细化', Construction: '构建', Transition: '移交',
};
const CONDITION_LABELS = {
  ManualConfirm: '人工确认', MinDocuments: '最少文档', Checklist: '清单完成',
};

function generateNodeId(docTypeCode, existingIds) {
  const base = (docTypeCode || 'node').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'node';
  if (!existingIds.has(base)) return base;
  let n = 2;
  while (existingIds.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/* — Add Node Dialog — US-06 — */
function AddNodeDialog({ workflow, templateId, primaryColor, onConfirm, onCancel, onError }) {
  const [docTypes,     setDocTypes]     = useState(null);
  const [loadingDt,    setLoadingDt]    = useState(true);
  const [selectedDt,   setSelectedDt]   = useState(null);
  const [phaseResult,  setPhaseResult]  = useState(null);
  const [selectedPhase,setSelectedPhase]= useState('');
  const [loadingPhase, setLoadingPhase] = useState(false);
  const [confirming,   setConfirming]   = useState(false);
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    apiClient.get(endpoints.templates.docTypes(templateId))
      .then((res) => setDocTypes(res.data || []))
      .catch(() => { onError('加载 DocType 失败'); setDocTypes([]); })
      .finally(() => setLoadingDt(false));
  }, [templateId]);

  useEffect(() => {
    if (!selectedDt) { setPhaseResult(null); setSelectedPhase(''); return; }
    setLoadingPhase(true);
    apiClient.get(endpoints.workflows.defaultPhaseCode(templateId, workflow.id), {
      params: { docTypeId: selectedDt.id },
    })
      .then((res) => {
        setPhaseResult(res.data);
        setSelectedPhase(res.data.phaseCode || '');
      })
      .catch(() => {
        setPhaseResult({ hasIntersection: false, phaseCode: null, allowedPhaseCodes: [] });
        setSelectedPhase('');
      })
      .finally(() => setLoadingPhase(false));
  }, [selectedDt?.id]);

  const handleConfirm = async () => {
    if (!selectedDt || !selectedPhase) return;
    const existingIds = new Set((workflow.nodes || []).map((n) => n.id));
    const nodeId = generateNodeId(selectedDt.code, existingIds);
    setConfirming(true);
    try {
      const res = await apiClient.post(endpoints.nodes.create(templateId, workflow.id), {
        nodeId,
        docTypeId: selectedDt.id,
        label: selectedDt.name,
        phaseCode: selectedPhase,
        priority: 0,
        completionConditionType: 'MinDocuments',
        completionConditionConfigJson: '{"minDocuments":1}',
        checklistItems: [],
      });
      onConfirm(res.data);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'NODE_ALREADY_EXISTS') onError('节点 ID 冲突，请重试');
      else if (code === 'TEMPLATE_READ_ONLY') onError('系统内置模板不可修改');
      else onError('添加节点失败');
    } finally {
      setConfirming(false);
    }
  };

  const filtered = (docTypes || []).filter((dt) =>
    !search || dt.name.includes(search) || dt.code.toLowerCase().includes(search.toLowerCase())
  );
  const canConfirm = !!selectedDt && !!selectedPhase && !loadingPhase;

  const phaseRadios = (codes) => codes.map((code) => (
    <label key={code} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
      borderRadius: 4, cursor: 'pointer', fontSize: 13,
      border: `1px solid ${selectedPhase === code ? primaryColor : '#d9d9d9'}`,
      background: selectedPhase === code ? `${primaryColor}18` : '#fff',
      color: selectedPhase === code ? primaryColor : '#333',
    }}>
      <input type="radio" name="phase" value={code} checked={selectedPhase === code}
        onChange={() => setSelectedPhase(code)} style={{ margin: 0 }} />
      {PHASE_LABELS[code] || code}
    </label>
  ));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 520, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 16 }}>添加节点</h3>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>选择 DocType *</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 DocType…"
            style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, boxSizing: 'border-box', marginBottom: 6 }}
          />
          {loadingDt ? (
            <div style={{ color: '#8c8c8c', fontSize: 13, padding: '8px 0' }}>加载中…</div>
          ) : (
            <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 6 }}>
              {filtered.length === 0 && (
                <div style={{ padding: 12, fontSize: 13, color: '#8c8c8c' }}>暂无可用 DocType</div>
              )}
              {filtered.map((dt) => (
                <div
                  key={dt.id}
                  onClick={() => setSelectedDt(dt)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                    borderLeft: `3px solid ${selectedDt?.id === dt.id ? primaryColor : 'transparent'}`,
                    background: selectedDt?.id === dt.id ? `${primaryColor}10` : 'transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span>{dt.name}</span>
                  <span style={{ fontSize: 11, color: '#8c8c8c' }}>{dt.code}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedDt && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>阶段 *</div>
            {loadingPhase ? (
              <div style={{ color: '#8c8c8c', fontSize: 13 }}>计算默认阶段…</div>
            ) : phaseResult?.hasIntersection ? (
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {phaseRadios(phaseResult.allowedPhaseCodes || [])}
                </div>
                {phaseResult.warning && (
                  <div style={{ fontSize: 12, color: '#d46b08', marginTop: 6 }}>⚠️ {phaseResult.warning}</div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: '#d46b08', marginBottom: 8 }}>
                  该 DocType 与工作流阶段无交集，请手动选择阶段：
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {phaseRadios(workflow.allowedPhaseCodes || [])}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost} disabled={confirming}>取消</button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || confirming}
            style={canConfirm && !confirming ? btnPrimary(primaryColor) : btnDisabled}
          >
            {confirming ? '添加中…' : '添加节点'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* — Edit Node Dialog — US-08 — */
function EditNodeDialog({ node, workflow, templateId, primaryColor, onSave, onCancel, onError }) {
  const [label,             setLabel]             = useState(node.label || '');
  const [description,       setDescription]       = useState(node.description || '');
  const [phaseCode,         setPhaseCode]         = useState(node.phaseCode || '');
  const [priority,          setPriority]          = useState(node.priority ?? 0);
  const [estimatedDuration, setEstimatedDuration] = useState(node.estimatedDuration || '');
  const [conditionType,     setConditionType]     = useState(node.completionConditionType || 'MinDocuments');
  const [minDocuments,      setMinDocuments]      = useState(() => {
    try { return JSON.parse(node.completionConditionConfigJson || '{}').minDocuments ?? 1; } catch { return 1; }
  });
  const [checklistItems, setChecklistItems] = useState((node.checklistItems || []).map((ci) => ({ ...ci })));
  const [newCiText,      setNewCiText]      = useState('');
  const [saving,         setSaving]         = useState(false);

  const allowedPhases = workflow.allowedPhaseCodes || [];

  const addCi = () => {
    if (!newCiText.trim()) return;
    setChecklistItems((prev) => [...prev, { id: null, text: newCiText.trim(), docTypeBinding: null, sequence: prev.length + 1, required: true }]);
    setNewCiText('');
  };

  const handleSave = async () => {
    if (!label.trim()) { onError('节点标签不能为空'); return; }
    if (!phaseCode) { onError('请选择阶段'); return; }
    if (conditionType === 'Checklist' && checklistItems.length === 0) {
      onError('清单类型节点至少需要一条清单项'); return;
    }
    const configJson = conditionType === 'MinDocuments'
      ? JSON.stringify({ minDocuments: minDocuments || 1 })
      : null;
    setSaving(true);
    try {
      const res = await apiClient.put(endpoints.nodes.update(templateId, workflow.id, node.id), {
        label: label.trim(),
        description: description || null,
        phaseCode,
        priority,
        estimatedDuration: estimatedDuration || null,
        completionConditionType: conditionType,
        completionConditionConfigJson: configJson,
        checklistItems: conditionType === 'Checklist'
          ? checklistItems.map((ci, i) => ({ id: ci.id || null, text: ci.text, docTypeBinding: ci.docTypeBinding || null, sequence: i + 1, required: ci.required ?? true }))
          : [],
      });
      onSave(res.data);
    } catch {
      onError('保存节点失败');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 520, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 16 }}>编辑节点</h3>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>标签 *</div>
          <input value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>描述</div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </label>

        {/* Phase */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>阶段 *</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allowedPhases.map((code) => (
              <label key={code} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                borderRadius: 4, cursor: 'pointer', fontSize: 13,
                border: `1px solid ${phaseCode === code ? primaryColor : '#d9d9d9'}`,
                background: phaseCode === code ? `${primaryColor}18` : '#fff',
                color: phaseCode === code ? primaryColor : '#333',
              }}>
                <input type="radio" name="editPhase" value={code} checked={phaseCode === code}
                  onChange={() => setPhaseCode(code)} style={{ margin: 0 }} />
                {PHASE_LABELS[code] || code}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>优先级</div>
            <input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} style={inputStyle} />
          </label>
          <label style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>预计工期</div>
            <input value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} placeholder="如 1week" style={inputStyle} />
          </label>
        </div>

        {/* Completion condition */}
        <div style={{ marginBottom: conditionType === 'Checklist' ? 14 : 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>完成条件</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['ManualConfirm', 'MinDocuments', 'Checklist'].map((ct) => (
              <label key={ct} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                borderRadius: 4, cursor: 'pointer', fontSize: 13,
                border: `1px solid ${conditionType === ct ? primaryColor : '#d9d9d9'}`,
                background: conditionType === ct ? `${primaryColor}18` : '#fff',
                color: conditionType === ct ? primaryColor : '#333',
              }}>
                <input type="radio" name="condType" value={ct} checked={conditionType === ct}
                  onChange={() => setConditionType(ct)} style={{ margin: 0 }} />
                {CONDITION_LABELS[ct]}
              </label>
            ))}
          </div>
        </div>

        {conditionType === 'MinDocuments' && (
          <label style={{ display: 'block', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>最少文档数</div>
            <input type="number" min={1} value={minDocuments} onChange={(e) => setMinDocuments(Number(e.target.value))} style={{ ...inputStyle, width: 100 }} />
          </label>
        )}

        {conditionType === 'Checklist' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>清单项</div>
            {checklistItems.map((ci, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ flex: 1, fontSize: 13, color: '#333', background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 4, padding: '5px 10px' }}>{ci.text}</span>
                <button onClick={() => setChecklistItems((prev) => prev.filter((_, j) => j !== i))}
                  style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newCiText} onChange={(e) => setNewCiText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCi()}
                placeholder="输入清单项后按回车" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addCi} style={{ ...btnBase, border: `1px solid ${primaryColor}`, color: primaryColor, background: '#fff' }}>添加</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost} disabled={saving}>取消</button>
          <button onClick={handleSave} disabled={saving} style={saving ? btnDisabled : btnPrimary(primaryColor)}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* — Node card — */
function NodeCard({ node, primaryColor, isReadOnly, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  const phaseColor = PHASE_COLORS[node.phaseCode] || '#8c8c8c';
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${hover ? primaryColor : '#e8e8e8'}`,
        borderRadius: 8, padding: 12, background: '#fff', position: 'relative',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#1a1a1a', paddingRight: !isReadOnly && hover ? 80 : 0 }}>
        {node.label}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: `${phaseColor}18`, color: phaseColor, border: `1px solid ${phaseColor}40` }}>
          {PHASE_LABELS[node.phaseCode] || node.phaseCode}
        </span>
        <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: '#f5f5f5', color: '#595959', border: '1px solid #e8e8e8' }}>
          {CONDITION_LABELS[node.completionConditionType] || node.completionConditionType}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#bfbfbf' }}>{node.id}</div>
      {!isReadOnly && hover && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          <button onClick={onEdit} style={{ background: '#fff', border: `1px solid ${primaryColor}`, color: primaryColor, borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontSize: 11 }}>编辑</button>
          <button onClick={onDelete} style={{ background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontSize: 11 }}>删除</button>
        </div>
      )}
    </div>
  );
}

/* — Add Edge Dialog — US-09 — */
function AddEdgeDialog({ workflow, templateId, primaryColor, onConfirm, onCancel, onError }) {
  const nodes = workflow.nodes || [];
  const [sourceId,  setSourceId]  = useState('');
  const [targetId,  setTargetId]  = useState('');
  const [edgeType,  setEdgeType]  = useState('Required');
  const [label,     setLabel]     = useState('');
  const [notes,     setNotes]     = useState('');
  const [checking,  setChecking]  = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [cycleErr,  setCycleErr]  = useState(null);

  const handleConfirm = async () => {
    if (!sourceId || !targetId) { onError('请选择起点和终点节点'); return; }
    if (sourceId === targetId) { onError('起点和终点不能为同一节点'); return; }
    setCycleErr(null);
    setChecking(true);
    try {
      const res = await apiClient.get(endpoints.edges.checkCycle(templateId, workflow.id), {
        params: { sourceNodeId: sourceId, targetNodeId: targetId },
      });
      if (res.data.hasCycle) {
        setCycleErr(`检测到循环依赖，无法创建（路径：${res.data.cyclePath?.join(' → ') || ''}）`);
        setChecking(false);
        return;
      }
    } catch { /* backend will enforce */ }
    setChecking(false);
    setCreating(true);
    try {
      const res = await apiClient.post(endpoints.edges.create(templateId, workflow.id), {
        sourceNodeId: sourceId, targetNodeId: targetId, edgeType,
        label: label || null, weight: 0, notes: notes || null,
      });
      onConfirm(res.data);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'CYCLE_DETECTED') onError('后端检测到循环依赖，边未创建');
      else if (code === 'TEMPLATE_READ_ONLY') onError('系统内置模板不可修改');
      else onError('创建依赖边失败');
    } finally { setCreating(false); }
  };

  const selectStyle = { width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13 };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 16 }}>添加依赖边</h3>
        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>起点节点（前置）*</div>
          <select value={sourceId} onChange={(e) => { setSourceId(e.target.value); setCycleErr(null); }} style={selectStyle}>
            <option value="">请选择…</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}（{n.id}）</option>)}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>终点节点（后置）*</div>
          <select value={targetId} onChange={(e) => { setTargetId(e.target.value); setCycleErr(null); }} style={selectStyle}>
            <option value="">请选择…</option>
            {nodes.filter((n) => n.id !== sourceId).map((n) => <option key={n.id} value={n.id}>{n.label}（{n.id}）</option>)}
          </select>
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['Required', 'Optional'].map((t) => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, border: `1px solid ${edgeType === t ? primaryColor : '#d9d9d9'}`, background: edgeType === t ? `${primaryColor}18` : '#fff', color: edgeType === t ? primaryColor : '#333' }}>
              <input type="radio" name="edgeType" value={t} checked={edgeType === t} onChange={() => setEdgeType(t)} style={{ margin: 0 }} />
              {t === 'Required' ? '必须依赖' : '可选依赖'}
            </label>
          ))}
        </div>
        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>边标签</div>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="可选" style={{ ...selectStyle }} />
        </label>
        {cycleErr && <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 13, color: '#cf1322' }}>⚠️ {cycleErr}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost} disabled={checking || creating}>取消</button>
          <button onClick={handleConfirm} disabled={!sourceId || !targetId || checking || creating}
            style={sourceId && targetId && !checking && !creating ? btnPrimary(primaryColor) : btnDisabled}>
            {checking ? '检测循环…' : creating ? '创建中…' : '添加依赖边'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* — Edit Edge Dialog — US-09 — */
function EditEdgeDialog({ edge, workflow, templateId, primaryColor, onSave, onCancel, onError }) {
  const [edgeType, setEdgeType] = useState(edge.type || 'Required');
  const [label,    setLabel]    = useState(edge.label || '');
  const [notes,    setNotes]    = useState(edge.notes || '');
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put(endpoints.edges.update(templateId, workflow.id, edge.id), {
        edgeType, label: label || null, weight: edge.weight || 0, notes: notes || null,
      });
      onSave(res.data);
    } catch {
      onError('保存依赖边失败');
    } finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, boxSizing: 'border-box' };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 16 }}>编辑依赖边</h3>
        <div style={{ fontSize: 13, color: '#595959', marginBottom: 14 }}>
          <strong>{edge.source}</strong> → <strong>{edge.target}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['Required', 'Optional'].map((t) => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, border: `1px solid ${edgeType === t ? primaryColor : '#d9d9d9'}`, background: edgeType === t ? `${primaryColor}18` : '#fff', color: edgeType === t ? primaryColor : '#333' }}>
              <input type="radio" name="editEdgeType" value={t} checked={edgeType === t} onChange={() => setEdgeType(t)} style={{ margin: 0 }} />
              {t === 'Required' ? '必须依赖' : '可选依赖'}
            </label>
          ))}
        </div>
        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>边标签</div>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="可选" style={inputStyle} />
        </label>
        <label style={{ display: 'block', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>备注</div>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="可选" style={inputStyle} />
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost} disabled={saving}>取消</button>
          <button onClick={handleSave} disabled={saving} style={saving ? btnDisabled : btnPrimary(primaryColor)}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* — WorkflowCanvas: node grid with add/edit/delete — US-06/07/08 — */
function WorkflowCanvas({ workflow, templateId, primaryColor, isReadOnly, onNodeAdded, onNodeDeleted, onNodeUpdated, onEdgeAdded, onEdgeDeleted, onEdgeUpdated, onError, onSuccess }) {
  const [activeTab,    setActiveTab]    = useState('nodes');
  const [showAddNode,  setShowAddNode]  = useState(false);
  const [nodeToEdit,   setNodeToEdit]   = useState(null);
  const [nodeToDelete, setNodeToDelete] = useState(null);
  const [deletingNode, setDeletingNode] = useState(false);
  const [showAddEdge,  setShowAddEdge]  = useState(false);
  const [edgeToEdit,   setEdgeToEdit]   = useState(null);
  const [edgeToDelete, setEdgeToDelete] = useState(null);
  const [deletingEdge, setDeletingEdge] = useState(false);

  if (!workflow) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', fontSize: 14 }}>
        {isReadOnly ? '请选择工作流查看内容' : '请选择或新建工作流'}
      </div>
    );
  }

  const nodes = workflow.nodes || [];
  const edges = workflow.edges || [];
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const handleDeleteNodeConfirm = async () => {
    if (!nodeToDelete) return;
    setDeletingNode(true);
    try {
      await apiClient.delete(endpoints.nodes.delete(templateId, workflow.id, nodeToDelete.id));
      onNodeDeleted(nodeToDelete.id);
      onSuccess(`节点「${nodeToDelete.label}」已删除`);
      setNodeToDelete(null);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'TEMPLATE_READ_ONLY') onError('系统内置模板不可修改');
      else onError('删除节点失败');
    } finally { setDeletingNode(false); }
  };

  const handleDeleteEdgeConfirm = async () => {
    if (!edgeToDelete) return;
    setDeletingEdge(true);
    try {
      await apiClient.delete(endpoints.edges.delete(templateId, workflow.id, edgeToDelete.id));
      onEdgeDeleted(edgeToDelete.id);
      onSuccess('依赖边已删除');
      setEdgeToDelete(null);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'TEMPLATE_READ_ONLY') onError('系统内置模板不可修改');
      else onError('删除依赖边失败');
    } finally { setDeletingEdge(false); }
  };

  const tabBtn = (tab, label) => (
    <button key={tab} onClick={() => setActiveTab(tab)} style={{
      padding: '8px 16px', border: 'none', background: 'transparent',
      borderBottom: `2px solid ${activeTab === tab ? primaryColor : 'transparent'}`,
      color: activeTab === tab ? primaryColor : '#595959',
      cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
    }}>{label}</button>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header: workflow meta + action button */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #e8e8e8', background: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{workflow.name}</span>
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          阶段：{(workflow.allowedPhaseCodes || []).map((c) => PHASE_LABELS[c] || c).join(' / ') || '—'}
        </span>
        <div style={{ flex: 1 }} />
        {!isReadOnly && activeTab === 'nodes' && (
          <button onClick={() => setShowAddNode(true)} style={{ ...btnBase, background: primaryColor, color: '#fff', border: 'none', fontSize: 13, padding: '4px 14px' }}>
            ＋ 添加节点
          </button>
        )}
        {!isReadOnly && activeTab === 'edges' && nodes.length >= 2 && (
          <button onClick={() => setShowAddEdge(true)} style={{ ...btnBase, background: primaryColor, color: '#fff', border: 'none', fontSize: 13, padding: '4px 14px' }}>
            ＋ 添加依赖边
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', background: '#fff', padding: '0 16px', flexShrink: 0 }}>
        {tabBtn('nodes', `节点（${nodes.length}）`)}
        {tabBtn('edges', `依赖边（${edges.length}）`)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* Nodes tab */}
        {activeTab === 'nodes' && (
          nodes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#bfbfbf', gap: 10 }}>
              <div style={{ fontSize: 36 }}>🗂️</div>
              <div style={{ fontSize: 14 }}>{isReadOnly ? '该工作流暂无节点' : '暂无节点，点击「＋ 添加节点」'}</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {nodes.map((node) => (
                <NodeCard key={node.id} node={node} primaryColor={primaryColor} isReadOnly={isReadOnly}
                  onEdit={() => setNodeToEdit(node)} onDelete={() => setNodeToDelete(node)} />
              ))}
            </div>
          )
        )}

        {/* Edges tab */}
        {activeTab === 'edges' && (
          edges.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#bfbfbf', gap: 10 }}>
              <div style={{ fontSize: 36 }}>🔗</div>
              <div style={{ fontSize: 14 }}>{isReadOnly ? '该工作流暂无依赖边' : nodes.length < 2 ? '至少需要 2 个节点才能创建依赖边' : '暂无依赖边，点击「＋ 添加依赖边」'}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {edges.map((edge) => {
                const srcNode = nodeMap[edge.source];
                const tgtNode = nodeMap[edge.target];
                return (
                  <EdgeRow key={edge.id} edge={edge} srcNode={srcNode} tgtNode={tgtNode}
                    primaryColor={primaryColor} isReadOnly={isReadOnly}
                    onEdit={() => setEdgeToEdit(edge)} onDelete={() => setEdgeToDelete(edge)} />
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Delete node confirmation */}
      {nodeToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#ff4d4f' }}>⚠️ 删除节点</h3>
            <p style={{ fontSize: 14, color: '#595959', marginBottom: 20 }}>
              确认删除节点「<strong>{nodeToDelete.label}</strong>」？<br />
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>同时删除该节点关联的流程内边和跨流程依赖。</span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setNodeToDelete(null)} style={btnGhost} disabled={deletingNode}>取消</button>
              <button onClick={handleDeleteNodeConfirm} disabled={deletingNode}
                style={{ ...btnBase, background: '#ff4d4f', color: '#fff', border: 'none' }}>
                {deletingNode ? '删除中…' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete edge confirmation */}
      {edgeToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#ff4d4f' }}>⚠️ 删除依赖边</h3>
            <p style={{ fontSize: 14, color: '#595959', marginBottom: 20 }}>
              确认删除「{nodeMap[edgeToDelete.source]?.label || edgeToDelete.source} → {nodeMap[edgeToDelete.target]?.label || edgeToDelete.target}」依赖边？
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setEdgeToDelete(null)} style={btnGhost} disabled={deletingEdge}>取消</button>
              <button onClick={handleDeleteEdgeConfirm} disabled={deletingEdge}
                style={{ ...btnBase, background: '#ff4d4f', color: '#fff', border: 'none' }}>
                {deletingEdge ? '删除中…' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddNode && (
        <AddNodeDialog workflow={workflow} templateId={templateId} primaryColor={primaryColor}
          onConfirm={(n) => { setShowAddNode(false); onNodeAdded(n); }}
          onCancel={() => setShowAddNode(false)} onError={onError} />
      )}
      {nodeToEdit && (
        <EditNodeDialog node={nodeToEdit} workflow={workflow} templateId={templateId} primaryColor={primaryColor}
          onSave={(n) => { setNodeToEdit(null); onNodeUpdated(n); }}
          onCancel={() => setNodeToEdit(null)} onError={onError} />
      )}
      {showAddEdge && (
        <AddEdgeDialog workflow={workflow} templateId={templateId} primaryColor={primaryColor}
          onConfirm={(e) => { setShowAddEdge(false); onEdgeAdded(e); }}
          onCancel={() => setShowAddEdge(false)} onError={onError} />
      )}
      {edgeToEdit && (
        <EditEdgeDialog edge={edgeToEdit} workflow={workflow} templateId={templateId} primaryColor={primaryColor}
          onSave={(e) => { setEdgeToEdit(null); onEdgeUpdated(e); }}
          onCancel={() => setEdgeToEdit(null)} onError={onError} />
      )}
    </div>
  );
}

/* — Edge row card — */
function EdgeRow({ edge, srcNode, tgtNode, primaryColor, isReadOnly, onEdit, onDelete }) {
  const [hover, setHover] = useState(false);
  const isRequired = edge.type === 'Required';
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${hover ? primaryColor : '#e8e8e8'}`,
        borderRadius: 8, padding: '10px 14px', background: '#fff',
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'border-color 0.15s',
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{srcNode?.label || edge.source}</span>
      <span style={{ fontSize: 16, color: isRequired ? primaryColor : '#8c8c8c' }}>
        {isRequired ? '→' : '⇢'}
      </span>
      <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{tgtNode?.label || edge.target}</span>
      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: isRequired ? `${primaryColor}18` : '#f5f5f5', color: isRequired ? primaryColor : '#8c8c8c', border: `1px solid ${isRequired ? primaryColor + '40' : '#e8e8e8'}` }}>
        {isRequired ? '必须' : '可选'}
      </span>
      {edge.label && <span style={{ fontSize: 12, color: '#8c8c8c' }}>{edge.label}</span>}
      <div style={{ flex: 1 }} />
      {!isReadOnly && hover && (
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onEdit} style={{ background: '#fff', border: `1px solid ${primaryColor}`, color: primaryColor, borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontSize: 11 }}>编辑</button>
          <button onClick={onDelete} style={{ background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontSize: 11 }}>删除</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Cross-flow Dependency Management — US-10
   Template-level panel (not workflow-level).
═══════════════════════════════════════════════════════════════ */
function AddCrossFlowDialog({ template, primaryColor, onConfirm, onCancel, onError }) {
  const workflows = template.workflows || [];
  const [srcWfId,  setSrcWfId]  = useState('');
  const [srcNdId,  setSrcNdId]  = useState('');
  const [tgtWfId,  setTgtWfId]  = useState('');
  const [tgtNdId,  setTgtNdId]  = useState('');
  const [edgeType, setEdgeType] = useState('Required');
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cycleErr, setCycleErr] = useState(null);

  const srcNodes = workflows.find((w) => w.id === srcWfId)?.nodes || [];
  const tgtNodes = workflows.find((w) => w.id === tgtWfId)?.nodes || [];

  const handleConfirm = async () => {
    if (!srcWfId || !srcNdId || !tgtWfId || !tgtNdId) { onError('请完整选择起点和终点'); return; }
    if (srcWfId === tgtWfId && srcNdId === tgtNdId) { onError('起点和终点不能相同'); return; }
    setCycleErr(null);
    setChecking(true);
    try {
      const res = await apiClient.get(endpoints.crossFlow.checkCycle(template.id), {
        params: { sourceWorkflowId: srcWfId, sourceNodeId: srcNdId, targetWorkflowId: tgtWfId, targetNodeId: tgtNdId },
      });
      if (res.data.hasCycle) {
        setCycleErr(`检测到循环依赖（路径：${res.data.cyclePath?.join(' → ') || ''}）`);
        setChecking(false);
        return;
      }
    } catch { /* backend will enforce */ }
    setChecking(false);

    const srcWf = workflows.find((w) => w.id === srcWfId);
    const tgtWf = workflows.find((w) => w.id === tgtWfId);
    const srcNd = srcNodes.find((n) => n.id === srcNdId);
    const tgtNd = tgtNodes.find((n) => n.id === tgtNdId);
    const displayLabel = `${srcWf?.name || srcWfId}.${srcNd?.label || srcNdId} → ${tgtWf?.name || tgtWfId}.${tgtNd?.label || tgtNdId}`;

    setCreating(true);
    try {
      const res = await apiClient.post(endpoints.crossFlow.create(template.id), {
        sourceWorkflowId: srcWfId, sourceNodeId: srcNdId,
        targetWorkflowId: tgtWfId, targetNodeId: tgtNdId,
        edgeType, displayLabel, description: null, weight: 0, notes: null,
      });
      onConfirm(res.data);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'CYCLE_DETECTED') onError('后端检测到循环依赖');
      else if (code === 'TEMPLATE_READ_ONLY') onError('系统内置模板不可修改');
      else onError('创建跨流程依赖失败');
    } finally { setCreating(false); }
  };

  const sel = (v, onChange, children) => (
    <select value={v} onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13 }}>
      {children}
    </select>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 16 }}>添加跨流程依赖</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>起点工作流 *</div>
            {sel(srcWfId, (v) => { setSrcWfId(v); setSrcNdId(''); setCycleErr(null); }, [
              <option key="" value="">请选择…</option>,
              ...workflows.map((w) => <option key={w.id} value={w.id}>{w.name}</option>),
            ])}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>起点节点 *</div>
            {sel(srcNdId, (v) => { setSrcNdId(v); setCycleErr(null); }, [
              <option key="" value="">请选择…</option>,
              ...srcNodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>),
            ])}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>终点工作流 *</div>
            {sel(tgtWfId, (v) => { setTgtWfId(v); setTgtNdId(''); setCycleErr(null); }, [
              <option key="" value="">请选择…</option>,
              ...workflows.map((w) => <option key={w.id} value={w.id}>{w.name}</option>),
            ])}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>终点节点 *</div>
            {sel(tgtNdId, (v) => { setTgtNdId(v); setCycleErr(null); }, [
              <option key="" value="">请选择…</option>,
              ...tgtNodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>),
            ])}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['Required', 'Optional'].map((t) => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, border: `1px solid ${edgeType === t ? primaryColor : '#d9d9d9'}`, background: edgeType === t ? `${primaryColor}18` : '#fff', color: edgeType === t ? primaryColor : '#333' }}>
              <input type="radio" name="cfEdgeType" value={t} checked={edgeType === t} onChange={() => setEdgeType(t)} style={{ margin: 0 }} />
              {t === 'Required' ? '必须依赖' : '可选依赖'}
            </label>
          ))}
        </div>
        {cycleErr && <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 13, color: '#cf1322' }}>⚠️ {cycleErr}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={btnGhost} disabled={checking || creating}>取消</button>
          <button onClick={handleConfirm} disabled={!srcWfId || !srcNdId || !tgtWfId || !tgtNdId || checking || creating}
            style={srcWfId && srcNdId && tgtWfId && tgtNdId && !checking && !creating ? btnPrimary(primaryColor) : btnDisabled}>
            {checking ? '检测循环…' : creating ? '创建中…' : '添加'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CrossFlowPanel({ template, primaryColor, isReadOnly, onAdd, onDelete, onClose, onError }) {
  const deps = template.crossFlowDependencies || [];
  const wfMap = Object.fromEntries((template.workflows || []).map((w) => [w.id, w]));
  const nodeMap = {};
  (template.workflows || []).forEach((w) => { (w.nodes || []).forEach((n) => { nodeMap[n.fullId || `${w.id}.${n.id}`] = n; }); });

  const [showAdd, setShowAdd] = useState(false);
  const [depToDelete, setDepToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!depToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(endpoints.crossFlow.delete(template.id, depToDelete.id));
      onDelete(depToDelete.id);
      setDepToDelete(null);
    } catch {
      onError?.('删除跨流程依赖失败');
    } finally { setDeleting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: 680, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>跨流程依赖（{deps.length}）</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {!isReadOnly && (
              <button onClick={() => setShowAdd(true)} style={btnPrimary(primaryColor)}>＋ 添加</button>
            )}
            <button onClick={onClose} style={btnGhost}>关闭</button>
          </div>
        </div>
        {/* List */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {deps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#bfbfbf', fontSize: 14 }}>
              {isReadOnly ? '暂无跨流程依赖' : '暂无跨流程依赖，点击「＋ 添加」'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {deps.map((dep) => {
                const srcWf = wfMap[dep.sourceWorkflowId];
                const tgtWf = wfMap[dep.targetWorkflowId];
                const srcNd = nodeMap[dep.sourceFullId];
                const tgtNd = nodeMap[dep.targetFullId];
                const isReq = dep.type === 'Required';
                return (
                  <div key={dep.id} style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: '10px 14px', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 2 }}>
                        {srcWf?.name || dep.sourceWorkflowId} · {srcNd?.label || dep.sourceNodeId}
                        <span style={{ color: isReq ? primaryColor : '#8c8c8c', margin: '0 8px' }}>{isReq ? '→' : '⇢'}</span>
                        {tgtWf?.name || dep.targetWorkflowId} · {tgtNd?.label || dep.targetNodeId}
                      </div>
                      {dep.displayLabel && <div style={{ fontSize: 11, color: '#8c8c8c' }}>{dep.displayLabel}</div>}
                    </div>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: isReq ? `${primaryColor}18` : '#f5f5f5', color: isReq ? primaryColor : '#8c8c8c', border: `1px solid ${isReq ? primaryColor + '40' : '#e8e8e8'}` }}>
                      {isReq ? '必须' : '可选'}
                    </span>
                    {!isReadOnly && (
                      <button onClick={() => setDepToDelete(dep)} style={{ background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontSize: 11 }}>删除</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {depToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#ff4d4f' }}>⚠️ 删除跨流程依赖</h3>
            <p style={{ fontSize: 14, color: '#595959', marginBottom: 20 }}>确认删除该跨流程依赖？</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setDepToDelete(null)} style={btnGhost} disabled={deleting}>取消</button>
              <button onClick={handleDelete} disabled={deleting} style={{ ...btnBase, background: '#ff4d4f', color: '#fff', border: 'none' }}>
                {deleting ? '删除中…' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <AddCrossFlowDialog
          template={template}
          primaryColor={primaryColor}
          onConfirm={(dep) => { setShowAdd(false); onAdd(dep); }}
          onCancel={() => setShowAdd(false)}
          onError={onError || (() => {})}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Editor Page
═══════════════════════════════════════════════════════════════ */
export default function TemplateEditorPage() {
  const { templateId }   = useParams();
  const navigate         = useNavigate();
  const { primaryColor } = useTheme();
  const { success, error, warning } = useNotification();

  const [template,      setTemplate]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [editingName,   setEditingName]   = useState(false);
  const [nameValue,     setNameValue]     = useState('');
  const [selectedWfId,  setSelectedWfId]  = useState(null);
  const [undoStack,     setUndoStack]     = useState([]); // US-16: { label, undo: async fn }

  const MAX_UNDO = 20;
  const pushUndo = (label, undoFn) => {
    setUndoStack((prev) => [...prev.slice(-(MAX_UNDO - 1)), { label, undo: undoFn }]);
  };

  /* ── US-16: Undo ── */
  const undoStackRef = useRef(undoStack);
  useEffect(() => { undoStackRef.current = undoStack; }, [undoStack]);

  const handleUndo = useCallback(async () => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const last = stack[stack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    try {
      await last.undo();
      success(`已撤销：${last.label}`);
    } catch {
      error('撤销失败');
    }
  }, [success, error]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo]);

  // Dialog states
  const [exitPublishing,  setExitPublishing]  = useState(false);
  const [showAddWf,       setShowAddWf]       = useState(false);
  const [wfToDelete,      setWfToDelete]      = useState(null); // { wf, impact }
  const [wfToEdit,        setWfToEdit]        = useState(null); // workflow object
  const [showCrossFlow,   setShowCrossFlow]   = useState(false);
  const [addingWf,        setAddingWf]        = useState(false);
  const [deletingWf,      setDeletingWf]      = useState(false);

  /* ── US-01 (B-09): Route blocker — fires when status is Draft ── */
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        !loading &&
        template?.status === 'Draft' &&
        currentLocation.pathname !== nextLocation.pathname,
      [loading, template?.status]
    )
  );

  /* ── US-01: beforeunload for browser tab close ── */
  useEffect(() => {
    const guard = (e) => {
      if (template?.status === 'Draft') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [template?.status]);

  /* ── Load template ── */
  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    apiClient.get(endpoints.templates.get(templateId))
      .then((res) => {
        setTemplate(res.data);
        setNameValue(res.data.name);
        if (res.data.workflows?.length) setSelectedWfId(res.data.workflows[0].id);
      })
      .catch(() => error('加载模板失败'))
      .finally(() => setLoading(false));
  }, [templateId]);

  const isReadOnly = template?.category === 'Standard';
  const selectedWf = template?.workflows?.find((w) => w.id === selectedWfId) || null;

  /* ── US-01: Save template name via PUT /metadata ── */
  const handleSaveName = async () => {
    const name = nameValue.trim();
    if (!name) { error('模板名称不能为空'); return; }
    const oldName = template.name;
    try {
      await apiClient.put(endpoints.templates.metadata(templateId), { name });
      setTemplate((t) => ({ ...t, name }));
      setEditingName(false);
      pushUndo(`重命名为「${name}」`, async () => {
        await apiClient.put(endpoints.templates.metadata(templateId), { name: oldName });
        setTemplate((t) => ({ ...t, name: oldName }));
      });
    } catch {
      error('保存名称失败');
    }
  };

  /* ── US-14: Publish / save ── */
  const handlePublish = async () => {
    try {
      await apiClient.post(endpoints.templates.publish(templateId));
      success('模板已发布');
      setTemplate((t) => ({ ...t, status: 'Published' }));
      return true;
    } catch (err) {
      const issues = err.response?.data?.issues;
      if (issues?.length) {
        const errCount  = issues.filter((i) => i.severity === 'Error').length;
        const warnCount = issues.filter((i) => i.severity === 'Warning').length;
        warning(`验证发现 ${errCount} 个错误、${warnCount} 个警告，请前往验证结果页修复`);
        return 'validation_failed';
      }
      error('发布失败');
      return false;
    }
  };

  /* ── US-01 / US-15: Exit dialog actions ── */
  const handlePublishAndClose = async () => {
    setExitPublishing(true);
    const result = await handlePublish();
    setExitPublishing(false);
    if (result === true) {
      blocker.proceed();
    } else if (result === 'validation_failed') {
      // Navigate to validate page, blocker.reset() first
      blocker.reset();
      navigate(`/templates/${templateId}/validate`);
    }
    // false = API error, stay in dialog (already closed via setExitPublishing)
  };

  const handleCloseAsDraft = () => {
    blocker.proceed();
  };

  const handleCancelExit = () => {
    blocker.reset();
  };

  /* ── US-03: Add workflow ── */
  const handleAddWorkflow = async ({ code, name }) => {
    setAddingWf(true);
    try {
      const res = await apiClient.post(endpoints.workflows.create(templateId), { code, name });
      const newWf = res.data;
      setTemplate((t) => ({
        ...t,
        status: t.status === 'Published' ? 'Draft' : t.status,
        workflows: [...(t.workflows || []), newWf],
      }));
      setSelectedWfId(newWf.id);
      setShowAddWf(false);
      success(`已添加工作流「${newWf.name}」`);
      pushUndo(`添加工作流「${newWf.name}」`, async () => {
        await apiClient.delete(endpoints.workflows.delete(templateId, newWf.id));
        setTemplate((t) => ({
          ...t,
          status: t.status === 'Published' ? 'Draft' : t.status,
          workflows: t.workflows.filter((w) => w.id !== newWf.id),
        }));
        setSelectedWfId((id) => id === newWf.id ? null : id);
      });
    } catch (err) {
      const code403 = err.response?.data?.error?.code;
      if (code403 === 'TEMPLATE_READ_ONLY') {
        error('系统内置模板不可修改');
      } else {
        error('添加工作流失败');
      }
    } finally {
      setAddingWf(false);
    }
  };

  /* ── US-04: Show delete workflow dialog (compute impact first) ── */
  const handleDeleteWorkflowClick = async (wf) => {
    // Compute impact from current template state
    const nodes       = wf.nodes?.length ?? 0;
    const edges       = wf.edges?.length ?? 0;
    const crossFlows  = (template.crossFlowDependencies || []).filter(
      (d) => d.sourceWorkflowId === wf.id || d.targetWorkflowId === wf.id
    ).length;
    setWfToDelete({ wf, impact: { nodeCount: nodes, edgeCount: edges, crossFlowCount: crossFlows } });
  };

  const handleDeleteWorkflowConfirm = async () => {
    if (!wfToDelete) return;
    setDeletingWf(true);
    try {
      await apiClient.delete(endpoints.workflows.delete(templateId, wfToDelete.wf.id));
      setTemplate((t) => ({
        ...t,
        status: t.status === 'Published' ? 'Draft' : t.status,
        workflows: t.workflows.filter((w) => w.id !== wfToDelete.wf.id),
        crossFlowDependencies: (t.crossFlowDependencies || []).filter(
          (d) => d.sourceWorkflowId !== wfToDelete.wf.id && d.targetWorkflowId !== wfToDelete.wf.id
        ),
      }));
      if (selectedWfId === wfToDelete.wf.id) {
        const remaining = template.workflows.filter((w) => w.id !== wfToDelete.wf.id);
        setSelectedWfId(remaining[0]?.id || null);
      }
      success(`已删除工作流「${wfToDelete.wf.name}」`);
      setWfToDelete(null);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'TEMPLATE_READ_ONLY') error('系统内置模板不可修改');
      else error('删除工作流失败');
    } finally {
      setDeletingWf(false);
    }
  };

  /* ── US-06/07/08: Node CRUD callbacks ── */
  const handleNodeAdded = (wfId, newNode) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      workflows: t.workflows.map((w) =>
        w.id === wfId ? { ...w, nodes: [...(w.nodes || []), newNode] } : w
      ),
    }));
    success(`节点「${newNode.label}」已添加`);
    pushUndo(`添加节点「${newNode.label}」`, async () => {
      await apiClient.delete(endpoints.nodes.delete(templateId, wfId, newNode.id));
      setTemplate((t) => ({
        ...t,
        status: t.status === 'Published' ? 'Draft' : t.status,
        workflows: t.workflows.map((w) =>
          w.id === wfId ? { ...w, nodes: (w.nodes || []).filter((n) => n.id !== newNode.id) } : w
        ),
      }));
    });
  };

  const handleNodeDeleted = (wfId, nodeId) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      workflows: t.workflows.map((w) =>
        w.id === wfId ? { ...w, nodes: (w.nodes || []).filter((n) => n.id !== nodeId) } : w
      ),
    }));
  };

  const handleNodeUpdated = (wfId, updatedNode) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      workflows: t.workflows.map((w) =>
        w.id === wfId ? { ...w, nodes: (w.nodes || []).map((n) => n.id === updatedNode.id ? updatedNode : n) } : w
      ),
    }));
    success(`节点「${updatedNode.label}」已更新`);
  };

  /* ── US-09: Edge CRUD callbacks ── */
  const handleEdgeAdded = (wfId, newEdge) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      workflows: t.workflows.map((w) =>
        w.id === wfId ? { ...w, edges: [...(w.edges || []), newEdge] } : w
      ),
    }));
    success('依赖边已创建');
    pushUndo('添加依赖边', async () => {
      await apiClient.delete(endpoints.edges.delete(templateId, wfId, newEdge.id));
      setTemplate((t) => ({
        ...t,
        status: t.status === 'Published' ? 'Draft' : t.status,
        workflows: t.workflows.map((w) =>
          w.id === wfId ? { ...w, edges: (w.edges || []).filter((e) => e.id !== newEdge.id) } : w
        ),
      }));
    });
  };

  const handleEdgeDeleted = (wfId, edgeId) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      workflows: t.workflows.map((w) =>
        w.id === wfId ? { ...w, edges: (w.edges || []).filter((e) => e.id !== edgeId) } : w
      ),
    }));
  };

  const handleEdgeUpdated = (wfId, updatedEdge) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      workflows: t.workflows.map((w) =>
        w.id === wfId ? { ...w, edges: (w.edges || []).map((e) => e.id === updatedEdge.id ? updatedEdge : e) } : w
      ),
    }));
  };

  /* ── US-10: Cross-flow dependency CRUD ── */
  const handleCrossFlowAdded = (dep) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      crossFlowDependencies: [...(t.crossFlowDependencies || []), dep],
    }));
    success('跨流程依赖已添加');
    pushUndo('添加跨流程依赖', async () => {
      await apiClient.delete(endpoints.crossFlow.delete(templateId, dep.id));
      setTemplate((t) => ({
        ...t,
        status: t.status === 'Published' ? 'Draft' : t.status,
        crossFlowDependencies: (t.crossFlowDependencies || []).filter((d) => d.id !== dep.id),
      }));
    });
  };

  const handleCrossFlowDeleted = (depId) => {
    setTemplate((t) => ({
      ...t,
      status: t.status === 'Published' ? 'Draft' : t.status,
      crossFlowDependencies: (t.crossFlowDependencies || []).filter((d) => d.id !== depId),
    }));
    success('跨流程依赖已删除');
  };

  /* ── US-05: Edit workflow — open dialog ── */
  const handleEditWorkflowClick = (wf) => setWfToEdit(wf);

  /* ── US-05: Edit workflow — save callback ── */
  const handleEditWorkflowSave = (updatedWf, triggersReset) => {
    setTemplate((t) => ({
      ...t,
      status: triggersReset && t.status === 'Published' ? 'Draft' : t.status,
      workflows: t.workflows.map((w) => w.id === updatedWf.id ? { ...w, ...updatedWf } : w),
    }));
    setWfToEdit(null);
    success('工作流已更新');
  };

  /* ── Render guard ── */
  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8c8c8c' }}>加载中…</div>;
  }
  if (!template) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ff4d4f' }}>模板不存在或已删除</div>;
  }

  const statusColor = TEMPLATE_STATUS_COLOR[template.status] || '#8c8c8c';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid #e8e8e8', background: '#fff', flexShrink: 0, flexWrap: 'wrap' }}>

        {/* Back button */}
        <button onClick={() => navigate('/templates')} style={btnGhost}>← 列表</button>

        {/* Template name */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {editingName && !isReadOnly ? (
            <>
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setNameValue(template.name); } }}
                autoFocus
                style={{ padding: '4px 8px', fontSize: 15, fontWeight: 600, border: `1px solid ${primaryColor}`, borderRadius: 4, outline: 'none', width: 240 }}
              />
              <button onClick={handleSaveName} style={{ ...btnPrimary(primaryColor), padding: '4px 12px' }}>保存</button>
              <button onClick={() => { setEditingName(false); setNameValue(template.name); }} style={{ ...btnGhost, padding: '4px 12px' }}>取消</button>
            </>
          ) : (
            <span
              style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', cursor: isReadOnly ? 'default' : 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}
              onClick={() => !isReadOnly && setEditingName(true)}
              title={isReadOnly ? template.name : `${template.name} — 点击编辑名称`}
            >
              {template.name}
              {!isReadOnly && <span style={{ marginLeft: 5, fontSize: 11, color: '#bfbfbf' }}>✏️</span>}
            </span>
          )}

          {/* Status badge */}
          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: statusColor, flexShrink: 0 }}>
            {TEMPLATE_STATUS_LABEL[template.status] || template.status}
          </span>

          {isReadOnly && (
            <span style={{ padding: '2px 8px', fontSize: 11, color: '#8c8c8c', background: '#f5f5f5', borderRadius: 4, border: '1px solid #e8e8e8', flexShrink: 0 }}>
              {TEMPLATE_CATEGORY_LABEL[template.category]} · 只读
            </span>
          )}
        </div>

        {/* Action buttons */}

        {/* US-16: Undo button */}
        {!isReadOnly && (
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title={undoStack.length > 0 ? `撤销：${undoStack[undoStack.length - 1].label}（Ctrl+Z）` : '无可撤销操作'}
            style={undoStack.length === 0 ? btnDisabled : btnGhost}
          >
            ↩ 撤销{undoStack.length > 0 ? `（${undoStack.length}）` : ''}
          </button>
        )}

        {/* US-01 (B-08): [查看版本] — disabled in MVP */}
        <button disabled title="版本对比功能即将推出" style={btnDisabled}>版本管理</button>

        {/* US-10: Cross-flow dependencies panel */}
        <button
          onClick={() => setShowCrossFlow(true)}
          style={btnOutline((template.crossFlowDependencies?.length ? primaryColor : '#8c8c8c'))}
          title="管理跨流程依赖"
        >
          跨流程（{template.crossFlowDependencies?.length ?? 0}）
        </button>

        <button onClick={() => navigate(`/templates/${templateId}/validate`)} style={btnOutline(primaryColor)}>
          验证模板
        </button>

        {isReadOnly ? (
          /* Standard template: only clone allowed */
          <button
            onClick={async () => {
              try {
                const res = await apiClient.post(endpoints.templates.clone(templateId), {});
                success('已创建副本，正在进入编辑…');
                navigate(`/templates/${res.data.newTemplateId}/editor`);
              } catch { error('克隆失败'); }
            }}
            style={btnPrimary(primaryColor)}
          >
            复制模板
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={template.status === 'Published'}
            style={template.status === 'Published' ? btnDisabled : btnPrimary(primaryColor)}
          >
            {template.status === 'Published' ? '已发布' : '发布模板'}
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Workflow sidebar */}
        <WorkflowPanel
          workflows={template.workflows || []}
          selectedWfId={selectedWfId}
          onSelect={setSelectedWfId}
          onAddWorkflow={() => setShowAddWf(true)}
          onDeleteWorkflow={handleDeleteWorkflowClick}
          onEditWorkflow={isReadOnly ? null : handleEditWorkflowClick}
          primaryColor={primaryColor}
          isReadOnly={isReadOnly}
        />

        {/* Workflow canvas: nodes + edges (US-06~09) */}
        <WorkflowCanvas
          workflow={selectedWf}
          templateId={templateId}
          primaryColor={primaryColor}
          isReadOnly={isReadOnly}
          onNodeAdded={(node) => handleNodeAdded(selectedWfId, node)}
          onNodeDeleted={(nodeId) => handleNodeDeleted(selectedWfId, nodeId)}
          onNodeUpdated={(node) => handleNodeUpdated(selectedWfId, node)}
          onEdgeAdded={(edge) => handleEdgeAdded(selectedWfId, edge)}
          onEdgeDeleted={(edgeId) => handleEdgeDeleted(selectedWfId, edgeId)}
          onEdgeUpdated={(edge) => handleEdgeUpdated(selectedWfId, edge)}
          onError={error}
          onSuccess={success}
        />
      </div>

      {/* ── Dialogs ── */}

      {/* US-01/15: Exit confirmation dialog */}
      {blocker.state === 'blocked' && (
        <ExitDialog
          onPublishAndClose={handlePublishAndClose}
          onCloseAsDraft={handleCloseAsDraft}
          onCancel={handleCancelExit}
          publishing={exitPublishing}
        />
      )}

      {/* US-03: Add workflow dialog */}
      {showAddWf && (
        <AddWorkflowDialog
          primaryColor={primaryColor}
          onConfirm={handleAddWorkflow}
          onCancel={() => setShowAddWf(false)}
        />
      )}

      {/* US-04: Delete workflow confirmation */}
      {wfToDelete && (
        <DeleteWorkflowDialog
          workflow={wfToDelete.wf}
          impact={wfToDelete.impact}
          onConfirm={handleDeleteWorkflowConfirm}
          onCancel={() => setWfToDelete(null)}
        />
      )}

      {/* US-10: Cross-flow dependencies panel */}
      {showCrossFlow && (
        <CrossFlowPanel
          template={template}
          primaryColor={primaryColor}
          isReadOnly={isReadOnly}
          onAdd={handleCrossFlowAdded}
          onDelete={handleCrossFlowDeleted}
          onClose={() => setShowCrossFlow(false)}
          onError={error}
        />
      )}

      {/* US-05: Edit workflow dialog */}
      {wfToEdit && (
        <EditWorkflowDialog
          workflow={wfToEdit}
          templateId={templateId}
          primaryColor={primaryColor}
          onSave={handleEditWorkflowSave}
          onCancel={() => setWfToEdit(null)}
          onError={error}
        />
      )}
    </div>
  );
}
