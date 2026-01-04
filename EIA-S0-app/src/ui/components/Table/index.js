import React, { useState, useMemo } from 'react';
import styles from './Table.module.css';

const Table = ({
  data = [],
  columns = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
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

  // Fallback styles
  const fallbackStyles = {
    container: {
      width: '100%',
      overflowX: 'auto',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: 'white',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: 600,
      fontSize: '14px',
      color: '#333',
      backgroundColor: '#f5f5f5',
      borderBottom: '2px solid #ddd',
    },
    td: {
      padding: '12px 16px',
      fontSize: '14px',
      color: '#333',
      borderBottom: '1px solid #ddd',
    },
    loading: {
      padding: '40px',
      textAlign: 'center',
      color: '#999',
      fontSize: '14px',
    },
  };

  if (loading) {
    return (
      <div 
        className={styles?.loading}
        style={!styles ? fallbackStyles.loading : undefined}
      >
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className={styles?.empty}
        style={!styles ? fallbackStyles.loading : undefined}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div 
      className={styles?.tableContainer || className}
      style={!styles ? fallbackStyles.container : undefined}
    >
      <table 
        className={styles?.table}
        style={!styles ? fallbackStyles.table : undefined}
      >
        <thead className={styles?.tableHeader}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? styles?.sortable : ''}
                style={!styles ? fallbackStyles.th : undefined}
                onClick={() => column.sortable && handleSort(column.key)}
                role={column.sortable ? 'button' : undefined}
              >
                {column.label}
                {column.sortable && sortConfig.key === column.key && (
                  <span className={styles?.sortIcon} style={{ marginLeft: '4px', fontSize: '10px', color: '#4CAF50' }}>
                    {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={row.id || index}
              className={styles?.tableRow}
              style={!styles && onRowClick ? { cursor: 'pointer' } : undefined}
              onClick={() => onRowClick && onRowClick(row)}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  className={styles?.tableCell}
                  style={!styles ? fallbackStyles.td : undefined}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;