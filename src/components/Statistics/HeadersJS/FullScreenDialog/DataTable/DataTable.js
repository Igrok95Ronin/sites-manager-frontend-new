import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

export default function DataTable({ allColumns, rows, headerFieldsDataKeys }) {
  // Фильтруем колонки, оставляя только поля из includeFields
  const filteredColumns = allColumns.filter((col) => headerFieldsDataKeys.includes(col.dataKey));

  // Функция для расчёта ширины колонки с учётом maxWidth
  const calculateColumnWidth = (field, maxWidth = 500) => {
    const maxLength = Math.max(...rows.map((row) => (row[field] ? String(row[field]).length : 0)));
    return Math.min(Math.max(maxLength * 10, 100), maxWidth); // Минимум 100, максимум maxWidth
  };

  // Преобразуем отфильтрованные колонки в формат DataGrid
  const dataGridColumns = filteredColumns.map((col) => ({
    field: col.dataKey,
    renderHeader: () => col.label,
    width: calculateColumnWidth(col.dataKey, col.maxWidth || 500), // Учитываем maxWidth для каждой колонки
    filterable : false
  }));

  return (
    <Paper sx={{ height: 800, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={dataGridColumns}
        getRowId={(row) => row.ID} // Указываем поле ID как уникальный идентификатор
        // initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10, 100]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
