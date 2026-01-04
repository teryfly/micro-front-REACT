import React, { useState, useMemo } from 'react';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import styles from './Table.module.css';

/**
 * Data table component with sorting
 * Displays tabular data with sortable columns
 * 
 * @param {Object} props
 * @param {Array<Object>} props.data - Table data array
 * @param {Array<Column>} props.columns - Column definitions [{key, label, sortable, render}]
 * @param {Function} [props.onRowClick] - Row click handler
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.emptyMessage='No data available'] - Empty state message
 * 
 * @example
 * <Table
 *   data={users}
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'email', label: 'Email', sortable: true },
 *     { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> }
 *   ]}
 *   onRowClick={(row) => console.log(row)}
 * />
 */
const Table = ({
  data = [],
  columns = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort data based on current sort configuration
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

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (data.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
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