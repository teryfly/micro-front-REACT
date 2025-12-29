import React, { useState, useMemo } from 'react';
import TableHeader from './TableHeader';
import TableBody from './TableBody';

/**
 * Data table component with sorting
 */
const Table = ({
  data = [],
  columns = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const tableContainerStyle = {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  };

  const loadingStyle = {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
  };

  if (loading) {
    return <div style={loadingStyle}>Loading...</div>;
  }

  if (data.length === 0) {
    return <div style={loadingStyle}>{emptyMessage}</div>;
  }

  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <TableHeader
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <TableBody
          data={sortedData}
          columns={columns}
          onRowClick={onRowClick}
        />
      </table>
    </div>
  );
};

export default Table;