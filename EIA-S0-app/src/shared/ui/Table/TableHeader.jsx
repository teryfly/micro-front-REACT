import React from 'react';
import styles from './Table.module.css';

/**
 * Table header component with sorting
 * Internal component used by Table
 */
const TableHeader = ({ columns, sortConfig, onSort }) => {
  return (
    <thead className={styles.tableHeader}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={column.sortable ? styles.sortable : ''}
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
              <span className={styles.sortIcon} aria-hidden="true">
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