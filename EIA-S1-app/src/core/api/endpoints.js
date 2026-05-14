/**
 * S1 TemplateBC API endpoint builders
 * All paths relative to /api (base URL already contains /api).
 */

const BASE = '/api';
const T    = (id) => `${BASE}/templates/${id}`;
const WF   = (id, wfId) => `${T(id)}/workflows/${wfId}`;
const N    = (id, wfId, nId) => `${WF(id, wfId)}/nodes/${nId}`;
const E    = (id, wfId, eId) => `${WF(id, wfId)}/edges/${eId}`;

export const endpoints = {
  // ── Templates ────────────────────────────────────────────────
  templates: {
    list:     () => `${BASE}/templates`,
    create:   () => `${BASE}/templates`,
    get:      (id) => T(id),
    metadata: (id) => `${T(id)}/metadata`,
    validate: (id) => `${T(id)}/validate`,
    publish:  (id) => `${T(id)}/publish`,
    archive:  (id) => `${T(id)}/archive`,
    restore:  (id) => `${T(id)}/restore`,
    clone:    (id) => `${T(id)}/clone`,
    validationReport: (id) => `${T(id)}/validation-report`,
    docTypes: (id) => `${T(id)}/doc-types`,
  },

  // ── Workflows ────────────────────────────────────────────────
  workflows: {
    list:            (id)         => `${T(id)}/workflows`,
    create:          (id)         => `${T(id)}/workflows`,
    update:          (id, wfId)   => WF(id, wfId),
    delete:          (id, wfId)   => WF(id, wfId),
    updatePhaseCodes:(id, wfId)   => `${WF(id, wfId)}/phase-codes`,
    analyzePhase:    (id, wfId)   => `${WF(id, wfId)}/analyze-phase-change`,
    defaultPhaseCode:(id, wfId)   => `${WF(id, wfId)}/default-phase-code`,
  },

  // ── Nodes ────────────────────────────────────────────────────
  nodes: {
    list:        (id, wfId)        => `${WF(id, wfId)}/nodes`,
    create:      (id, wfId)        => `${WF(id, wfId)}/nodes`,
    get:         (id, wfId, nId)   => N(id, wfId, nId),
    update:      (id, wfId, nId)   => N(id, wfId, nId),
    delete:      (id, wfId, nId)   => N(id, wfId, nId),
    batchDelete: (id, wfId)        => `${WF(id, wfId)}/nodes/batch-delete`,
    suggestEdges:(id, wfId, nId)   => `${N(id, wfId, nId)}/suggest-edges`,
  },

  // ── Edges (intra-workflow) ───────────────────────────────────
  edges: {
    list:       (id, wfId)        => `${WF(id, wfId)}/edges`,
    create:     (id, wfId)        => `${WF(id, wfId)}/edges`,
    update:     (id, wfId, eId)   => E(id, wfId, eId),
    delete:     (id, wfId, eId)   => E(id, wfId, eId),
    checkCycle: (id, wfId)        => `${WF(id, wfId)}/edges/check-cycle`,
  },

  // ── Cross-flow dependencies ──────────────────────────────────
  crossFlow: {
    list:       (id)       => `${T(id)}/cross-flow-dependencies`,
    create:     (id)       => `${T(id)}/cross-flow-dependencies`,
    update:     (id, dId)  => `${T(id)}/cross-flow-dependencies/${dId}`,
    delete:     (id, dId)  => `${T(id)}/cross-flow-dependencies/${dId}`,
    checkCycle: (id)       => `${T(id)}/cross-flow-dependencies/check-cycle`,
  },
};
