import React from 'react';

const TableHeader = ({ columns, sortConfig, onSort }) => {
  const tableHeaderStyle = {
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd',
  };

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '14px',
    color: '#333',
    whiteSpace: 'nowrap',
  };

  const sortableStyle = {
    ...thStyle,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const sortIconStyle = {
    marginLeft: '4px',
    fontSize: '10px',
    color: '#4CAF50',
  };

  return (
    <thead style={tableHeaderStyle}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            style={column.sortable ? sortableStyle : thStyle}
            onClick={() => column.sortable && onSort(column.key)}
            role={column.sortable ? 'button' : undefined}
            aria-sort={
              sortConfig.key === column.key
                ? sortConfig.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
            }
          >
            {column.label}
            {column.sortable && sortConfig.key === column.key && (
              <span style={sortIconStyle} aria-hidden="true">
                {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
              </span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;