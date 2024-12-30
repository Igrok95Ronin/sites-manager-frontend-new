import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';

export default function ColumnMenu({
  anchorEl,
  handleMenuClose,
  allColumns,
  visibleColumns,
  toggleColumnVisibility,
  resetVisibleColumns,
}) {
  const handleToggleColumn = (dataKey) => {
    if (visibleColumns.length > 1 || !visibleColumns.includes(dataKey)) {
      toggleColumnVisibility(dataKey);
    }
  };

  return (
    <Menu
      anchorEl={anchorEl?.anchor}
      open={Boolean(anchorEl?.anchor)}
      onClose={handleMenuClose}
      MenuListProps={{
        style: { maxHeight: 300, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' },
      }}
    >
      {allColumns.map((col) => (
        <MenuItem
          key={col.dataKey}
          onClick={() => handleToggleColumn(col.dataKey)}
          sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Checkbox
            checked={visibleColumns.includes(col.dataKey)}
            disabled={visibleColumns.length === 1 && visibleColumns.includes(col.dataKey)}
          />
          {col.label}{col.dataKey}
        </MenuItem>
      ))}
      <MenuItem
        onClick={() => {
          resetVisibleColumns();
          handleMenuClose();
        }}
        sx={{
          gridColumn: 'span 3',
          justifyContent: 'center',
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'red',
        }}
      >
        Показывать только Headers
      </MenuItem>
    </Menu>
  );
}
