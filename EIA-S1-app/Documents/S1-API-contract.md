# S1 TemplateBC API Contract

**版本：** v1.1（校对版）  
**生成日期：** 2026-05-12  
**基准：** 真实代码（controllers + handlers + DTOs）+ SRS D01 v3.0 + BDD v3.0  
**覆盖范围：** 全部 MVP 业务需求（WF-L2-1 / WF-L2-2 / WF-L2-3）  
**说明：** WF-L2-4（版本管理页）所需回滚 API 为 Post-MVP，本文档仅列占位说明。

---

## 目录

1. [全局约定](#1-全局约定)
2. [枚举值参考](#2-枚举值参考)
3. [错误响应格式](#3-错误响应格式)
4. [Templates — 模板管理](#4-templates--模板管理)
5. [Workflows — 工作流管理](#5-workflows--工作流管理)
6. [Nodes — 节点管理](#6-nodes--节点管理)
7. [Edges — 流程内依赖边](#7-edges--流程内依赖边)
8. [CrossFlowDependencies — 跨流程依赖](#8-crossflowdependencies--跨流程依赖)
9. [业务规则与 ADR 摘要](#9-业务规则与-adr-摘要)
10. [UI 页面 → API 调用映射](#10-ui-页面--api-调用映射)

---

## 1. 全局约定

| 项目 | 约定 |
|------|------|
| Base URL | `https://{host}/api` |
| 内容类型 | `application/json` |
| 字段命名 | camelCase（JSON 序列化策略） |
| 时间格式 | ISO 8601 UTC，如 `2026-05-11T08:30:00Z` |
| 分页默认 | `page=1`，`pageSize=20` |
| HTTP 动词 | 创建=POST，全量替换=PUT，删除=DELETE，查询=GET |
| 注意 | 无 PATCH 端点；元数据更新用 PUT |

---

## 2. 枚举值参考

### 2.1 WorkflowCode — 请求值与 ID 映射

前端创建工作流时，`code` 字段传入下表「请求字符串」列的 snake_case 值（字符串，非整数）。

| 枚举名 | 请求字符串（snake_case） | 生成的 workflowId 前缀 | 默认 allowedPhaseCodes |
|--------|------------------------|----------------------|----------------------|
| `BusinessModeling` | `business_modeling` | `business_modeling` | Inception, Elaboration |
| `Requirements` | `requirements` | `requirements` | Inception, Elaboration |
| `AnalysisDesign` | `analysis_design` | `analysis_design` | Elaboration, Construction |
| `Implementation` | `implementation` | `implementation` | Construction |
| `Test` | `test` | `test` | Construction, Transition |
| `Deployment` | `deployment` | `deployment` | Transition |
| `ConfigChangeManagement` | `config_change_mgmt` | `config_change_mgmt` | Inception, Elaboration, Construction, Transition |
| `ProjectManagement` | `project_management` | `project_management` | Inception, Elaboration, Construction, Transition |
| `Environment` | `environment` | `environment` | Inception, Elaboration, Construction, Transition |

> **WorkflowId 全局唯一**（非模板内唯一）。同一模板内同 code 第二个工作流 ID 后缀为 `-2`，第三个为 `-3`，依此类推。删除后不复用，后缀只增不减。例：`requirements` → `requirements-2` → `requirements-4`（删除 `-2` 后再添加）。`-1` 后缀永远不会出现。

### 2.2 PhaseCode（字符串，非枚举）

| PhaseCode | 中文显示名 | Order |
|-----------|-----------|-------|
| `Inception` | 初始阶段 | 1 |
| `Elaboration` | 细化阶段 | 2 |
| `Construction` | 构建阶段 | 3 |
| `Transition` | 移交阶段 | 4 |

### 2.3 TemplateStatus

| 值 | 说明 | UI 显示颜色 |
|----|------|------------|
| `Draft` | 草稿编辑中 | 灰色 |
| `Published` | 已发布（可被项目引用） | 绿色 |
| `Archived` | 已归档（不可被新项目引用） | 灰色 |
| `ValidationFailed` | 验证失败 | 红色 |

### 2.4 TemplateCategory

| 值 | 说明 |
|----|------|
| `Standard` | 系统内置（只读，不可编辑/删除，仅可克隆） |
| `Custom` | 用户自定义 |

### 2.5 EdgeType（JSON 传字符串）

| 值 | 说明 | UI 样式 |
|----|------|---------|
| `Required` | 必须依赖 | 实线箭头（粗） |
| `Optional` | 可选依赖 | 虚线箭头（细） |

### 2.6 CompletionConditionType（JSON 传字符串）

| 值 | 说明 |
|----|------|
| `ManualConfirm` | 人工确认 |
| `MinDocuments` | 最少文档数（默认，config: `{"minDocuments":1}`） |
| `Checklist` | 清单完成 |

### 2.7 ValidationIssue.type 完整映射

| type 值 | severity | 中文含义 | 是否阻断发布 |
|---------|----------|---------|------------|
| `no_workflow` | Error | 无工作流 | 是 |
| `phase_out_of_range` | Error | 阶段不合法（节点 phaseCode 不在工作流允许范围内） | 是 |
| `cycle_detected` | Error | 循环依赖 | 是 |
| `empty_workflow` | Warning | 空工作流（0 节点） | 否 |
| `phase_disabled` | Warning | 节点引用的阶段已被 S0 禁用 | 否 |
| `doc_type_disabled` | Warning | 节点引用的 DocType 已被 S0 禁用 | 否 |
| `depth_exceeded` | Warning | 依赖深度超过 maxDepth | 否 |
| `isolated_node` | Warning | 孤立节点（无任何依赖边） | 否 |

---

## 3. 错误响应格式

### 标准错误

```json
{
  "success": false,
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "message": "Template 'abc' not found."
  }
}
```

### 验证失败错误（含 issues 数组）

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Template validation failed."
  },
  "issues": [
    {
      "severity": "Error",
      "type": "phase_out_of_range",
      "message": "节点「类图」的阶段 构建阶段(Construction) 不在工作流允许范围内",
      "workflowId": "requirements",
      "nodeId": "class-diagram",
      "details": "{\"phaseCode\":\"Construction\",\"allowedPhaseCodes\":[\"Inception\",\"Elaboration\"]}"
    }
  ]
}
```

### HTTP 状态码 → 错误码映射

| HTTP | error.code | 触发场景 |
|------|-----------|---------|
| 400 | `REQUEST_VALIDATION_FAILED` | 请求参数校验失败（如未知 WorkflowCode） |
| 403 | `TEMPLATE_READ_ONLY` | 操作 Standard 模板（ADR-042） |
| 404 | `TEMPLATE_NOT_FOUND` | 模板不存在 |
| 404 | `WORKFLOW_NOT_FOUND` | 工作流不存在 |
| 404 | `NODE_NOT_FOUND` | 节点不存在 |
| 404 | `DOC_TYPE_NOT_FOUND` | DocType 不存在于缓存 |
| 409 | `NODE_ALREADY_EXISTS` | 节点 ID 冲突 |
| 412 | `PRECONDITION_FAILED` | 状态前置条件不满足（如归档非 Published 模板） |
| 422 | `INVALID_STATUS_TRANSITION` | 状态机非法跳转 |
| 422 | `VALIDATION_FAILED` | 发布时验证失败（含 issues） |
| 422 | `PHASE_INVALID` | phaseCode 不合法 |
| 500 | `INTERNAL_SERVER_ERROR` | 未预期的服务器错误 |

---

## 4. Templates — 模板管理

Base: `GET|POST /api/templates`  
单体: `GET|PUT|POST /api/templates/{templateId}`

---

### 4.1 GET /api/templates — 模板列表

**用途：** WF-L2-1 模板列表页初始加载、筛选、分页

**Query 参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | string | — | 模糊匹配（contains） |
| `status` | string | — | `Draft`/`Published`/`Archived`/`ValidationFailed` |
| `category` | string | — | `Standard`/`Custom` |
| `sortBy` | string | `updatedAt` | `updatedAt`/`createdAt`/`name` |
| `sortOrder` | string | `desc` | `asc`/`desc` |
| `page` | int | 1 | 页码（1-based） |
| `pageSize` | int | 20 | 每页条数 |

**响应 200：**

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "标准RUP模板",
      "category": "Standard",
      "status": "Published",
      "estimatedDuration": "12months",
      "workflowCount": 9,
      "nodeCount": 45,
      "hasValidationReport": true,
      "validationReportValid": true,
      "createdAt": "2026-01-10T09:00:00Z",
      "updatedAt": "2026-04-22T14:00:00Z"
    }
  ],
  "total": 42
}
```

---

### 4.2 POST /api/templates — 新建模板

**用途：** WF-L2-1「＋ 新建模板」按钮

**请求体（全部可选）：**

```json
{
  "name": "我的模板",
  "description": "模板说明",
  "estimatedDuration": "6months"
}
```

> 若 `name` 为空，默认为 `"未命名RUP模板"`。  
> 创建时自动生成 `TemplateConfig`（maxDepth=6，autoValidateOnSave=true）。

**响应 201：**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

---

### 4.3 GET /api/templates/{templateId} — 模板详情（完整快照）

**用途：** WF-L2-2 编辑器加载时获取完整模板结构（工作流、节点、边、跨流程依赖）

**响应 200：**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "标准RUP模板",
  "category": "Standard",
  "status": "Published",
  "description": "标准RUP流程模板",
  "estimatedDuration": "12months",
  "config": {
    "id": "config-uuid",
    "maxDepth": 6,
    "autoValidateOnSave": true
  },
  "createdAt": "2026-01-10T09:00:00Z",
  "updatedAt": "2026-04-22T14:00:00Z",
  "workflows": [
    {
      "id": "requirements",
      "name": "需求工作流",
      "code": "requirements",
      "priority": 0,
      "description": null,
      "estimatedDuration": null,
      "allowedPhaseCodes": ["Inception", "Elaboration"],
      "nodes": [
        {
          "id": "vision",
          "fullId": "requirements.vision",
          "docTypeId": "dt-vision-uuid",
          "label": "愿景文档",
          "description": null,
          "phaseCode": "Inception",
          "priority": 0,
          "estimatedDuration": null,
          "positionX": 100,
          "positionY": 200,
          "completionConditionType": "MinDocuments",
          "completionConditionConfig": { "minDocuments": 1 },
          "checklistItems": [
            {
              "id": "ci-uuid",
              "text": "确认愿景范围",
              "docTypeBinding": null,
              "sequence": 1,
              "required": true
            }
          ]
        }
      ],
      "edges": [
        {
          "id": "edge-uuid",
          "source": "vision",
          "target": "use-case",
          "type": "Required",
          "label": null,
          "weight": 0,
          "notes": null
        }
      ]
    }
  ],
  "crossFlowDependencies": [
    {
      "id": "dep-uuid",
      "sourceWorkflowId": "requirements",
      "sourceNodeId": "vision",
      "sourceFullId": "requirements.vision",
      "targetWorkflowId": "analysis_design",
      "targetNodeId": "class-diagram",
      "targetFullId": "analysis_design.class-diagram",
      "type": "Required",
      "displayLabel": null,
      "description": null,
      "weight": 0,
      "notes": null
    }
  ]
}
```

---

### 4.4 PUT /api/templates/{templateId}/metadata — 更新模板元数据

**用途：** WF-L2-2 编辑器修改模板名称/描述/预计工期

**请求体（字段均可选，null 保持原值）：**

```json
{
  "templateId": "ignored-overridden-by-path",
  "name": "新名称",
  "description": "新描述",
  "estimatedDuration": "8months"
}
```

> ADR-046：此操作**不**将 Published 状态重置为 Draft（更新名称不影响发布状态）。

**响应 204 No Content**

---

### 4.5 POST /api/templates/{templateId}/validate — 执行验证

**用途：** WF-L2-2「验证模板」按钮，WF-L2-3「重新验证」按钮

**请求体：** 空（无需 body）

**验证执行顺序（Step 1→4，ADR-043）：**

| 步骤 | 内容 | 失败类型 |
|------|------|---------|
| Step 1 | 至少一个工作流 | Error（两种模式均直接返回） |
| Step 2 | 所有节点 phaseCode ∈ workflow.allowedPhaseCodes | Error（/publish 短路，/validate 继续） |
| Step 2b | 节点 phaseCode 是否被 S0 禁用 | Warning |
| Step 2c | 节点 docTypeId 是否被 S0 禁用 | Warning |
| Step 3 | 全局循环检测（maxDepth 由 config 控制） | Error（循环）/ Warning（超深） |
| Step 4 | 孤立节点检测（无任何依赖边） | Warning |

**响应 200：**

```json
{
  "valid": false,
  "issues": [
    {
      "severity": "Error",
      "type": "phase_out_of_range",
      "message": "节点「类图」的阶段 构建阶段(Construction) 不在工作流允许范围内",
      "workflowId": "requirements",
      "nodeId": "class-diagram",
      "details": "{\"phaseCode\":\"Construction\",\"allowedPhaseCodes\":[\"Inception\",\"Elaboration\"]}"
    },
    {
      "severity": "Warning",
      "type": "doc_type_disabled",
      "message": "节点「愿景文档」引用的 DocType「VisionDocument」已被禁用",
      "workflowId": "requirements",
      "nodeId": "vision",
      "details": "{\"docTypeId\":\"dt-uuid\",\"docTypeName\":\"VisionDocument\"}"
    },
    {
      "severity": "Warning",
      "type": "isolated_node",
      "message": "节点「补充规约」无任何依赖边，请确认是否需要建立依赖关系",
      "workflowId": "requirements",
      "nodeId": "supplementary-spec",
      "details": null
    }
  ]
}
```

> 验证结果同时持久化到 `ValidationReport`，可通过 `GET .../validation-report` 查询。

---

### 4.6 POST /api/templates/{templateId}/publish — 发布模板

**用途：** WF-L2-3「立即发布模板」按钮（验证通过后可用）

**请求体（可选）：**

```json
{
  "ifMatch": "optional-etag-for-optimistic-locking"
}
```

**响应 200（验证通过→发布成功）：**

```json
{
  "success": true,
  "templateStatus": null
}
```

**响应 422（验证失败→无法发布）：**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed."
  },
  "issues": [ ... ]
}
```

> 发布前自动运行验证（短路模式：首个 Error 即停止，Warning 不阻断）。验证结果持久化到 ValidationReport。

---

### 4.7 POST /api/templates/{templateId}/archive — 归档模板

**用途：** WF-L2-1「归档」操作

**前置条件：** 模板状态必须为 `Published`，否则 412。  
**请求体：** 无  
**响应 204 No Content**

---

### 4.8 POST /api/templates/{templateId}/restore — 恢复模板

**用途：** 归档后恢复为可编辑状态

**前置条件：** 模板状态必须为 `Archived`，否则 412。  
**请求体：** 无  
**响应 204 No Content**

> 恢复后状态为 **`Draft`**（不是 Published）。

---

### 4.9 POST /api/templates/{templateId}/clone — 克隆模板

**用途：** WF-L2-1「复制模板」，WF-L2-4「复制为新模板」

**请求体（可选）：**

```json
{
  "name": "自定义副本名称"
}
```

> 若 `name` 未传，默认为 `"{原名} - 副本"`（ADR-035，SRS §5.1）。  
> 克隆结果 `category=Custom`，`status=Draft`，`validationReport=null`。  
> 克隆使用 3 次重试机制处理 ID 冲突（ADR-035）。  
> Standard 模板**可以克隆**（克隆操作不受 ADR-042 保护）。

**响应 200：**

```json
{
  "newTemplateId": "new-uuid"
}
```

---

### 4.10 GET /api/templates/{templateId}/validation-report — 最新验证报告

**用途：** WF-L2-3 页面初始加载  
**无报告时响应：** 200 + `null`（不返回 404）

**响应 200（有报告）：**

```json
{
  "id": "report-uuid",
  "templateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "valid": false,
  "createdAt": "2026-04-22T14:30:00Z",
  "issues": [
    {
      "severity": "Error",
      "type": "phase_out_of_range",
      "message": "节点「类图」的阶段 构建阶段(Construction) 不在工作流允许范围内",
      "workflowId": "requirements",
      "nodeId": "class-diagram",
      "details": "{\"phaseCode\":\"Construction\",\"allowedPhaseCodes\":[\"Inception\",\"Elaboration\"]}"
    }
  ]
}
```

---

### 4.11 GET /api/templates/{templateId}/doc-types — 可用 DocType 列表

**用途：** WF-L2-2 左侧工具栏 DocType 拖拽库加载

**响应 200：**

```json
[
  {
    "id": "dt-vision-uuid",
    "code": "VISION",
    "name": "愿景文档",
    "allowedPhaseCodes": ["Inception", "Elaboration"]
  }
]
```

> 列表从 DocTypeCache（S0 治理中心 Kafka 同步）加载，按 code 字母升序排列。只返回 `isEnabled=true` 的 DocType。

---

## 5. Workflows — 工作流管理

Base: `/api/templates/{templateId}/workflows`

---

### 5.1 GET /api/templates/{templateId}/workflows — 工作流列表

**用途：** 获取模板下所有工作流的轻量列表（不含节点详情，按 priority 升序）

**响应 200：**

```json
[
  {
    "id": "requirements",
    "templateId": "3fa85f64-...",
    "name": "需求工作流",
    "code": "requirements",
    "priority": 0,
    "estimatedDuration": null,
    "description": null,
    "allowedPhaseCodes": ["Inception", "Elaboration"],
    "warnings": [],
    "createdAt": "2026-01-10T09:00:00Z",
    "updatedAt": "2026-01-10T09:00:00Z"
  }
]
```

---

### 5.2 POST /api/templates/{templateId}/workflows — 新建工作流

**用途：** WF-L2-2 新建工作流泳道

**请求体：**

```json
{
  "name": "需求工作流",
  "code": "requirements",
  "priority": 0,
  "estimatedDuration": null,
  "description": null
}
```

> `code` 传入 §2.1 表格「请求字符串」列的 snake_case 值（如 `"requirements"`，`"analysis_design"`）。  
> 创建时按 PhaseMapping 静态配置自动初始化 `allowedPhaseCodes`。  
> Standard 模板操作返回 403（ADR-042）。若模板为 Published 状态，自动重置为 Draft（ADR-024）。

**响应 201：**

```json
{
  "id": "requirements",
  "templateId": "3fa85f64-...",
  "name": "需求工作流",
  "code": "requirements",
  "priority": 0,
  "estimatedDuration": null,
  "description": null,
  "allowedPhaseCodes": ["Inception", "Elaboration"],
  "warnings": [],
  "createdAt": "2026-05-11T08:00:00Z",
  "updatedAt": "2026-05-11T08:00:00Z"
}
```

---

### 5.3 PUT /api/templates/{templateId}/workflows/{workflowId} — 更新工作流属性

**用途：** 修改工作流名称、优先级、描述、预计工期（不含 allowedPhaseCodes）

**请求体（字段均可选，null 保持原值）：**

```json
{
  "templateId": "ignored",
  "workflowId": "ignored",
  "name": "新名称",
  "priority": 1,
  "estimatedDuration": "3months",
  "description": "描述"
}
```

**响应 200：** WorkflowDto（同 §5.2）

---

### 5.4 DELETE /api/templates/{templateId}/workflows/{workflowId} — 删除工作流

**响应 204 No Content**

> 删除工作流时，数据库通过 CASCADE 级联删除其下所有节点（含 ChecklistItems）、流程内边。  
> 同时，所有以该工作流为 source 或 target 的跨流程依赖（CrossFlowDependency）也会级联删除。

---

### 5.5 PUT /api/templates/{templateId}/workflows/{workflowId}/phase-codes — 更新允许阶段

**用途：** WF-L2-2 修改工作流允许的阶段范围（ADR-024）

**请求体：**

```json
{
  "templateId": "ignored",
  "workflowId": "ignored",
  "phaseCodes": ["Inception", "Elaboration", "Construction"]
}
```

> 操作为**完全替换**（事务内：delete all → insert）。未知 phaseCode 跳过并记录 Warning（不报错，不插入）。  
> 建议先调用 §5.6 analyze-phase-change 预检受影响节点。

**响应 200：**

```json
{
  "success": true,
  "warnings": [
    {
      "type": "unknown_phase",
      "message": "PhaseCode 'NonExistentPhase' is not recognized and was skipped.",
      "phaseCode": "NonExistentPhase"
    }
  ]
}
```

---

### 5.6 GET /api/templates/{templateId}/workflows/{workflowId}/analyze-phase-change — 分析阶段变更影响

**用途：** 修改 allowedPhaseCodes 前预检哪些节点会受影响（节点 phaseCode 不在新集合中）

**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `newPhaseCodes` | string[] | 新的阶段集合（多值传递） |

示例：`?newPhaseCodes=Elaboration&newPhaseCodes=Construction`

**响应 200：**

```json
{
  "affectedNodes": [
    {
      "nodeId": "vision",
      "label": "愿景文档",
      "currentPhaseCode": "Inception"
    }
  ],
  "affectedCount": 1
}
```

---

### 5.7 GET /api/templates/{templateId}/workflows/{workflowId}/default-phase-code — 计算默认阶段

**用途：** WF-L2-2 拖入节点时计算 phaseCode 默认值（ADR-009）

**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `docTypeId` | string | DocType ID |

**计算规则：**  
`DocType.allowedPhaseCodes（来自 DocTypeCache）∩ Workflow.allowedPhaseCodes（来自数据库 WorkflowPhase 表）`，  
取交集后按 PhaseCache Order 升序排列，选 Order 最小的 phaseCode 作为默认值。  
- 若交集非空但默认 phaseCode 已被 S0 禁用，`warning` 字段非空（提示用户选择其他阶段）
- 若交集为空，前端应弹出手动选择对话框

**响应 200（有交集）：**

```json
{
  "hasIntersection": true,
  "phaseCode": "Elaboration",
  "allowedPhaseCodes": ["Elaboration", "Construction"],
  "warning": null
}
```

**响应 200（无交集）：**

```json
{
  "hasIntersection": false,
  "phaseCode": null,
  "allowedPhaseCodes": [],
  "warning": "No intersection between DocType allowed phases and workflow allowed phases."
}
```

---

## 6. Nodes — 节点管理

Base: `/api/templates/{templateId}/workflows/{workflowId}/nodes`

---

### 6.1 POST — 创建节点

**用途：** WF-L2-2 拖入 DocType 后创建节点（在 §5.7 计算 phaseCode 后调用）

**请求体：**

```json
{
  "templateId": "ignored",
  "workflowId": "ignored",
  "nodeId": "vision",
  "docTypeId": "dt-vision-uuid",
  "label": "愿景文档",
  "phaseCode": "Inception",
  "description": null,
  "priority": 0,
  "estimatedDuration": null,
  "positionX": 100,
  "positionY": 200,
  "completionConditionType": "MinDocuments",
  "completionConditionConfigJson": "{\"minDocuments\":1}",
  "checklistItems": [
    {
      "text": "确认愿景范围",
      "docTypeBinding": null,
      "sequence": 1,
      "required": true
    }
  ]
}
```

> `nodeId` 由**前端生成**（ADR-007），在同一工作流内唯一。  
> `fullId` = `{workflowId}.{nodeId}`，后端自动生成，不可由前端传入。  
> `completionConditionConfigJson` 为 **JSON 字符串**（非嵌套对象）。  
> `completionConditionType` 传 PascalCase 字符串：`"ManualConfirm"`/`"MinDocuments"`/`"Checklist"`。

**响应 201：** NodeDto

```json
{
  "id": "vision",
  "workflowId": "requirements",
  "fullId": "requirements.vision",
  "docTypeId": "dt-vision-uuid",
  "label": "愿景文档",
  "description": null,
  "phaseCode": "Inception",
  "priority": 0,
  "estimatedDuration": null,
  "positionX": 100,
  "positionY": 200,
  "completionConditionType": "MinDocuments",
  "completionConditionConfigJson": "{\"minDocuments\":1}",
  "checklistItems": [
    {
      "id": "ci-uuid",
      "text": "确认愿景范围",
      "docTypeBinding": null,
      "sequence": 1,
      "required": true
    }
  ],
  "createdAt": "2026-05-11T08:00:00Z",
  "updatedAt": "2026-05-11T08:00:00Z"
}
```

---

### 6.2 GET /{nodeId} — 节点详情

**响应 200：** NodeDto（同 §6.1）

---

### 6.3 PUT /{nodeId} — 更新节点

**用途：** WF-L2-2 属性面板（D1）编辑节点属性

**请求体（字段均可选，null 保持原值）：**

```json
{
  "templateId": "ignored",
  "workflowId": "ignored",
  "nodeId": "ignored",
  "label": "新标签",
  "phaseCode": "Elaboration",
  "description": "新描述",
  "priority": 1,
  "estimatedDuration": "1month",
  "positionX": 200,
  "positionY": 300,
  "completionConditionType": "Checklist",
  "completionConditionConfigJson": null,
  "checklistItems": [
    {
      "id": null,
      "text": "新清单项",
      "docTypeBinding": null,
      "sequence": 1,
      "required": true
    }
  ]
}
```

> `checklistItems` 若提供则**完全替换**（`id=null` 新增，`id` 非 null 更新现有项）。

**响应 200：** NodeDto

---

### 6.4 DELETE /{nodeId} — 删除节点

**响应 204 No Content**

> 删除节点时，同时删除：
> - 该节点的所有 ChecklistItems（数据库 CASCADE）
> - 同工作流内 `source=nodeId OR target=nodeId` 的边（`workflow_definition_id` 同时匹配，防止误删跨工作流同名节点的边）
> - 以该节点 fullId 为 source 或 target 的跨流程依赖（CrossFlowDependency）

---

### 6.5 POST /batch-delete — 批量删除节点

**请求体：**

```json
{
  "templateId": "ignored",
  "workflowId": "ignored",
  "nodeIds": ["vision", "use-case"]
}
```

> `nodeIds` 为工作流内 nodeId（非 fullId）；workflowId 已在 URL 路径中指定，查询时加 `workflow_definition_id` 条件防误删。  
> Draft 重置在循环外执行一次（ADR-032）。

**响应 200：**

```json
{
  "deletedCount": 2,
  "deletedNodeIds": ["vision", "use-case"]
}
```

---

### 6.6 GET /{nodeId}/suggest-edges — 推荐边

**用途：** 节点创建后推荐可建立依赖关系的相邻节点

**推荐逻辑：** 查询 DocTypeSource 表，若存在 `sourceDocTypeId=当前节点DocTypeId` 且 `targetDocTypeId=其他节点DocTypeId` 的关系记录，推荐边方向为：`targetDocType节点 → sourceDocType节点`（即前置 → 当前节点）。

**响应 200：**

```json
[
  {
    "sourceNodeId": "vision",
    "targetNodeId": "use-case",
    "edgeType": "Required"
  }
]
```

---

## 7. Edges — 流程内依赖边

Base: `/api/templates/{templateId}/workflows/{workflowId}/edges`

---

### 7.1 GET — 边列表

**响应 200：**

```json
[
  {
    "id": "edge-uuid",
    "workflowId": "requirements",
    "source": "vision",
    "target": "use-case",
    "type": "Required",
    "label": null,
    "weight": 0,
    "notes": null,
    "createdAt": "2026-05-11T08:00:00Z",
    "updatedAt": "2026-05-11T08:00:00Z"
  }
]
```

---

### 7.2 POST — 创建边

**用途：** WF-L2-2 在画布连接同一工作流的两个节点

**请求体：**

```json
{
  "templateId": "ignored",
  "workflowId": "ignored",
  "sourceNodeId": "vision",
  "targetNodeId": "use-case",
  "edgeType": "Required",
  "label": null,
  "weight": 0,
  "notes": null
}
```

> **建议先调用 §7.5 check-cycle 确认不成环，再创建边。**

**响应 201：** EdgeDto

---

### 7.3 PUT /{edgeId} — 更新边

**请求体（字段均可选）：**

```json
{
  "templateId": "ignored",
  "workflowId": "ignored",
  "edgeId": "ignored",
  "edgeType": "Optional",
  "label": "可选",
  "weight": 1,
  "notes": null
}
```

**响应 200：** EdgeDto

---

### 7.4 DELETE /{edgeId} — 删除边

**响应 204 No Content**

---

### 7.5 GET /check-cycle — 流程内循环检测

**用途：** WF-L2-2 连接边前实时检测是否会产生循环（ADR-019）

**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `sourceNodeId` | string | 起点节点 ID（工作流内 ID，非 fullId） |
| `targetNodeId` | string | 终点节点 ID |

示例：`GET .../edges/check-cycle?sourceNodeId=vision&targetNodeId=use-case`

**响应 200（无循环）：**

```json
{
  "hasCycle": false,
  "cyclePath": []
}
```

**响应 200（有循环）：**

```json
{
  "hasCycle": true,
  "cyclePath": [
    "requirements.vision",
    "requirements.use-case",
    "requirements.vision"
  ]
}
```

> `cyclePath` 中的每个元素为 `fullId`（`{workflowId}.{nodeId}` 格式）。  
> `maxDepth` 由 `TemplateConfig.maxDepth` 控制（默认 6）。深度超限不视为循环，但会在验证报告中产生 `depth_exceeded` 警告。

---

## 8. CrossFlowDependencies — 跨流程依赖

Base: `/api/templates/{templateId}/cross-flow-dependencies`

---

### 8.1 GET — 跨流程依赖列表

**用途：** WF-L2-2 画布渲染跨流程虚线边

**响应 200：**

```json
[
  {
    "id": "dep-uuid",
    "templateId": "3fa85f64-...",
    "sourceWorkflowId": "requirements",
    "sourceNodeId": "vision",
    "sourceFullId": "requirements.vision",
    "targetWorkflowId": "analysis_design",
    "targetNodeId": "class-diagram",
    "targetFullId": "analysis_design.class-diagram",
    "type": "Required",
    "displayLabel": null,
    "description": null,
    "weight": 0,
    "notes": null,
    "createdAt": "2026-05-11T08:00:00Z",
    "updatedAt": "2026-05-11T08:00:00Z"
  }
]
```

---

### 8.2 POST — 创建跨流程依赖

**用途：** WF-L2-2 连接不同工作流泳道的节点

**请求体：**

```json
{
  "templateId": "ignored",
  "sourceWorkflowId": "requirements",
  "sourceNodeId": "vision",
  "targetWorkflowId": "analysis_design",
  "targetNodeId": "class-diagram",
  "edgeType": "Required",
  "displayLabel": null,
  "description": null,
  "weight": 0,
  "notes": null
}
```

> **建议先调用 §8.5 check-cycle 确认不成环。**

**响应 201：** CrossFlowDependencyDto

---

### 8.3 PUT /{dependencyId} — 更新跨流程依赖

**请求体（字段均可选）：**

```json
{
  "templateId": "ignored",
  "dependencyId": "ignored",
  "edgeType": "Optional",
  "displayLabel": "可选依赖",
  "description": null,
  "weight": 1,
  "notes": null
}
```

**响应 200：** CrossFlowDependencyDto

---

### 8.4 DELETE /{dependencyId} — 删除跨流程依赖

**响应 204 No Content**

---

### 8.5 GET /check-cycle — 跨流程循环检测

**用途：** WF-L2-2 连接跨流程边前实时检测循环

**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `sourceWorkflowId` | string | 起点工作流 ID |
| `sourceNodeId` | string | 起点节点 ID |
| `targetWorkflowId` | string | 终点工作流 ID |
| `targetNodeId` | string | 终点节点 ID |

示例：`GET .../cross-flow-dependencies/check-cycle?sourceWorkflowId=requirements&sourceNodeId=vision&targetWorkflowId=analysis_design&targetNodeId=class-diagram`

**响应 200（无循环）：**

```json
{
  "hasCycle": false,
  "cyclePath": []
}
```

**响应 200（有循环）：**

```json
{
  "hasCycle": true,
  "cyclePath": [
    "requirements.vision",
    "analysis_design.class-diagram",
    "requirements.vision"
  ]
}
```

---

## 9. 业务规则与 ADR 摘要

| ADR | 规则 |
|-----|------|
| ADR-007 | nodeId 由前端生成，同一工作流内唯一；fullId = `{workflowId}.{nodeId}` 由后端拼接，不可传入 |
| ADR-009 | phaseCode 默认值计算：DocTypeCache.allowedPhaseCodes ∩ WorkflowPhase 表中的 phaseCodes，按 PhaseCache Order 升序取最小值 |
| ADR-019 | 连边前必须检测循环；maxDepth 由 TemplateConfig.maxDepth 控制（默认 6） |
| ADR-024 | UpdateWorkflowPhaseCodes 在事务内 delete-all + insert，未知 phaseCode 跳过并警告 |
| ADR-025 | docTypeId 无跨 BC 数据库外键约束；合法性由 DocTypeCache 在应用层校验 |
| ADR-032 | BatchDelete 在循环外执行一次 Draft 重置，避免多次重置 |
| ADR-035 | 克隆最多重试 3 次处理 ID 冲突；克隆结果 category=Custom，status=Draft，name="{原名} - 副本" |
| ADR-042 | Standard 模板（category=Standard）所有写操作返回 403，**但克隆、验证、循环检测等只读/特殊操作不受此限** |
| ADR-043 | validate 与 publish 共用验证流程，差异在 collectAll 参数：publish=false（短路），validate=true（收集所有） |
| ADR-044 | 删除节点时同步删除该工作流内涉及该节点的边（过滤 workflow_definition_id 防误删） |
| ADR-046 | PUT metadata 不重置 Published→Draft；其他结构写操作（工作流/节点/边 CUD）均自动重置为 Draft |

### 状态机

```
                     ┌──────────────────────────────────────────────────────────┐
                     │                      Draft                               │
                     │  ← 任何结构修改（工作流/节点/边 CUD）自动重置到此状态    │
                     └──────────────────────────────────────────────────────────┘
                        │ POST /publish（验证通过）          ↑
                        ▼                                    │ POST /restore
                   Published                          Archived
                        │ POST /archive（仅 Published 可归档）
                        ▼
                   Archived
         
         Draft ─(POST /publish 验证失败)→ 模板状态不变仍为 Draft，返回 422 + issues
         （注：不存在 ValidationFailed 的持久状态；发布失败模板保持 Draft 状态）
```

---

## 10. UI 页面 → API 调用映射

### WF-L2-1 模板列表页

| UI 操作 | API 调用 |
|---------|---------|
| 页面初始加载 | `GET /api/templates` |
| 搜索/筛选/排序 | `GET /api/templates?name=&status=&category=&sortBy=&sortOrder=&page=&pageSize=` |
| 点击「＋ 新建模板」 | `POST /api/templates` → 跳转 WF-L2-2 |
| 点击模板卡片 | `GET /api/templates/{id}` → 跳转 WF-L2-2 |
| 点击「复制模板」 | `POST /api/templates/{id}/clone` → 跳转 WF-L2-2（新模板） |
| 点击「验证模板」 | `GET /api/templates/{id}/validation-report` → 跳转 WF-L2-3 |
| 点击「归档」 | `POST /api/templates/{id}/archive` → 刷新列表 |

### WF-L2-2 模板编辑器

| UI 操作 | API 调用 |
|---------|---------|
| 编辑器加载 | `GET /api/templates/{id}`（完整快照，含所有工作流节点边） |
| 加载 DocType 工具箱 | `GET /api/templates/{id}/doc-types` |
| 新建工作流泳道 | `POST /api/templates/{id}/workflows`（code 传 snake_case 字符串） |
| 修改工作流属性 | `PUT /api/templates/{id}/workflows/{wfId}` |
| 修改工作流阶段（预检） | `GET /api/templates/{id}/workflows/{wfId}/analyze-phase-change?newPhaseCodes=...` |
| 修改工作流阶段（提交） | `PUT /api/templates/{id}/workflows/{wfId}/phase-codes` |
| 删除工作流 | `DELETE /api/templates/{id}/workflows/{wfId}` |
| 拖入节点（计算默认 phaseCode） | `GET /api/templates/{id}/workflows/{wfId}/default-phase-code?docTypeId=` |
| 拖入节点（保存） | `POST /api/templates/{id}/workflows/{wfId}/nodes` |
| 双击节点（加载详情） | `GET /api/templates/{id}/workflows/{wfId}/nodes/{nodeId}` |
| 保存节点属性 | `PUT /api/templates/{id}/workflows/{wfId}/nodes/{nodeId}` |
| 删除节点 | `DELETE /api/templates/{id}/workflows/{wfId}/nodes/{nodeId}` |
| 批量删除节点 | `POST /api/templates/{id}/workflows/{wfId}/nodes/batch-delete` |
| 连接边（前：循环检测） | `GET /api/templates/{id}/workflows/{wfId}/edges/check-cycle?sourceNodeId=&targetNodeId=` |
| 连接边（创建） | `POST /api/templates/{id}/workflows/{wfId}/edges` |
| 修改边属性 | `PUT /api/templates/{id}/workflows/{wfId}/edges/{edgeId}` |
| 删除边 | `DELETE /api/templates/{id}/workflows/{wfId}/edges/{edgeId}` |
| 连接跨流程边（循环检测） | `GET /api/templates/{id}/cross-flow-dependencies/check-cycle?sourceWorkflowId=&sourceNodeId=&targetWorkflowId=&targetNodeId=` |
| 连接跨流程边（创建） | `POST /api/templates/{id}/cross-flow-dependencies` |
| 修改跨流程依赖 | `PUT /api/templates/{id}/cross-flow-dependencies/{depId}` |
| 删除跨流程依赖 | `DELETE /api/templates/{id}/cross-flow-dependencies/{depId}` |
| 点击「验证模板」 | `POST /api/templates/{id}/validate` → 跳转 WF-L2-3 |
| 点击「保存模板」（= 发布） | `POST /api/templates/{id}/publish` |
| 修改模板名称/描述 | `PUT /api/templates/{id}/metadata` |

### WF-L2-3 模板验证结果页

| UI 操作 | API 调用 |
|---------|---------|
| 页面加载（首次进入） | `GET /api/templates/{id}/validation-report`（null 表示无报告） |
| 点击「重新验证」 | `POST /api/templates/{id}/validate` → 刷新页面 |
| 点击「立即发布模板」 | `POST /api/templates/{id}/publish` |

### WF-L2-4 版本管理页（Post-MVP）

> 版本管理（回滚 API `PUT /api/templates/{id}/rollback`）为 Post-MVP 功能，当前后端未实现。  
> MVP 阶段「查看版本」入口可保留但指向占位页，无对比和回滚操作。

---

## 附录 A：v1.0 → v1.1 校对修正记录

| 编号 | 分类 | v1.0 错误 | v1.1 修正 | 依据 |
|------|------|-----------|-----------|------|
| C-01 | 严重 | 所有多词工作流 ID 用连字符（`analysis-design`、`business-modeling`等） | 改为下划线（`analysis_design`、`business_modeling`等），与实际代码 PhaseMapping.cs 一致 | PhaseMapping.cs 实测 |
| C-02 | 严重 | `config-change-management` | 改为 `config_change_mgmt`（不是全拼） | PhaseMapping.cs |
| C-03 | 严重 | `BusinessModeling` 默认 phases 为 Inception, Elaboration, Construction | 改为 Inception, Elaboration（仅两个） | PhaseMapping.cs 实测 |
| C-04 | 严重 | 克隆默认名称 `"{原名} (副本)"` | 改为 `"{原名} - 副本"`，同步修正代码 | SRS D01 §5.1 |
| C-05 | 严重 | `non_standard_phase` 列为有效 issue type | 删除，该 type 在代码中不存在 | 实测 TemplateValidationOrchestrator |
| C-06 | 重要 | §2.7 缺少 `doc_type_disabled` | 新增（Warning，Step 2c 检测，不阻断发布） | 实测 TemplateValidationOrchestrator |
| C-07 | 重要 | WorkflowCode 请求字段说明不清晰（前端可能误用 PascalCase 或整数） | 明确：前端传 snake_case 字符串；控制器层负责转换（SnakeCaseToWorkflowCode） | D18 §2.3，实测 |
| C-08 | 中等 | 节点删除说明未提及 workflow_definition_id 过滤条件 | 补充说明防误删逻辑 | ADR-044，代码实测 |
| C-09 | 中等 | §5.7 phaseCode 计算数据源描述不精确 | 明确：Workflow.allowedPhaseCodes 取自数据库 WorkflowPhase 表，非 PhaseMapping 静态配置 | PhaseValidationService.cs |
| C-10 | 中等 | §6.6 推荐边方向逻辑未说明 | 补充：查 DocTypeSource 表，推荐方向为前置→当前节点 | SRS D01 §FR-04-4 |

## 附录 B：实际实现与 D18 v1.2 的差异（已在本文档中修正）

| 编号 | D18 v1.2 记录 | 实际实现 | 前端须知 |
|------|-------------|---------|---------|
| D18-01 | 更新元数据用 `PATCH` | 实际为 `PUT /metadata` | 必须使用 PUT |
| D18-02 | 循环检测为 `POST /check-cycle` 含 body | 实际为 `GET /edges/check-cycle?sourceNodeId=&targetNodeId=` | 改用 GET + Query |
| D18-03 | 跨流程循环检测未定义 | 实际为 `GET /cross-flow-dependencies/check-cycle` | 新接口，需实现 |
| D18-04 | Restore 后状态为 Published | 实际为 Draft | 刷新后展示 Draft |
| D18-05 | GET /templates/:id 仅返回 WorkflowSummary | 实际返回完整快照（含节点/边/依赖） | 一次加载，无需多次请求 |
| D18-06 | Clone 无 name 参数 | 实际接受 `{ name? }` body | 可传自定义副本名称 |
| D18-07 | ValidationReport 路径为 `/validation-reports/latest` | 实际为 `/validation-report`（单数，无 `/latest`） | 路径不同 |
| D18-08 | 无工作流列表 API | 实际新增 `GET /workflows` | 供下拉菜单等轻量场景使用 |
