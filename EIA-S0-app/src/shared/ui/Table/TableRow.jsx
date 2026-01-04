import React from 'react';
import styles from './Table.module.css';

/**
 * Table row component
 * Internal component used by TableBody
 */
const TableRow = ({ row, columns, onClick }) => {
  const handleClick = () => {
    if (onClick) onClick(row);
  };

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(row);
    }
  };

  return (
    <tr 
      className={`${styles.tableRow} ${onClick ? styles.clickable : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {columns.map((column) => (
        <td key={column.key} className={styles.tableCell}>
          {column.render ? column.render(row) : row[column.key]}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;