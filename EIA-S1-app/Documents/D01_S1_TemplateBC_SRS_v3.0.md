# D01 · S1 Template BC 子系统需求规格说明书（SRS）

**文档编号：** D01  
**文档名称：** S1 Template BC 子系统需求规格说明书

---

## 目录

1. [子系统定位与边界](#1-子系统定位与边界)
2. [功能需求](#2-功能需求)
3. [业务规则](#3-业务规则)
4. [数据需求](#4-数据需求)
5. [事件触发行为](#5-事件触发行为)
6. [非功能需求](#6-非功能需求)
7. [外部依赖与接口边界](#7-外部依赖与接口边界)

---

## 1. 子系统定位与边界

### 1.1 系统定位

S1 Template BC（RUP Template Management & Validation）是 **RUP 模板的唯一设计与编排权威**。它负责 RUP 模板全生命周期管理，包括工作流定义、节点配置、依赖边编排、阶段一致性验证与循环检测。模板一旦发布（Published），作为不可变快照供 S2 ProjectFlow BC 引用以创建项目实例。

### 1.2 S1 拥有（Owns）

- `RUPTemplate`、`TemplateConfig`、`WorkflowDefinition`、`WorkflowPhase`、`FlowTemplateNode`、`ChecklistItem`、`FlowTemplateEdge`、`CrossFlowDependency`、`ValidationReport`、`ValidationIssue`、`DocTypeSource`、`template_processed_events` 的全生命周期
- 模板状态机（`Draft → Published → Archived / ValidationFailed`）
- 模板编辑器 UX 逻辑（操作历史 Undo/Redo、画布渲染驱动、错误导航）
- 循环检测算法（`CycleDetectionService`）
- 阶段（phaseCode）一致性验证逻辑（`PhaseValidationService`）
- `POST /api/templates/:id/check-cycle` API（被前端实时调用）
- Kafka 事件消费（订阅 S0 治理事件，维护本地缓存）

### 1.3 S1 不拥有（Does NOT Own）

- `PhaseDefinition` 权威数据（属于 S0，S1 只读缓存）
- `DocType` 权威数据（属于 S0，S1 只读缓存；但 `DocTypeSource` 关系数据属于 S1）
- 项目实例化（属于 S2）
- 用户账户与认证（属于 Auth BC / S0）

### 1.4 部署模式

MVP 阶段：单用户本地/私有部署，`AUTH_ENABLED=false`（默认），所有请求视为固定用户（id=`default-user`）。服务以独立 ASP.NET Core WebAPI 进程运行，连接共享 PostgreSQL 数据库实例。Kafka 消费者组名称通过 `appsettings.json` 配置，默认值：`template.doctype-cache`（DocType 事件）和 `template.phase-cache`（Phase 事件）。

### 1.5 技术栈

- **后端框架：** ASP.NET Core 9+ WebAPI
- **ORM：** EF Core 10 + Npgsql + EFCore.NamingConventions（自动 snake_case 列名映射）
- **数据库：** PostgreSQL 16+（与 S0 共享实例）
- **消息队列：** VZhen.Components.MessageQueue.Kafka v6.12.1（禁止直接使用 Confluent.Kafka）
- **编辑模式：** 即时写库（每次编辑操作独立调用 API）

### 1.6 写操作全局约束

所有写操作（POST/PATCH/PUT/DELETE）均遵守以下全局规则：

| 模板类型            | status 状态                               | 操作类型                                   | 行为                                                  |
| ------------------- | ----------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `category=Standard` | 任意                                      | 任意写操作（含 archive/restore）           | 返回 `403 TEMPLATE_READ_ONLY`                         |
| `category=Custom`   | `Published`                               | 内容类写操作（见下表）                     | 同一事务内将 `status` 自动重置为 `Draft`              |
| `category=Custom`   | `Published`                               | 元数据修改（仅`PATCH /api/templates/:id`） | **不触发**重置，`status` 保持 `Published`（C-03例外） |
| `category=Custom`   | `Draft` / `Archived` / `ValidationFailed` | 任意写操作                                 | 正常执行，不改变 status                               |

**内容类写操作（触发 Published→Draft 重置的完整列表）：**

| 接口                                                         | 是否触发重置       |
| ------------------------------------------------------------ | ------------------ |
| `PATCH /api/templates/:id`（name/description/estimatedDuration） | **否**（C-03例外） |
| `PATCH /api/templates/:id/workflows/:wfId`（任意字段）       | **是**             |
| `PATCH /api/templates/:id/workflows/:wfId/nodes/:nodeId`（任意字段） | **是**             |
| `PUT /api/templates/:id/workflows/:wfId/phase-codes`         | **是**             |
| `POST /api/templates/:id/workflows`                          | **是**             |
| `DELETE /api/templates/:id/workflows/:wfId`                  | **是**             |
| `POST /api/templates/:id/workflows/:wfId/nodes`              | **是**             |
| `DELETE /api/templates/:id/workflows/:wfId/nodes/:nodeId`    | **是**             |
| 所有边/依赖相关写操作                                        | **是**             |

> **C-03例外：** `PATCH /api/templates/:id` 对 `name/description/estimatedDuration` 的修改是唯一不触发 Published→Draft 重置的写操作。此接口的 Handler **不调用** `ResetToDraftIfPublishedAsync`，直接更新元数据字段，status 始终保持原值不变。此例外对 Draft/Published/Archived/ValidationFailed 所有状态均成立。对 `status=Archived` 的模板调用此接口修改元数据，正常执行，`status` 保持 `Archived` 不变。

---

## 2. 功能需求

### FR-01 模板基础管理

#### FR-01-1 创建新模板

- 用户从模板列表页发起创建空白模板，进入模板编辑器
- 新模板初始状态：`name="未命名RUP模板"`，`status=Draft`，`category=Custom`，`workflows=[]`，`crossFlowDependencies=[]`
- **`category` 字段强制为 `Custom`：** 即使请求体传入 category 字段，后端静默忽略，始终使用 `Custom`
- 系统自动为新模板创建一条关联的 `TemplateConfig` 记录（`maxDepth=6`，`autoValidateOnSave=true`）
- 模板名称可随时编辑，变更通过 `PATCH /api/templates/:id` 即时写库，不触发验证，不改变 status

#### FR-01-2 编辑现有模板

- 编辑器加载时渲染所有 `WorkflowDefinition`、`WorkflowPhase`、`FlowTemplateNode`、`FlowTemplateEdge`、`CrossFlowDependency`
- `category=Standard` 的模板以只读方式显示，所有写操作在 Handler 层返回 `403 TEMPLATE_READ_ONLY`，仅提供 [复制] 入口
- **自动重置 Draft**：对 `status=Published` 的 Custom 模板执行内容类写操作时，后端在同一事务内将 `status` 自动重置为 `Draft`

#### FR-01-3 克隆模板

- 对任意模板（含 category=Standard）可执行克隆
- 克隆结果：新模板 `category=Custom`，`status=Draft`，`name="{原名称} - 副本"`，`validationReport=null`
- 克隆范围：深度复制 `WorkflowDefinition`（含 `WorkflowPhase`）、`FlowTemplateNode`（含 `ChecklistItem`）、`FlowTemplateEdge`、`CrossFlowDependency`、`TemplateConfig`
- 克隆**不复制** `ValidationReport`
- **克隆 ID 映射规则：**
  - 新模板生成新 UUID
  - 新 `WorkflowDefinition.id` 通过 `WorkflowIdGenerator` 生成：在事务外**按顺序**为每个 workflow 生成候选 ID；当同一 baseCode 在批次内出现多次时，后续候选 ID 在前一个候选 ID 的数字后缀基础上递增（内存内去重，不重复查库），避免批次内重复；然后开启单一事务执行全部插入；若 PK 冲突，整个事务回滚后外层最多重试 3 次
  - 新 `FlowTemplateNode.id` 保留原值（在新工作流内仍满足唯一性）
  - 新 `FlowTemplateEdge` 的 `workflowDefinitionId` 映射到新工作流 ID，`source`/`target` 保留原节点 ID
  - 新 `CrossFlowDependency` 的 `sourceWorkflowId`/`targetWorkflowId` 映射到新工作流 ID，`fullId` 重新拼接
  - 整个克隆操作（ID生成之外的所有写入）在单一事务内完成

#### FR-01-4 归档与恢复模板

- 用户可将 `status=Published` 的自定义模板归档（`→ Archived`）；若当前 status 不是 `Published`，返回 `422 INVALID_STATUS_TRANSITION`
- `category=Standard` 模板的归档操作返回 `403 TEMPLATE_READ_ONLY`（先于状态校验执行）
- 归档后该模板从模板选择列表中隐藏
- 支持将 `status=Archived` 的模板恢复为 `Published`；若当前 status 不是 `Archived`，返回 `422 INVALID_STATUS_TRANSITION`
- `category=Standard` 模板的恢复操作返回 `403 TEMPLATE_READ_ONLY`（先于状态校验执行）
- **Archived 模板写操作规则：**
  - 元数据修改（`PATCH /api/templates/:id`）：允许，status 保持 Archived
  - 内容类写操作：后端不拒绝，行为与 Draft 相同（不改变 status，因 `ResetToDraftIfPublishedAsync` 仅处理 Published 状态）
  - 前端 UI 层应提示用户先恢复再编辑，但后端不强制

#### FR-01-5 模板列表展示

- 支持按名称模糊搜索
- 支持按分类（Standard/Simplified/Agile/Custom）、状态（Draft/Published/Archived）过滤
- 支持按创建时间、更新时间、名称排序
- 分页：默认每页 20 条，最大 100 条
- 响应字段（摘要）：`id`、`name`、`category`、`status`、`estimatedDuration`、`workflowCount`、`hasValidationReport`、`validationReportValid`、`createdAt`、`updatedAt`

---

### FR-02 工作流管理

#### FR-02-1 新增工作流

- 用户选择 RUP 九大工作流类型之一添加到当前模板
- 系统根据 `PhaseMapping` 静态配置为新工作流初始化默认 `WorkflowPhase[]`

**WorkflowDefinition.id 生成规则（ADR-013）：**

- 以 WorkflowCode snake_case 值为基础（如 `requirements`）
- 查询同一模板下以该 baseCode 精确匹配（`id == baseCode` 或 `id.StartsWith(baseCode + "-")`）的所有现存 ID，提取后缀数字；无后缀的记录（即 `id == baseCode`）视为后缀值 1
- 取所有后缀值中的最大值 M，候选 ID 后缀为 `-(M+1)`；若尚无任何同 baseCode 记录，则首个 ID 直接为 baseCode（无后缀）
- **序列说明：** 由于首个 ID 无后缀（视为后缀值 1），第二个 ID 后缀为 `-2`，即序列为 `requirements` → `requirements-2` → `requirements-3`。`-1` 后缀永远不会出现，这是有意设计（删除不复用，后缀只增不减）
- 后缀必须为纯数字（非纯数字后缀的 ID 在匹配时忽略），删除后不复用，后缀只增不减
- 采用**乐观重试 + PK 冲突捕获**策略，重试在调用方 Handler 的外层循环中实现（最多 5 次，超出时返回 500）

> **ADR-027 精确前缀匹配：** `id == baseCode || id.StartsWith(baseCode + "-")`，避免 `"test"` 误匹配 `"test-environment"` 等 ID（`"environment"` 非纯数字，`TryExtractSuffix` 返回 null，被正确过滤）。

**RUP 九大工作流 PhaseMapping 静态配置（代码内硬编码）：**

| WorkflowCode 枚举值      | 数据库存储值（snake_case） | 允许的 phaseCode 列表                            |
| ------------------------ | -------------------------- | ------------------------------------------------ |
| `BusinessModeling`       | `business_modeling`        | Inception, Elaboration                           |
| `Requirements`           | `requirements`             | Inception, Elaboration                           |
| `AnalysisDesign`         | `analysis_design`          | Elaboration, Construction                        |
| `Implementation`         | `implementation`           | Construction                                     |
| `Test`                   | `test`                     | Construction, Transition                         |
| `Deployment`             | `deployment`               | Transition                                       |
| `ConfigChangeManagement` | `config_change_mgmt`       | Inception, Elaboration, Construction, Transition |
| `ProjectManagement`      | `project_management`       | Inception, Elaboration, Construction, Transition |
| `Environment`            | `environment`              | Inception, Elaboration, Construction, Transition |

#### FR-02-2 删除工作流

- 删除前显示影响清单（节点数、流程内依赖边数、跨流程依赖数）
- 用户确认后，单一事务内按以下顺序显式删除（数据库 CASCADE 处理子实体）：
  1. 删除 `CrossFlowDependency`（涉及该工作流的所有跨流程依赖）
  2. 删除 `FlowTemplateEdge`（该工作流的所有流程内边）
  3. 删除 `FlowTemplateNode`（数据库 CASCADE 自动删除关联的 `ChecklistItem`）
  4. 删除 `WorkflowPhase`
  5. 删除 `WorkflowDefinition`
- 对 Published Custom 模板执行此操作，同一事务内重置 `status=Draft`

#### FR-02-3 编辑工作流属性与阶段范围

- 可编辑字段：`name`、`description`、`priority`、`estimatedDuration`（均触发 Published→Draft 重置）
- 可修改工作流允许的阶段范围（`WorkflowPhase[]`）
- 修改阶段范围前，调用 `POST /analyze-phase-change` 分析受影响节点，弹出确认对话框
- **WorkflowPhase 更新策略：** 先删后插，通过 `WorkflowPhaseRepository.UpsertPhaseCodesAsync()` 统一执行，内部逻辑：
  - 先执行 `ExecuteDeleteAsync` 删除该工作流所有现有 `WorkflowPhase` 记录（在当前事务范围内，Rollback 时一并回滚）
  - 逐条检查 PhaseCache 存在性：不存在于 PhaseCache 的 phaseCode 跳过插入，并在响应体的 `warnings` 字段中记录 Warning（type: `phase_not_found`）
  - 存在但 `isActive=false`：允许插入，在保存时（`POST /publish` Step 2b）产生 Warning
  - 本方法不含内部 `SaveChangesAsync`，由调用方 Handler 统一提交事务（ADR-024）
- **`PUT /phase-codes` 的二级校验：** 传入的 phaseCode 必须在该 WorkflowCode 对应的 `PhaseMapping` 允许范围内，否则返回 `422 PHASE_INVALID`
- **`PUT /phase-codes` 响应警告：** 操作成功后，若部分 phaseCode 不存在于 PhaseCache，响应体中包含 `warnings` 数组（含 type=`phase_not_found` 的 Warning 条目），**这些 Warning 不写入 ValidationReport**

#### FR-02-4 分析阶段变更影响

- 接口：`POST /api/templates/:id/workflows/:wfId/analyze-phase-change`
- 请求体：`{ newPhaseCodes: string[] }`
- 返回当前工作流中 phaseCode 将超出新范围的节点列表（节点 id、label、当前 phaseCode）
- **纯只读查询，不写库，不触发 Draft 重置**
- 前端据此在确认对话框中提示用户

---

### FR-03 节点管理

#### FR-03-1 拖拽添加节点

- 用户从左侧 DocType 库拖拽节点到目标工作流区域
- **FlowTemplateNode.id 规则（ADR-007）：** 由**前端命名后传入**，后端校验工作流内唯一性；格式：kebab-case 字符串，字符集 `[a-z0-9-]`，长度 1～128；重复时返回 `409 NODE_ALREADY_EXISTS`
- `phaseCode` 为**必填字段**，前端在调用本接口前须已确认 phaseCode（交集为空时弹出手动选择对话框，用户取消则不调用本接口）；后端若收到空值或缺失 phaseCode 则返回 `400 VALIDATION_ERROR`
- 系统提供 `GET /api/templates/:id/workflows/:wfId/default-phase-code?docTypeId={docTypeId}` 接口，调用 `PhaseValidationService.GetDefaultPhaseCode()` 计算默认 phaseCode 供前端展示：
  - 计算 `DocType.AllowedPhaseCodes ∩ Workflow.allowedPhaseCodes`（字符串集合交集）
  - **Workflow.allowedPhaseCodes 取自数据库 `WorkflowPhase` 表**（该工作流已保存的 phaseCode 列表，不使用 PhaseMapping 静态配置）
  - 有交集：调用 `PhaseCache.GetMinOrderPhaseCode()` 按 `Order` 升序取最小值（不区分 isActive，返回最小 Order 的 phaseCode）；若该值 `isActive=false`，`PhaseValidationService` 仍使用此值但产生 Warning
  - 无交集：返回 `{ hasIntersection: false }`，前端弹出手动选择对话框；用户取消则操作中止，不调用创建节点接口
- 节点创建默认值：`completionConditionType=MinDocuments`，`completionConditionConfigJson={"minDocuments":1}`，`priority=0`
- 节点 `label` 默认取 `DocType.Name`；`fullId` 格式：`{workflowDefinitionId}.{nodeId}`

#### FR-03-2 编辑节点属性

- 可编辑字段：`label`、`description`、`phaseCode`、`priority`、`estimatedDuration`、`completionConditionType`、`completionConditionConfig`
- 修改 `phaseCode` 时调用 `PhaseValidationService.ValidateNodePhaseCode()` 实时验证
- **phaseCode 合法性验证数据源：** 以数据库 `WorkflowPhase` 表中的 allowedPhaseCodes 为准（动态），非 PhaseMapping 静态配置
- **完成条件配置存储规则（ADR-019）：**

| completionConditionType | 数据库 completionConditionConfigJson | API响应 completionConditionConfig |
| ----------------------- | ------------------------------------ | --------------------------------- |
| `ManualConfirm`         | `NULL`                               | `null`                            |
| `MinDocuments`          | `{"minDocuments":N}`                 | `{"minDocuments":N}`              |
| `Checklist`             | `NULL`                               | `null`                            |

- `completionConditionType` 变更为 `Checklist` 时，`ChecklistItem` 先删后插（事务内）；`Checklist` 类型节点**保存时**必须包含至少一条 `ChecklistItem`，否则返回 `400 VALIDATION_ERROR`（ADR-036b）
- `completionConditionType` 变更时：
  - → `ManualConfirm`：清空 ChecklistItem，设 configJson=NULL
  - → `MinDocuments`：清空 ChecklistItem，写入 configJson
  - → `Checklist`：清空 configJson（NULL），ChecklistItem 由请求体传入；若 ChecklistItem 为空则拒绝请求

#### FR-03-3 删除节点

- 删除前显示依赖统计
- 单节点删除事务顺序：
  1. 删除 `FlowTemplateEdge`（**必须同时过滤 workflow_definition_id**：`WHERE workflow_definition_id=@wfId AND (source=@nodeId OR target=@nodeId)`）
  2. 删除关联 `CrossFlowDependency`（通过 fullId 匹配）
  3. 删除 `FlowTemplateNode`（数据库 CASCADE 自动删除关联的 `ChecklistItem`）
- 批量删除：请求体格式 `{ fullIds: string[] }`（每个 fullId 格式为 `{workflowId}.{nodeId}`）。**先对整个模板执行一次 ResetToDraftIfPublishedAsync，再逐节点独立事务**，部分失败不回滚已成功项；fullId 格式解析失败记入 failedNodes

---

### FR-04 流程内依赖边管理

#### FR-04-1 添加流程内依赖边

- **双重循环检测机制：**
  - 前端预检：调用 `POST /api/templates/:id/check-cycle`（传入 tempEdge），用于 UX 反馈
  - 后端强制：`POST /edges` 持久化前，**通过进程内调用 `CycleDetectionService.DetectCycleAsync()`** 执行循环检测，不通过 HTTP 自调用
  - 两层均为必要，临时边**永远不写库**
- `hasCycle=true`：后端返回 `422 CYCLE_DETECTED`，不写库
- `depthExceeded=true`：返回 Warning，由前端决定是否继续

#### FR-04-2 编辑流程内依赖边

- 可编辑字段：`type`（Required/Optional）、`label`、`weight`、`notes`
- 所有编辑均触发 Published→Draft 重置
- 边的 `source` / `target` 不可修改（不可变），如需调整方向需删除后重建

#### FR-04-3 删除流程内依赖边

- 单条删除，事务内执行
- 删除时触发 Published→Draft 重置

#### FR-04-4 智能连接（批量推荐边）

- 针对同一工作流内选中的多个节点，推荐可能的依赖边；跨工作流框选时功能不可用
- 接口：`POST /api/templates/:id/workflows/:wfId/suggest-edges`，请求体：`{ selectedNodeIds: string[] }`（工作流内节点 ID 列表，至少 2 个）
- **Standard 模板同样可调用本接口**（只读操作，不受 Standard 守卫拦截）
- 推荐逻辑：查询 `DocTypeSource` 表，找到所选节点 DocType 之间存在的依赖关系记录
- 推荐边方向：`targetDocTypeId 对应节点 → sourceDocTypeId 对应节点`（前置→后置）
- 过滤已存在的边（`FlowTemplateEdge` 中已有完全相同 source+target 的边不重复推荐；**反向边不过滤**，由后续循环检测处理）
- 返回推荐边列表供前端展示，用户确认后逐条调用 `POST /edges`；后端对每条边强制执行循环检测再持久化

---

### FR-05 跨流程依赖边管理

#### FR-05-1 添加跨流程依赖

- 前端预检（传入 tempDependency）+ 后端进程内强制循环检测
- **displayLabel 规则（ADR-005）：** 由前端拼接后通过请求体传入，后端不自动生成；字段可空，最大长度 512 字符；格式建议（前端执行，非强制）：`{sourceWorkflowName}.{sourceNodeLabel} → {targetWorkflowName}.{targetNodeLabel}`

#### FR-05-2 编辑跨流程依赖

- 可编辑字段：`type`、`displayLabel`、`description`、`notes`
- 触发 Published→Draft 重置

#### FR-05-3 删除跨流程依赖

- 支持单条删除和批量删除
- 均触发 Published→Draft 重置
- 批量删除请求体格式：`{ ids: string[] }`（依赖记录的主键 UUID 列表）
- 批量删除：先对模板执行一次 ResetToDraftIfPublishedAsync，再逐条独立事务执行删除；部分失败不回滚已成功项

#### FR-05-4 查询跨流程依赖

- 接口：`GET /api/templates/:id/cross-flow-dependencies`
- 返回模板下全部跨流程依赖列表
- 支持按 `sourceWorkflowId`、`targetWorkflowId` 过滤（可选查询参数）
- 无分页（单模板内依赖数量有界）

---

### FR-06 模板保存与全局验证

#### FR-06-1 保存流程（7步串行执行）

用户点击 [保存] 按钮，前端调用 `POST /api/templates/:id/publish`，后端按以下顺序串行执行：

**前置校验（进入7步前）：**

- `category=Standard` 模板返回 `403 TEMPLATE_READ_ONLY`（先于状态校验执行）
- 模板 `status` 必须为 `Draft`；若为 `Archived`、`Published` 或 `ValidationFailed`，返回 `422 INVALID_STATUS_TRANSITION`（ADR-020）

| Step | 操作                                                         | 级别          | 失败行为                                        |
| ---- | ------------------------------------------------------------ | ------------- | ----------------------------------------------- |
| 1    | 工作流完整性验证（至少一个工作流；空工作流检查）             | Error/Warning | 无工作流→阻断返回422；空工作流→Warning，不阻断  |
| 2    | phaseCode 一致性验证（`ValidateTemplatePhaseConsistency`，基于数据库 WorkflowPhase） | Error         | 阻断，返回422                                   |
| 2b   | 已禁用 phaseCode 检测（`CheckDisabledPhaseCode`）            | Warning       | 不阻断，生成 issue（type: `phase_disabled`）    |
| 2c   | 已禁用 DocType 检测（`CheckDisabledDocType`）                | Warning       | 不阻断，生成 issue（type: `doc_type_disabled`） |
| 3    | 全局循环检测（**进程内调用 CycleDetectionService**，无临时边） | Error/Warning | hasCycle→阻断；depthExceeded→Warning，可继续    |
| 4    | 孤立节点检查（含单节点工作流中的节点，无例外）               | Warning       | 可继续                                          |
| 5    | 事务持久化                                                   | —             | 失败回滚                                        |

**验证阶段短路规则（/publish 专用）：**

- Step 1 发现 `no_workflow` Error → 立即返回 422，后续步骤（1b~4）全部跳过
- Step 2 发现任意 Error → 收集全部 Step 2 phaseCode 错误后返回 422，**Step 2b/2c/3/4 全部跳过**（设计意图：phaseCode 错误必须先修复，混合返回 Warning 会增加干扰；完整问题视图请用 `/validate` 接口）
- Step 3 发现 `hasCycle` Error → 立即返回 422，Step 4 跳过
- Step 2 和 Step 3 仅有 Warning → 继续执行后续步骤，最终进入 Step 5

**Step 5 持久化详细规则：**

即时写库模式下，工作流/节点/边在编辑阶段已写入数据库，Step 5 **只执行以下操作**：

```sql
BEGIN TRANSACTION
  a. UPDATE rup_template SET status='Published', updated_at=NOW() WHERE id=X
  b. DELETE FROM validation_report WHERE template_id=X
  c. INSERT INTO validation_report (id, template_id, valid, created_at)
     -- valid 值由 validationResult.Valid 计算（无 Error 级问题则为 true）
  d. FOR EACH warning in allWarnings:
       INSERT INTO validation_issue (...)
COMMIT
```

- **不执行** UPSERT workflow_definition / flow_template_node / flow_template_edge / cross_flow_dependency
- **只有 Step 5 事务成功提交后，才写入 ValidationReport**
- Step 1/2/3 有 Error 时返回 422，**不写 ValidationReport**（旧报告保持不变）
- ValidationReport DELETE + INSERT 均在同一事务内

**422 响应体字段名规范：**

使用 `validationResult`（瞬时结果），不用 `validationReport`（持久化实体）：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "模板验证未通过",
    "details": {
      "validationResult": {
        "valid": false,
        "issues": []
      }
    }
  }
}
```

**并发保护：**
`POST /api/templates/:id/publish` 支持可选乐观锁，通过 `If-Match` 请求头传入 ISO 8601 毫秒精度 UTC 时间戳字符串（如 `"2026-04-22T10:00:00.123Z"`）；传入时服务端将其解析为 `DateTimeOffset` 后与数据库 `updatedAt` 比较，两者差值绝对值 ≥ 1ms 则视为不匹配；不传入时跳过版本校验；不匹配返回 `412 PRECONDITION_FAILED`。

---

### FR-07 循环检测服务

#### FR-07-1 检测接口与实现

- 提供 `POST /api/templates/:id/check-cycle` REST 接口，**Controller 内部调用 `CycleDetectionService.DetectCycleAsync()`**
- 后端 `POST /edges`、`POST /cross-flow-dependencies`、`POST /publish Step3` 均**通过进程内调用**同一 `CycleDetectionService`，不走 HTTP 自调用
- `CycleDetectionService` 注册为 **Scoped**（随请求生命周期，共享 DbContext）

**CycleDetectionService 方法签名（单一方法，ADR-016）：**

```csharp
public async Task<CycleDetectionResult> DetectCycleAsync(
    string templateId,
    FlowTemplateEdge? tempEdge = null,
    CrossFlowDependency? tempDependency = null,
    CancellationToken ct = default);
```

调用场景：

| 调用场景                            | tempEdge | tempDependency |
| ----------------------------------- | -------- | -------------- |
| 添加流程内边（前端预检/后端强制）   | 传入     | null           |
| 添加跨流程依赖（前端预检/后端强制） | null     | 传入           |
| 保存时全局检测（Step 3）            | null     | null           |
| POST /validate 内部调用             | null     | null           |

方法内部防御性校验：`tempEdge != null && tempDependency != null` 时抛出 `ArgumentException`。

#### FR-07-2 检测算法

- 构建全局邻接表（所有工作流的 `FlowTemplateEdge` + 所有 `CrossFlowDependency` + 可选临时边），使用 `fullId` 统一标识节点
- **fullId 拼接：** 在内存中直接拼接，无需额外 join：`sourceFullId = $"{edge.WorkflowDefinitionId}.{edge.Source}"`
- Required 和 Optional 类型的边均参与循环检测
- 使用 DFS 算法，从 depth=0 开始，`maxDepth` 从 `TemplateConfig.maxDepth` 读取（默认6）
- **depth 语义：** depth=0 表示起始节点，depth=N 表示经过 N 条边到达的节点；maxDepth=6 表示允许最多经过 6 条边（链路中最多 7 个节点）；当 `depth > maxDepth` 时触发 `depthExceeded`
- 返回：`{ hasCycle, cyclePath?, depthExceeded?, configuredMaxDepth, actualDepthReached }`
  - `configuredMaxDepth`：TemplateConfig 中配置的最大允许边数（默认 6）
  - `actualDepthReached`：DFS 实际触达的最大 depth 值；`depthExceeded=true` 时该值大于 `configuredMaxDepth`

---

### FR-08 模板验证报告

#### FR-08-1 POST /validate 接口

- 执行**完整验证逻辑**（7步中的全部前4步验证，不执行Step5持久化）
- **不持久化任何数据**，`ValidationReport` 数据库表不写入、不修改
- 返回瞬时 `ValidationResult` 对象（非持久化实体），包含所有步骤收集到的 Issue
- 响应字段名使用 `validationResult`（非 `validationReport`）
- 对任意状态（Draft/Published/Archived/ValidationFailed）及 **category=Standard** 的模板均可调用（语义：预检工具，只读操作）
- **验证步骤执行策略：**
  - Step 1 发现 `no_workflow` → 两种模式（/validate 与 /publish）均提前返回。理由：无工作流时后续步骤操作对象为空（无节点可检查、无边可检测），继续执行无增量信息价值
  - `/validate` 遇到 `no_workflow` 以外的情况：**全程不短路**，所有 4 步均执行并收集全部 Issue（含 Error 和 Warning），提供最完整的问题视图
  - `/validate` 与 `/publish` 共同规则：`hasCycle=true` 时跳过 Step 4（循环图中孤立节点检测无意义）
  - `/publish` 专用短路：Step 2 有 Error 时，2b/2c/3/4 全部跳过

#### FR-08-2 GET /validation-reports/latest

- 若模板存在但无 ValidationReport，返回 `200 { "success": true, "data": null }`，语义为"尚无验证报告"
- 若模板不存在，返回 `404 TEMPLATE_NOT_FOUND`

#### FR-08-3 ValidationReport 唯一性规则

- 每个模板最多保留一条（数据库 UNIQUE INDEX on template_id）
- 业务层先删后插，DELETE 和 INSERT 均在同一事务内
- 只在 `POST /publish` Step 5 事务成功提交后才写库

---

### FR-09 操作历史（Undo/Redo）

- **S1 采用即时写库模式**：每次编辑操作完成后立即调用相应后端 API 写入数据库
- `undoStack` 在前端内存中维护每步操作的逆操作参数，不持久化到数据库
- 通过 `template.status == "Draft"` 判断是否有未发布修改
- 调整节点画布坐标：防抖 500ms 后写库

---

### FR-10 退出编辑器的未发布处理

- 若 `status=Draft`，退出前提示：[发布并关闭] [关闭（保持 Draft）] [取消]
- 关闭不会丢失数据，因所有操作均已即时写库

---

### FR-11 模板快照提供（面向 S2）

- `GET /api/templates/:id` 返回完整模板快照
- **此接口后端不校验 `status=Published`**，S2 须自行校验 `status=Published` 后再使用（设计决策：职责在调用方）

---

### FR-12 DocType 库渲染

`GET /api/templates/:id/doc-types`：

- `:id` 用于**校验模板存在性**，不存在返回 404
- MVP 阶段返回全局 `IsEnabled=true` 的 DocType 列表，**不按模板内容过滤**
- 返回按 `name` 字段升序排列，排序使用 **Ordinal 字典序**（排序在 QueryHandler 层执行，非 Cache 层）
- 缓存未就绪返回 `503 SERVICE_INITIALIZING`

---

### FR-13 DocType 间关系管理（DocTypeSource）

- S1 维护 `DocTypeSource` 表，记录 DocType 间的依赖关系
- **`/api/doc-type-sources` 系列接口不受模板状态约束，也不受缓存就绪状态约束**，是独立的全局数据管理接口，`CacheReadinessMiddleware` 对此路径前缀放行
- 支持完整 CRUD：`GET /api/doc-type-sources`（列表）、`POST /api/doc-type-sources`（创建）、`PATCH /api/doc-type-sources/:id`（更新）、`DELETE /api/doc-type-sources/:id`（删除）
- 自引用保护：后端校验 `sourceDocTypeId ≠ targetDocTypeId`，返回 `400 VALIDATION_ERROR`

---

## 3. 业务规则

### BR-01 模板状态机规则

| 状态               | 含义                             | 合法转换                                             | 触发条件                                         |
| ------------------ | -------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `Draft`            | 草稿编辑中                       | `Published`（via POST /publish）                     | 创建时自动进入；内容类写操作触发 Published→Draft |
| `Published`        | 已发布可用                       | `Draft`（自动触发）、`Archived`（via POST /archive） | POST /publish 验证通过                           |
| `ValidationFailed` | 验证失败（保留，MVP 不实际写入） | —                                                    | MVP 实现中不写入此状态，保留作扩展               |
| `Archived`         | 已归档                           | `Published`（via POST /restore）                     | 用户主动归档                                     |

> **POST /publish 状态前置约束：** 仅允许 `status=Draft` 的模板执行发布操作；`status=Published`、`status=Archived` 或 `status=ValidationFailed` 均返回 `422 INVALID_STATUS_TRANSITION`（ADR-020）。

> **ValidationFailed 说明：** MVP 实现中 POST /publish 验证失败时返回422响应，status 保持原值（Draft）不变，不写入 ValidationFailed 状态。数据库 CHECK 约束保留此值以备未来扩展。

**状态机补充规则：**

- **C-03例外：** `PATCH /api/templates/:id` 对 `name/description/estimatedDuration` 的修改是唯一不触发 Published→Draft 重置的写操作。其 Handler **不调用** `ResetToDraftIfPublishedAsync`，直接更新字段，且此例外对 Draft/Published/Archived/ValidationFailed 所有状态均成立
- Warning 级问题不触发 ValidationFailed，用户确认后可继续保存至 Published
- 仅 Error 级问题（循环依赖、phaseCode 不合法、无工作流）阻断保存
- Standard 模板守卫（`403 TEMPLATE_READ_ONLY`）**始终先于**状态校验执行

### BR-02 phaseCode 合法性规则

- 节点的 `phaseCode` 必须在其所属工作流的 **`WorkflowPhase` 表中存储的 `allowedPhaseCodes`** 列表中（字符串集合包含检查，动态数据库查询，非 PhaseMapping 静态配置）
- `PUT /phase-codes` 时传入的 phaseCode 必须在对应 WorkflowCode 的 `PhaseMapping` 允许范围内（二级校验），违反时返回 `422 PHASE_INVALID`
- 当 S0 禁用某 phaseCode（`isActive=false`）时：降级为 Warning，不阻断保存
- phaseCode 默认值计算：取 `DocType.AllowedPhaseCodes ∩ Workflow.allowedPhaseCodes`（交集，Workflow.allowedPhaseCodes 来自数据库 WorkflowPhase 表），调用 `PhaseCache.GetMinOrderPhaseCode()` 取 Order 最小值（不过滤 isActive=false 条目，仍使用但 `PhaseValidationService` 产生 Warning）
- **Warning 产生位置：** Warning 由 `PhaseValidationService.GetDefaultPhaseCode()` 产生；`PhaseCache.GetMinOrderPhaseCode()` 是纯查询方法，不产生 Warning

### BR-03 循环依赖规则

- Required 和 Optional 类型的边均参与循环检测
- `depthExceeded=true`（实际触达深度超过 configuredMaxDepth）为 Warning 级，不强制阻断
- 检测到真实环路（`hasCycle=true`）为 Error 级，必须修复后方可保存
- 实时检测（添加边时）：临时边若成环则不持久化，自动丢弃；**临时边永远不写库**
- **depth 语义明确：** maxDepth=6 表示允许最多经过 6 条边；`configuredMaxDepth` 字段存储此配置值；`actualDepthReached` 存储 DFS 实际触达的最大 depth 值（depthExceeded=true 时该值 > configuredMaxDepth）

### BR-04 节点完成条件规则

- `ManualConfirm`：无额外约束，`completionConditionConfigJson=NULL`
- `MinDocuments`：`minDocuments` 必须为正整数（≥1），`completionConditionConfigJson={"minDocuments":N}`
- `Checklist`：`ChecklistItem` 列表**至少含一条记录**；违反时在 UpdateNode handler 层返回 `400 VALIDATION_ERROR`，不进入发布流程（ADR-036b）
- 数据库存储值为 PascalCase：`ManualConfirm`/`MinDocuments`/`Checklist`

### BR-05 ValidationReport 唯一性规则

- 每个模板最多保留一条 `ValidationReport`
- **仅在 POST /publish Step 5 事务成功提交后写库**
- POST /validate 不写库，返回瞬时结果

### BR-06 FlowTemplateNode.id 规则（ADR-007）

- **由前端命名后传入**（kebab-case，`[a-z0-9-]`，1～128字符）
- 唯一性范围：**在所属工作流内唯一**（同一 workflowDefinitionId 下不重复）
- 重复时返回 `409 NODE_ALREADY_EXISTS`

### BR-07 WorkflowDefinition.id 不可变（ADR-015）

- 一旦创建不可变更
- PATCH 请求体 DTO 中若包含 id 字段，**静默忽略**（不报错，不更新）

### BR-08 DocTypeSource 规则

- 唯一约束：`(sourceDocTypeId, targetDocTypeId, relationship)` 不允许重复，违反返回 `400 VALIDATION_ERROR`
- 不允许自引用（`sourceDocTypeId ≠ targetDocTypeId`），违反返回 `400 VALIDATION_ERROR`
- 智能连接推荐边仅限同一工作流内节点间

### BR-09 DocType 禁用处理规则

- DISABLED 的 DocType 在编辑器左侧 DocType 库中隐藏（不可拖入新节点）
- 已存在的引用该 DocType 的节点正常显示
- 保存时对引用了 DISABLED DocType 的节点记录 Warning（type: `doc_type_disabled`），不阻断保存
- **缓存条目保留：** DISABLED 事件仅置 `IsEnabled=false`，不从缓存中移除条目

### BR-10 孤立节点规则

- 孤立节点定义：在工作流内无任何流程内边（FlowTemplateEdge），且不在任何跨流程依赖（CrossFlowDependency）中
- **单节点工作流中的节点同样检查孤立**，产生 Warning（type: `isolated_node`），无任何例外
- 孤立节点为 Warning 级，不阻断发布

### BR-11 认证绕过规则（MVP）

- `AUTH_ENABLED=false` 时，所有请求视为固定用户（id=`default-user`）

### BR-12 DocTypeRelationship 存储格式

- `DocTypeRelationship` 枚举存储为 PascalCase 字符串，与 `EdgeType`、`CompletionConditionType` 保持一致
- 数据库 CHECK 约束：`relationship IN ('DerivesFrom', 'References', 'Requires')`
- EF Core 使用 `.HasConversion<string>()` 默认枚举名转换，无需自定义 ValueConverter

### BR-13 Standard 模板守卫执行顺序

- 所有涉及 Standard 模板守卫的操作，**Handler 必须先校验 category=Standard 返回 403，再执行状态校验**
- 受此规则约束的操作：所有写操作（含 archive/restore）
- **不受此规则约束的操作（Standard 模板合法）：** clone、validate、check-cycle、suggest-edges、default-phase-code、analyze-phase-change、所有 GET 操作

---

## 4. 数据需求

### 4.1 实体关系总览

```
RUPTemplate (1) ─── (0..1) TemplateConfig
RUPTemplate (1) ─── (0..*) WorkflowDefinition
  WorkflowDefinition (1) ─── (0..*) WorkflowPhase
  WorkflowDefinition (1) ─── (0..*) FlowTemplateNode
    FlowTemplateNode (1) ─── (0..*) ChecklistItem [仅Checklist类型]
  WorkflowDefinition (1) ─── (0..*) FlowTemplateEdge
RUPTemplate (1) ─── (0..*) CrossFlowDependency
RUPTemplate (1) ─── (0..1) ValidationReport
  ValidationReport (1) ─── (0..*) ValidationIssue
DocTypeSource (独立全局实体，不属于任何模板)
template_processed_events (基础设施表)
```

### 4.2 各实体字段规格

#### rup_template

| 列名                 | 类型         | 可空     | 约束  | 说明                                                |
| -------------------- | ------------ | -------- | ----- | --------------------------------------------------- |
| `id`                 | VARCHAR(36)  | NOT NULL | PK    | UUID，`Guid.NewGuid().ToString("D")`                |
| `name`               | VARCHAR(256) | NOT NULL | —     | 默认"未命名RUP模板"                                 |
| `description`        | TEXT         | NULL     | —     | —                                                   |
| `category`           | VARCHAR(32)  | NOT NULL | CHECK | Standard/Simplified/Agile/Custom；创建时强制 Custom |
| `status`             | VARCHAR(32)  | NOT NULL | CHECK | Draft/Published/Archived/ValidationFailed           |
| `estimated_duration` | VARCHAR(64)  | NULL     | —     | 如"3个月"                                           |
| `created_at`         | TIMESTAMPTZ  | NOT NULL | —     | UTC                                                 |
| `updated_at`         | TIMESTAMPTZ  | NOT NULL | —     | UTC，每次写操作更新                                 |

#### template_config

| 列名                    | 类型        | 可空     | 约束                                | 说明                           |
| ----------------------- | ----------- | -------- | ----------------------------------- | ------------------------------ |
| `id`                    | VARCHAR(36) | NOT NULL | PK                                  | UUID                           |
| `template_id`           | VARCHAR(36) | NOT NULL | FK→rup_template(id) CASCADE, UNIQUE | —                              |
| `max_depth`             | INT         | NOT NULL | 默认6                               | 最大允许边数（DFS depth 上限） |
| `auto_validate_on_save` | BOOLEAN     | NOT NULL | 默认true                            | MVP固定true                    |
| `created_at`            | TIMESTAMPTZ | NOT NULL | —                                   | —                              |
| `updated_at`            | TIMESTAMPTZ | NOT NULL | —                                   | —                              |

#### workflow_definition

| 列名                 | 类型         | 可空     | 约束                        | 说明                                                         |
| -------------------- | ------------ | -------- | --------------------------- | ------------------------------------------------------------ |
| `id`                 | VARCHAR(128) | NOT NULL | PK                          | 业务ID，后端自动生成，snake_case+数字后缀                    |
| `template_id`        | VARCHAR(36)  | NOT NULL | FK→rup_template(id) CASCADE | —                                                            |
| `name`               | VARCHAR(256) | NOT NULL | —                           | —                                                            |
| `code`               | VARCHAR(64)  | NOT NULL | —                           | **snake_case存储**（如 `business_modeling`），无(template_id,code)联合唯一约束 |
| `priority`           | INT          | NOT NULL | 默认0                       | —                                                            |
| `estimated_duration` | VARCHAR(64)  | NULL     | —                           | —                                                            |
| `description`        | TEXT         | NULL     | —                           | —                                                            |
| `created_at`         | TIMESTAMPTZ  | NOT NULL | —                           | —                                                            |
| `updated_at`         | TIMESTAMPTZ  | NOT NULL | —                           | —                                                            |

#### workflow_phase

| 列名          | 类型         | 可空     | 约束                                                         | 说明            |
| ------------- | ------------ | -------- | ------------------------------------------------------------ | --------------- |
| `id`          | VARCHAR(36)  | NOT NULL | PK                                                           | UUID            |
| `workflow_id` | VARCHAR(128) | NOT NULL | FK→workflow_definition(id) CASCADE，UNIQUE(workflow_id,phase_code) | —               |
| `phase_code`  | VARCHAR(64)  | NOT NULL | 无跨BC外键约束                                               | phaseCode字符串 |
| `created_at`  | TIMESTAMPTZ  | NOT NULL | —                                                            | —               |

> **关于 phase_code 无跨BC外键约束的设计说明：** S1 不拥有 `phase_definition` 的权威数据，合法性已由 PhaseCache + 业务层双重保障。为保持 BC 边界清晰，此处不设 FK 约束。

#### flow_template_node

| 列名                               | 类型         | 可空     | 约束                                           | 说明                             |
| ---------------------------------- | ------------ | -------- | ---------------------------------------------- | -------------------------------- |
| `id`                               | VARCHAR(128) | NOT NULL | PK复合之一                                     | 前端传入，工作流内唯一           |
| `workflow_definition_id`           | VARCHAR(128) | NOT NULL | PK复合之一，FK→workflow_definition(id) CASCADE | —                                |
| `full_id`                          | VARCHAR(256) | NOT NULL | UNIQUE                                         | `{workflow_definition_id}.{id}`  |
| `doc_type_id`                      | VARCHAR(36)  | NOT NULL | 无跨BC外键约束                                 | —                                |
| `label`                            | VARCHAR(256) | NOT NULL | —                                              | 默认DocType.Name                 |
| `description`                      | TEXT         | NULL     | —                                              | —                                |
| `phase_code`                       | VARCHAR(64)  | NOT NULL | 无跨BC外键约束                                 | —                                |
| `priority`                         | INT          | NOT NULL | 默认0                                          | —                                |
| `estimated_duration`               | VARCHAR(64)  | NULL     | —                                              | —                                |
| `position_x`                       | INT          | NOT NULL | 默认0                                          | —                                |
| `position_y`                       | INT          | NOT NULL | 默认0                                          | —                                |
| `completion_condition_type`        | VARCHAR(32)  | NOT NULL | CHECK，默认'MinDocuments'                      | PascalCase                       |
| `completion_condition_config_json` | JSONB        | NULL     | —                                              | MinDocuments时存JSON，其他为NULL |
| `created_at`                       | TIMESTAMPTZ  | NOT NULL | —                                              | —                                |
| `updated_at`                       | TIMESTAMPTZ  | NOT NULL | —                                              | —                                |

**复合主键配置：** `HasKey(n => new { n.Id, n.WorkflowDefinitionId })`

#### checklist_item

| 列名                     | 类型         | 可空     | 约束           | 说明               |
| ------------------------ | ------------ | -------- | -------------- | ------------------ |
| `id`                     | VARCHAR(36)  | NOT NULL | PK             | UUID               |
| `template_node_id`       | VARCHAR(128) | NOT NULL | FK复合（见下） | —                  |
| `workflow_definition_id` | VARCHAR(128) | NOT NULL | FK复合（见下） | 复合FK必需的冗余列 |
| `text`                   | VARCHAR(512) | NOT NULL | —              | —                  |
| `doc_type_binding`       | VARCHAR(36)  | NULL     | —              | 无DB FK约束        |
| `sequence`               | INT          | NOT NULL | 默认0          | —                  |
| `required`               | BOOLEAN      | NOT NULL | 默认true       | —                  |
| `created_at`             | TIMESTAMPTZ  | NOT NULL | —              | —                  |

**复合FK：** `(template_node_id, workflow_definition_id) → flow_template_node(id, workflow_definition_id) ON DELETE CASCADE`

#### flow_template_edge

| 列名                     | 类型         | 可空     | 约束                               | 说明              |
| ------------------------ | ------------ | -------- | ---------------------------------- | ----------------- |
| `id`                     | VARCHAR(36)  | NOT NULL | PK                                 | UUID              |
| `workflow_definition_id` | VARCHAR(128) | NOT NULL | FK→workflow_definition(id) CASCADE | —                 |
| `source`                 | VARCHAR(128) | NOT NULL | CHECK(source≠target)               | 工作流内节点ID    |
| `target`                 | VARCHAR(128) | NOT NULL | CHECK(source≠target)               | 工作流内节点ID    |
| `type`                   | VARCHAR(16)  | NOT NULL | CHECK，默认'Required'              | Required/Optional |
| `label`                  | VARCHAR(256) | NULL     | —                                  | —                 |
| `weight`                 | INT          | NOT NULL | 默认0                              | —                 |
| `notes`                  | TEXT         | NULL     | —                                  | —                 |
| `created_at`             | TIMESTAMPTZ  | NOT NULL | —                                  | —                 |
| `updated_at`             | TIMESTAMPTZ  | NOT NULL | —                                  | —                 |

#### cross_flow_dependency

| 列名                 | 类型         | 可空     | 约束                                 | 说明                     |
| -------------------- | ------------ | -------- | ------------------------------------ | ------------------------ |
| `id`                 | VARCHAR(36)  | NOT NULL | PK                                   | UUID                     |
| `template_id`        | VARCHAR(36)  | NOT NULL | FK→rup_template(id) CASCADE          | —                        |
| `source_workflow_id` | VARCHAR(128) | NOT NULL | —                                    | —                        |
| `source_node_id`     | VARCHAR(128) | NOT NULL | —                                    | 工作流内节点ID           |
| `source_full_id`     | VARCHAR(256) | NOT NULL | —                                    | —                        |
| `target_workflow_id` | VARCHAR(128) | NOT NULL | —                                    | —                        |
| `target_node_id`     | VARCHAR(128) | NOT NULL | —                                    | 工作流内节点ID           |
| `target_full_id`     | VARCHAR(256) | NOT NULL | CHECK(source_full_id≠target_full_id) | —                        |
| `type`               | VARCHAR(16)  | NOT NULL | CHECK                                | Required/Optional        |
| `display_label`      | VARCHAR(512) | NULL     | —                                    | 前端生成传入，后端只存储 |
| `description`        | TEXT         | NULL     | —                                    | —                        |
| `weight`             | INT          | NOT NULL | 默认0                                | —                        |
| `notes`              | TEXT         | NULL     | —                                    | —                        |
| `created_at`         | TIMESTAMPTZ  | NOT NULL | —                                    | —                        |
| `updated_at`         | TIMESTAMPTZ  | NOT NULL | —                                    | —                        |

#### doc_type_source

| 列名                 | 类型        | 可空     | 约束                                 | 说明                                            |
| -------------------- | ----------- | -------- | ------------------------------------ | ----------------------------------------------- |
| `id`                 | VARCHAR(36) | NOT NULL | PK                                   | UUID                                            |
| `source_doc_type_id` | VARCHAR(36) | NOT NULL | 无跨BC外键约束，UNIQUE复合           | 依赖方（后置文档）                              |
| `target_doc_type_id` | VARCHAR(36) | NOT NULL | 无跨BC外键约束，CHECK(source≠target) | 被依赖方（前置文档）                            |
| `relationship`       | VARCHAR(32) | NOT NULL | CHECK，UNIQUE复合                    | **PascalCase: DerivesFrom/References/Requires** |
| `description`        | TEXT        | NULL     | —                                    | —                                               |
| `weight`             | INT         | NOT NULL | 默认0                                | —                                               |
| `created_at`         | TIMESTAMPTZ | NOT NULL | —                                    | —                                               |
| `updated_at`         | TIMESTAMPTZ | NOT NULL | —                                    | —                                               |

**唯一约束：** `(source_doc_type_id, target_doc_type_id, relationship)`

#### validation_report

| 列名          | 类型        | 可空     | 约束                                | 说明                |
| ------------- | ----------- | -------- | ----------------------------------- | ------------------- |
| `id`          | VARCHAR(36) | NOT NULL | PK                                  | UUID                |
| `template_id` | VARCHAR(36) | NOT NULL | FK→rup_template(id) CASCADE，UNIQUE | 每模板唯一          |
| `valid`       | BOOLEAN     | NOT NULL | —                                   | 无Error级问题则true |
| `created_at`  | TIMESTAMPTZ | NOT NULL | —                                   | —                   |

#### validation_issue

| 列名          | 类型         | 可空     | 约束                             | 说明                                        |
| ------------- | ------------ | -------- | -------------------------------- | ------------------------------------------- |
| `id`          | VARCHAR(36)  | NOT NULL | PK                               | UUID                                        |
| `report_id`   | VARCHAR(36)  | NOT NULL | FK→validation_report(id) CASCADE | —                                           |
| `severity`    | VARCHAR(16)  | NOT NULL | CHECK(Error/Warning/Info)        | —                                           |
| `type`        | VARCHAR(64)  | NOT NULL | —                                | 见下表                                      |
| `message`     | TEXT         | NOT NULL | —                                | phaseCode相关用`displayName(phaseCode)`格式 |
| `workflow_id` | VARCHAR(128) | NULL     | —                                | 全局性问题为null                            |
| `node_id`     | VARCHAR(128) | NULL     | —                                | **工作流内ID**（非fullId）                  |
| `details`     | TEXT         | NULL     | —                                | JSON格式附加信息                            |
| `created_at`  | TIMESTAMPTZ  | NOT NULL | —                                | —                                           |

**ValidationIssue.type 枚举全集（仅写入 ValidationReport 的类型）：**

| type                 | severity | workflowId | nodeId         | details说明                                                  |
| -------------------- | -------- | ---------- | -------------- | ------------------------------------------------------------ |
| `no_workflow`        | Error    | null       | null           | null                                                         |
| `empty_workflow`     | Warning  | 工作流id   | null           | null                                                         |
| `phase_out_of_range` | Error    | 工作流id   | 节点工作流内id | `{"phaseCode":"Construction","allowedPhaseCodes":["Inception"]}` |
| `phase_disabled`     | Warning  | 工作流id   | 节点工作流内id | `{"phaseCode":"Construction","displayName":"构建阶段"}`      |
| `doc_type_disabled`  | Warning  | 工作流id   | 节点工作流内id | `{"docTypeId":"uuid","docTypeName":"类图"}`                  |
| `cycle_detected`     | Error    | null       | null           | `{"cyclePath":["requirements.vision","requirements.use-case","requirements.vision"]}` |
| `depth_exceeded`     | Warning  | null       | null           | `{"configuredMaxDepth":6,"actualDepthReached":7}`            |
| `isolated_node`      | Warning  | 工作流id   | 节点工作流内id | null                                                         |

> **注意：** `phase_not_found` Warning 由 `PUT /phase-codes` 的 `UpsertPhaseCodesAsync` 生成，仅出现在该接口的响应体 `warnings` 数组中，**不写入 ValidationReport**。

> **depth_exceeded details 说明：** `configuredMaxDepth` 为 TemplateConfig 中配置的最大允许边数（默认6），`actualDepthReached` 为 DFS 实际触达的最大 depth 值（depthExceeded=true 时该值 > configuredMaxDepth）。示例：maxDepth=6，发现7条边的路径时，actualDepthReached=7。

#### template_processed_events（幂等防重表）

| 列名           | 类型        | 可空     | 约束      | 说明                     |
| -------------- | ----------- | -------- | --------- | ------------------------ |
| `id`           | VARCHAR(36) | NOT NULL | PK        | Kafka eventId（UUID v7） |
| `processed_at` | TIMESTAMPTZ | NOT NULL | 默认NOW() | UTC                      |

### 4.3 S1 只读的外部数据（本地缓存）

#### DocTypeCache 核心字段

| 字段                      | 类型           | 说明                                                   |
| ------------------------- | -------------- | ------------------------------------------------------ |
| `Id`                      | String         | DocType UUID                                           |
| `Code`                    | String         | DocType 编码                                           |
| `Name`                    | String         | DocType 名称（节点 label 默认值）                      |
| `AllowedPhaseCodes`       | List\<String\> | 允许的 phaseCode 列表（阻断级必填，缺失则DLQ）         |
| `AiDraftPromptTemplateId` | String?        | 关联 AI 草稿 PromptTemplate ID，可空                   |
| `IsEnabled`               | Boolean        | `payload.status == "ENABLED"`；false 时 DocType 库隐藏 |

**DISABLED 处理：** 保留缓存条目，仅将 `IsEnabled` 置为 false，不移除。

#### PhaseCache 核心字段

| 字段          | 类型    | 说明                                |
| ------------- | ------- | ----------------------------------- |
| `Id`          | String  | PhaseDefinition UUID                |
| `PhaseCode`   | String  | 阶段编码（如 Inception）            |
| `DisplayName` | String  | 来自事件 payload.name，如"初始阶段" |
| `Order`       | Int     | 升序排序号（阻断级必填，缺失则DLQ） |
| `IsActive`    | Boolean | false 时降级为 Warning              |

**DISABLED 处理：** 保留缓存条目，仅将 `IsActive` 置为 false，不移除。`GetMinOrderPhaseCode()` 不过滤 isActive=false 条目，调用方 `PhaseValidationService` 负责检查并产生 Warning。

### 4.4 数据存储关键决策汇总

| 决策点                                | 结论                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| FlowTemplateNode主键                  | 复合主键(id, workflowDefinitionId)                           |
| ChecklistItem外键                     | 真正的复合FK(template_node_id, workflow_definition_id)，ON DELETE CASCADE |
| FlowTemplateNode.id                   | 前端传入，后端校验唯一性                                     |
| WorkflowDefinition.id                 | 后端生成，精确前缀匹配存活记录最大后缀M，候选M+1，乐观重试+PK冲突捕获；序列为 baseCode → baseCode-2 → baseCode-3（-1永不出现） |
| WorkflowDefinition.id 克隆批次去重    | 同一克隆批次内，相同 baseCode 的多个候选 ID 在内存中顺序递增，不重复查库 |
| WorkflowDefinition.code 存储格式      | **snake_case**（如 `business_modeling`），通过自定义ValueConverter保证 |
| DocTypeRelationship 存储格式          | **PascalCase**（DerivesFrom/References/Requires），`.HasConversion<string>()` 默认转换 |
| 跨BC外键约束                          | **不设**：workflow_phase.phase_code、flow_template_node.doc_type_id/phase_code、doc_type_source的两个doc_type_id均无跨BC FK约束 |
| 列名命名约定                          | 通过 `UseSnakeCaseNamingConventions()`（EFCore.NamingConventions）自动映射，仅对需要自定义转换的字段显式指定 HasColumnName |
| ManualConfirm configJson              | NULL                                                         |
| Checklist configJson                  | NULL                                                         |
| MinDocuments configJson               | {"minDocuments":N}                                           |
| CompletionConditionType存储           | PascalCase                                                   |
| 节点默认completionConditionConfigJson | `{"minDocuments":1}`（MinDocuments类型默认值）               |
| Checklist类型最小ChecklistItem        | 至少1条，UpdateNode handler层校验返回400（ADR-036b）         |
| ValidationReport写入时机              | 仅POST /publish Step5事务成功                                |
| ValidationReport.valid 计算           | `validationResult.Valid`（无Error级问题则为true），不硬编码  |
| Step5 UPSERT范围                      | 仅 status 更新 + ValidationReport，不UPSERT已存在的子实体    |
| ValidationIssue.nodeId                | 工作流内ID（非fullId）                                       |
| phaseCode 合法性校验数据源            | 数据库 WorkflowPhase 表（动态），非 PhaseMapping 静态配置    |
| PUT /phase-codes 二级校验             | PhaseMapping 静态配置（确保不超出 WorkflowCode 预定义范围）  |
| PUT /phase-codes phase_not_found      | 响应体 warnings 数组（非 ValidationReport 条目）             |
| WorkflowDefinition (templateId,code)  | 无联合唯一约束                                               |
| GET /:id 是否校验 status=Published    | 不校验，S2自行负责                                           |
| POST /templates 的 category 参数      | 静默忽略，强制 Custom                                        |
| 孤立节点单节点例外                    | 无例外，单节点工作流也检查孤立                               |
| maxDepth 语义                         | 最大允许边数；DFS depth 从0开始，depth > maxDepth 时触发 depthExceeded |
| actualDepthReached 含义               | DFS 实际触达的最大 depth 值；depthExceeded=true 时 > configuredMaxDepth |
| 删除工作流时ChecklistItem处理         | 依赖数据库CASCADE，不需要显式删除；FlowTemplateNode删除时自动级联 |
| suggest-edges 接口路由                | 工作流级别：`POST /api/templates/:id/workflows/:wfId/suggest-edges` |
| suggest-edges Standard模板            | **允许调用**（只读操作，不受Standard守卫拦截）               |
| suggest-edges 反向边过滤              | **不过滤**反向已存在边，由后续循环检测处理                   |
| 批量操作 ResetToDraftIfPublishedAsync | 在循环外先调用一次，再逐节点/逐条独立事务                    |
| 批量操作 fullId 解析失败              | 记入 failedNodes，不影响其他节点                             |
| 批量删除节点请求体                    | `{ fullIds: string[] }`，从 fullId 解析出 workflowId 和 nodeId |
| 批量删除跨流程依赖请求体              | `{ ids: string[] }`，依赖记录主键UUID列表                    |
| 克隆操作事务范围                      | ID生成在事务外（含批次内去重）；全部写入在单一事务内；冲突时整体回滚，最多重试3次 |
| POST /publish 状态前置                | 仅接受 status=Draft，其余（含ValidationFailed）返回 422 INVALID_STATUS_TRANSITION |
| POST /validate 对 category=Standard   | 允许（只读操作，Handler不拦截）                              |
| POST /validate 验证策略               | no_workflow→提前返回（两种模式相同）；其他情况全程4步执行，收集所有Issue；仅 hasCycle=true 时跳过 Step 4 |
| POST /publish 验证短路策略            | Step1 no_workflow Error→立即停；Step2 Error→收集全Step2错误后停（2b/2c/3/4全跳过）；Step3 hasCycle→立即停 |
| Standard模板守卫实现方式              | **Handler层**调用 ThrowIfStandardTemplateAsync()，不使用全局中间件 |
| CreateTemplate Handler Standard守卫   | **不调用**（新模板无 templateId 可查，且 category 强制 Custom） |
| Archive 前置 status                   | 必须 Published，否则 422 INVALID_STATUS_TRANSITION；category=Standard 先返回 403 |
| Restore 前置 status                   | 必须 Archived，否则 422 INVALID_STATUS_TRANSITION；category=Standard 先返回 403 |
| GET /validation-reports/latest 无报告 | 返回 200 { data: null }，不返回404                           |
| 模板列表响应字段                      | id/name/category/status/estimatedDuration/workflowCount/hasValidationReport/validationReportValid/createdAt/updatedAt |
| 节点创建 phaseCode                    | 必填，前端保证传入；后端收到空值返回400                      |
| CacheReadinessMiddleware 白名单       | `/api/doc-type-sources` 和 `/health` 路径前缀放行，不受503拦截 |
| WorkflowIdGenerator前缀匹配           | 精确匹配：`id == baseCode \|\| id.StartsWith(baseCode + "-")`；后缀须为纯数字 |
| analyze-phase-change                  | 只读查询，不写库，不触发Draft重置                            |
| default-phase-code                    | 只读查询接口，`GET /workflows/:wfId/default-phase-code?docTypeId=xxx` |
| GET /cross-flow-dependencies          | 模板范围列表，支持按 sourceWorkflowId/targetWorkflowId 过滤，无分页 |
| UpdateTemplateMetadata Handler        | 不调用 ResetToDraftIfPublishedAsync，直接更新字段，status保持不变 |
| If-Match 比较方式                     | 将 If-Match 字符串解析为 DateTimeOffset，与 updatedAt 比较，差值绝对值 ≥ 1ms 视为不匹配 |

---

## 5. 事件触发行为

S1 在 MVP 阶段**不发布任何 Kafka 业务事件**。

### 5.1 订阅事件处理

#### EVT-01 消费 `governance.doctype.changed.v1`

**消费者组：** `template.doctype-cache`（通过 `appsettings.json` 配置 `Kafka:ConsumerGroups:DocType`）

| operationType        | S1 处理动作                                                  |
| -------------------- | ------------------------------------------------------------ |
| `CREATED`/`UPDATED`  | `DocTypeCache.Upsert()`，IsEnabled=(status=="ENABLED")       |
| `DISABLED`/`DELETED` | `DocTypeCache.Upsert()`，IsEnabled=false，**保留条目不移除** |
| `SYNC_FULL`          | `DocTypeCache.Upsert()` 逐条，全量重建                       |

**阻断级必填字段：** `docTypeId`、`docTypeCode`、`name`、`allowedPhaseCodes`（缺失时抛出 `NonRetriableConsumerException`，直接路由 DLQ，不重试）

**关键映射：** `IsEnabled = (payload.status == "ENABLED")`，operationType 为 DISABLED/DELETED 时强制 IsEnabled=false，不依赖 payload.status

#### EVT-02 消费 `governance.phase.changed.v1`

**消费者组：** `template.phase-cache`（通过 `appsettings.json` 配置 `Kafka:ConsumerGroups:Phase`）

| operationType        | S1 处理动作                                                  |
| -------------------- | ------------------------------------------------------------ |
| `CREATED`/`UPDATED`  | `PhaseCache.Upsert()`，`RebuildOrderIndex()`                 |
| `DISABLED`/`DELETED` | `PhaseCache.Upsert()`，IsActive=false，**保留条目不移除**，`RebuildOrderIndex()` |
| `SYNC_FULL`          | `PhaseCache.Upsert()` + `RebuildOrderIndex()`                |

**阻断级必填字段：** `phaseId`、`phaseCode`、`name`（=displayName）、`order`（缺失时抛出 `NonRetriableConsumerException`，直接路由 DLQ，不重试）

**DLQ 策略：**

- 阻断级字段缺失（`NonRetriableConsumerException`）：VZhen SDK 识别此异常类型，**跳过重试，直接写入 `{topic}.dlq`**
- 其他运行时错误：offset 不提交，按配置重试次数（默认3次）后写入 DLQ
- 重试次数与 DLQ topic 通过 VZhen SDK 的 `appsettings.json` 参数配置，不在业务代码中硬编码

**幂等处理：** 消费前查 `template_processed_events` 表，存在则跳过；事务内写入幂等记录后提交 Kafka offset。若并发消费导致幂等记录 PK 冲突，捕获唯一约束异常视为已处理，跳过。

### 5.2 启动时缓存预热

1. 启动 Kafka 消费者（注册两个消费者组）
2. 调用 `POST {S0_BASE_URL}/api/governance/sync` 触发 S0 全量 SYNC_FULL 广播
3. 等待 30 秒（每 500ms 检查）：`DocTypeCache.Count > 0 && PhaseCache.Count > 0`
4. 30 秒内就绪 → 开始处理 HTTP 业务请求
5. 30 秒超时 → HealthCheck 标记 `Degraded`，降级启动（Cache.Count==0 时返回 503）

---

## 6. 非功能需求

### NFR-01 性能

- 实时循环检测（添加边时）：响应时间 ≤ 200ms（模板规模：≤50节点，≤100条边）
- 模板保存（含全量验证）：响应时间 ≤ 3s
- 模板列表查询：响应时间 ≤ 500ms

### NFR-02 可靠性

- 涉及多表的写操作在单一数据库事务中执行
- 批量删除节点/依赖：先对模板执行一次状态重置，再逐项独立事务；部分失败不回滚已成功项
- Kafka 阻断级字段缺失：`NonRetriableConsumerException`，跳过重试直达 DLQ
- Kafka 其他消费失败：offset 不提交，超过配置重试次数后写入 DLQ
- 单元测试覆盖率 ≥ 80%
- 集成测试必须验证：`UpsertPhaseCodesAsync` 中 `ExecuteDeleteAsync` 执行后，若后续操作触发事务回滚，DELETE 操作应一并回滚

### NFR-03 技术栈约束

- ASP.NET Core 9+ WebAPI、EF Core 10 + Npgsql + EFCore.NamingConventions、PostgreSQL 16+
- 消息队列：VZhen.Components.MessageQueue.Kafka v6.12.1（禁止直接使用 Confluent.Kafka）

---

## 7. 外部依赖与接口边界

### 7.1 依赖 S0 Governance BC

| 依赖内容             | 方式                                              | 说明              |
| -------------------- | ------------------------------------------------- | ----------------- |
| DocType 数据         | Kafka 事件订阅（异步）                            | 维护 DocTypeCache |
| PhaseDefinition 数据 | Kafka 事件订阅（异步）                            | 维护 PhaseCache   |
| 全量同步触发         | REST（`POST /api/governance/sync`，启动时一次性） | 缓存预热          |

S0 不可用时降级策略：使用上次已知缓存数据，Cache.Count==0 时返回 503。

### 7.2 提供给 S2 ProjectFlow BC

| 提供内容     | 方式                             | 说明                                                    |
| ------------ | -------------------------------- | ------------------------------------------------------- |
| 模板完整快照 | REST（`GET /api/templates/:id`） | 后端不校验status；S2 须自行校验 status=Published 后使用 |

### 7.3 REST API 基础规范

- **Base URL：** `/api`
- **Content-Type：** `application/json`
- **认证：** MVP阶段 AUTH_ENABLED=false，无需认证Header
- **UUID格式：** 带连字符36字符标准格式

**统一响应格式：**

```json
// 成功
{"success": true, "data": {...}, "message": "操作成功"}
// 失败
{"success": false, "error": {"code": "ERROR_CODE", "message": "...", "details": {}}}
```

**错误码全集：**

| 错误码                      | HTTP状态 | 说明                                                         |
| --------------------------- | -------- | ------------------------------------------------------------ |
| `VALIDATION_ERROR`          | 400      | 输入参数校验失败（含phaseCode空值、fullId格式非法、Checklist类型无ChecklistItem等） |
| `TEMPLATE_READ_ONLY`        | 403      | category=Standard模板不允许修改（含archive/restore）；先于状态校验执行 |
| `TEMPLATE_NOT_FOUND`        | 404      | 模板不存在                                                   |
| `WORKFLOW_NOT_FOUND`        | 404      | 工作流不存在                                                 |
| `NODE_NOT_FOUND`            | 404      | 节点不存在                                                   |
| `EDGE_NOT_FOUND`            | 404      | 依赖边不存在                                                 |
| `DEPENDENCY_NOT_FOUND`      | 404      | 跨流程依赖不存在                                             |
| `DOC_TYPE_NOT_FOUND`        | 404      | DocType不存在                                                |
| `NODE_ALREADY_EXISTS`       | 409      | nodeId在工作流内已存在                                       |
| `PRECONDITION_FAILED`       | 412      | 乐观锁冲突（If-Match不匹配）                                 |
| `CYCLE_DETECTED`            | 422      | 检测到循环依赖                                               |
| `PHASE_INVALID`             | 422      | phaseCode不在工作流允许范围内                                |
| `VALIDATION_FAILED`         | 422      | 模板验证存在Error级问题                                      |
| `INVALID_STATUS_TRANSITION` | 422      | 状态转换不合法                                               |
| `INTERNAL_ERROR`            | 500      | 服务器内部错误                                               |
| `SERVICE_INITIALIZING`      | 503      | 缓存未就绪（含Retry-After:5头）                              |
