import React from 'react';

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

  const tableRowStyle = {
    borderBottom: '1px solid #ddd',
    transition: 'background-color 0.2s',
    cursor: onClick ? 'pointer' : 'default',
  };

  const tableCellStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#333',
  };

  return (
    <tr 
      style={tableRowStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {columns.map((column) => (
        <td key={column.key} style={tableCellStyle}>
          {column.render ? column.render(row) : row[column.key]}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;