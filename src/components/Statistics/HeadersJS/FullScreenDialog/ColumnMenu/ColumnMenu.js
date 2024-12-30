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
  label, // Метка для определения типа (Headers или JS)
}) {
  const storageKey = label === 'Headers' ? 'visibleColumnsHeaders' : 'visibleColumnsJS';

  console.log('Label:', label);
  console.log('Storage Key:', storageKey);

  const handleToggleColumn = (dataKey) => {
    if (visibleColumns.length === 1 && visibleColumns.includes(dataKey)) {
      // Блокируем снятие последнего поля
      return;
    }

    let updatedColumns;

    if (visibleColumns.includes(dataKey)) {
      updatedColumns = visibleColumns.filter((key) => key !== dataKey);
    } else {
      updatedColumns = [...visibleColumns, dataKey];
    }

    // Обновляем localStorage только для текущего storageKey
    localStorage.setItem(storageKey, JSON.stringify(updatedColumns));
    toggleColumnVisibility(dataKey); // Обновляем состояние
  };

  const handleResetVisibleColumns = () => {
    // Удаляем данные только для текущего storageKey
    localStorage.removeItem(storageKey);

    // Сбрасываем видимые колонки
    resetVisibleColumns();

    // Закрываем меню
    handleMenuClose();
  };

  return (
    <Menu
      anchorEl={anchorEl?.anchor}
      open={Boolean(anchorEl?.anchor)}
      onClose={handleMenuClose}
      MenuListProps={{
        style: { maxHeight: 500, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' },
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
            disabled={visibleColumns.length === 1 && visibleColumns.includes(col.dataKey)} // Блокировка снятия последнего
          />
          {col.label}
          {col.dataKey}
        </MenuItem>
      ))}
      <MenuItem
        onClick={handleResetVisibleColumns}
        sx={{
          gridColumn: 'span 4',
          justifyContent: 'center',
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'green',
        }}
      >
        Только {label}
      </MenuItem>
    </Menu>
  );
}
