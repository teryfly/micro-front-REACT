/**
 * AI Service List Component
 * Displays table of AI services with provider filtering
 * @module AIServiceList
 */

import React, { useState } from 'react';
import Table from '../../../shared/ui/Table/Table';
import Button from '../../../shared/ui/Button';
import Badge from '../../../shared/ui/Badge';
import Select from '../../../shared/ui/Form/Select';
import { AI_PROVIDERS } from '../constants/aiService.constants';

/**
 * AI Service list component
 * @param {Object} props
 * @param {Array<AIServiceConfig>} props.aiServices - AI service array
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onView - View handler
 */
const AIServiceList = ({ aiServices, loading, onEdit, onView }) => {
  const [providerFilter, setProviderFilter] = useState('');

  const providerOptions = [
    { value: '', label: 'All Providers' },
    ...Object.values(AI_PROVIDERS).map(provider => ({
      value: provider,
      label: provider,
    })),
  ];

  const filteredServices = providerFilter
    ? aiServices.filter(service => service.provider === providerFilter)
    : aiServices;

  const columns = [
    {
      key: 'provider',
      label: 'Provider',
      sortable: true,
      render: (row) => (
        <Badge type="info">{row.provider}</Badge>
      ),
    },
    {
      key: 'modelName',
      label: 'Model Name',
      sortable: true,
    },
    {
      key: 'parameters',
      label: 'Parameters',
      render: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {Object.keys(row.parameters || {}).length} params
        </span>
      ),
    },
    {
      key: 'retryPolicy',
      label: 'Retry Policy',
      render: (row) => (
        <span style={{ fontSize: '12px' }}>
          Max: {row.retryPolicy?.maxAttempts || 0} attempts
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
          name="providerFilter"
          label="Filter by Provider"
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          options={providerOptions}
        />
      </div>

      <Table
        data={filteredServices}
        columns={columns}
        loading={loading}
        onRowClick={(row) => onView(row.id)}
        emptyMessage="No AI services found"
      />
    </div>
  );
};

export default AIServiceList;