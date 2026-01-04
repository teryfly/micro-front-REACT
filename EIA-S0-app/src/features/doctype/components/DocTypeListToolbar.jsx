/**
 * DocType List Toolbar Component
 * Search input and create button
 * @module DocTypeListToolbar
 */

import React from 'react';
import Input from '../../../shared/ui/Form/Input';
import Button from '../../../shared/ui/Button';

/**
 * DocType list toolbar with search and create button
 * @param {Object} props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {Function} props.onCreateClick - Create button click handler
 * 
 * @example
 * <DocTypeListToolbar
 *   searchTerm={search}
 *   onSearchChange={setSearch}
 *   onCreateClick={handleCreate}
 * />
 */
const DocTypeListToolbar = ({ searchTerm, onSearchChange, onCreateClick }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '16px', 
      marginBottom: '16px',
      alignItems: 'flex-end'
    }}>
      <div style={{ flex: 1, maxWidth: '400px' }}>
        <Input
          name="search"
          label="Search"
          placeholder="Search by code or name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Button onClick={onCreateClick} variant="primary">
        + Create DocType
      </Button>
    </div>
  );
};

export default DocTypeListToolbar;