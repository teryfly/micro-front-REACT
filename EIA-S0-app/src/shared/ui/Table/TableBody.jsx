import React from 'react';
import TableRow from './TableRow';

/**
 * Table body component
 * Internal component used by Table
 */
const TableBody = ({ data, columns, onRowClick }) => {
  return (
    <tbody>
      {data.map((row, index) => (
        <TableRow
          key={row.id || index}
          row={row}
          columns={columns}
          onClick={onRowClick}
        />
      ))}
    </tbody>
  );
};

export default TableBody;