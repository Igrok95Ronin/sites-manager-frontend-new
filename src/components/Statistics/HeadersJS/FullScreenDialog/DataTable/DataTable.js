import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';

import './DataTable.scss';

// Компоненты для использования в таблице виртуализации
const VirtuosoTableComponents = {
  // Контейнер для таблицы
  Scroller: React.forwardRef((props, ref) => <TableContainer className='dataTable__scroll' component={Paper} {...props} ref={ref} />),
  // Основной элемент таблицы
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />), // Заголовок таблицы
  TableRow, // Строка таблицы
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />), // Тело таблицы
};

// Генерация заголовков таблицы
function fixedHeaderContent(columns) {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey} // Уникальный ключ для столбца
          variant="head" // Указывает, что это заголовочная ячейка
          align={column.numeric || false ? 'right' : 'left'} // Выравнивание текста
          style={{ width: column.width }} // Задает ширину столбца
          sx={{
            backgroundColor: 'background.paper', // Цвет фона
            border: '1px solid #ccc', // Граница ячеек
            fontWeight: 'bold', // Жирный шрифт для заголовков
            whiteSpace: 'nowrap', // Запрет переноса текста
            overflow: 'hidden', // Скрытие лишнего текста
            textOverflow: 'ellipsis', // Добавление многоточия
            padding: '7px 10px 0px', // Уменьшаем отступы
          }}
        >
          {column.label} {/* Текст заголовка */}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Генерация контента строки
function rowContent(columns, _index, row) {
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey} // Уникальный ключ для ячейки
          align={column.numeric || false ? 'right' : 'left'} // Выравнивание текста
          sx={{
            border: '1px solid #ccc', // Граница ячеек
            backgroundColor: _index % 2 === 0 ? '#f9f9f9' : 'white', // Чередование цветов строк
            whiteSpace: 'nowrap', // Запрет переноса текста
            overflow: 'hidden', // Скрытие лишнего текста
            textOverflow: 'ellipsis', // Добавление многоточия
            padding: '6px', // Уменьшаем отступы
          }}
        >
          {row[column.dataKey]} {/* Значение из строки данных */}
        </TableCell>
      ))}
    </React.Fragment>
  );
}

// Основной компонент таблицы
export default function DataTable({ columns, rows, headerFieldsDataKeys }) {
  // Устанавливаем значение по умолчанию для width, если оно отсутствует
  const processedColumns = columns.map((col) => ({
    ...col,
    width: col.width || 100, // Установка ширины по умолчанию
  }));

  // Фильтруем колонки, оставляя только те, которые указаны в headerFieldsDataKeys
  const filteredColumns = processedColumns.filter((col) => headerFieldsDataKeys.includes(col.dataKey));

  return (
    <Paper style={{ height: 800, width: '100%' }}>
      {' '}
      {/* Контейнер с фиксированной высотой */}
      <TableVirtuoso
        data={rows} // Передача данных для отображения
        components={VirtuosoTableComponents} // Пользовательские компоненты для таблицы
        fixedHeaderContent={() => fixedHeaderContent(filteredColumns)} // Заголовки таблицы
        itemContent={(index, row) => rowContent(filteredColumns, index, row)} // Контент для каждой строки
      />
    </Paper>
  );
}
