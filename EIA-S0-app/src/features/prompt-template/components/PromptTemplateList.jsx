/**
 * Prompt Template List Component
 * Displays table of templates with scope filtering
 * @module PromptTemplateList
 */

import React, { useState } from 'react';
import Table from '../../../shared/ui/Table/Table';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import Select from '../../../shared/ui/Form/Select';
import { TEMPLATE_SCOPES } from '../constants/promptTemplate.constants';
import { truncate } from '../../../shared/utils/formatting';

/**
 * Prompt Template list component
 * @param {Object} props
 * @param {Array<PromptTemplate>} props.templates - Template array
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onView - View handler
 * @param {Function} props.onViewVersions - View versions handler
 */
const PromptTemplateList = ({ 
  templates, 
  loading, 
  onEdit, 
  onView,
  onViewVersions 
}) => {
  const [scopeFilter, setScopeFilter] = useState('');

  const scopeOptions = [
    { value: '', label: 'All Scopes' },
    ...Object.values(TEMPLATE_SCOPES).map(scope => ({
      value: scope,
      label: scope,
    })),
  ];

  const filteredTemplates = scopeFilter
    ? templates.filter(template => template.scope === scopeFilter)
    : templates;

  const columns = [
    {
      key: 'agentName',
      label: 'Agent Name',
      sortable: true,
    },
    {
      key: 'scope',
      label: 'Scope',
      sortable: true,
      render: (row) => (
        <Badge type="info">{row.scope}</Badge>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      render: (row) => (
        <Badge type="default">v{row.version}</Badge>
      ),
    },
    {
      key: 'language',
      label: 'Language',
      render: (row) => (
        <span style={{ fontSize: '12px' }}>{row.language.toUpperCase()}</span>
      ),
    },
    {
      key: 'content',
      label: 'Content Preview',
      render: (row) => (
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--color-text-muted)',
          fontFamily: 'monospace'
        }}>
          {truncate(row.content, 50)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="small" onClick={() => onView(row.id)}>
            View
          </Button>
          <Button size="small" variant="secondary" onClick={() => onViewVersions(row.id)}>
            Versions
          </Button>
          <Button size="small" variant="primary" onClick={() => onEdit(row.id)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px', maxWidth: '300px' }}>
        <Select
          name="scopeFilter"
          label="Filter by Scope"
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          options={scopeOptions}
        />
      </div>

      <Table
        data={filteredTemplates}
        columns={columns}
        loading={loading}
        onRowClick={(row) => onView(row.id)}
        emptyMessage="No prompt templates found"
      />
    </div>
  );
};

export default PromptTemplateList;