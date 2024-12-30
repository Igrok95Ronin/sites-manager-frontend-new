import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso'; // Библиотека для виртуализации больших таблиц
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';

import useLocalStorageDataKeys from '../../../Tabs/UseLocalStorage/UseLocalStorage'; // Хук для работы с localStorage
import './DataTable.scss';

// Компоненты для виртуализации таблицы
const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer className="dataTable__scroll" component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

/**
 * Компонент для отображения заголовка таблицы с возможностью сортировки и настройки видимости столбцов.
 */
function FixedHeaderContent({
  columns, // Отображаемые столбцы
  allColumns, // Все доступные столбцы
  sortKey, // Ключ текущей сортировки
  sortDirection, // Направление текущей сортировки
  handleSort, // Функция для изменения сортировки
  anchorEl, // Элемент для управления открытием меню
  setAnchorEl, // Функция для управления меню
  visibleColumns, // Массив видимых столбцов
  toggleColumnVisibility, // Функция для переключения видимости столбцов
}) {
  // Открытие меню для управления видимостью колонок
  const handleMenuOpen = (event, column) => {
    setAnchorEl({ anchor: event.currentTarget, column });
  };

  // Закрытие меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric ? 'right' : 'left'}
          style={{ width: column.width }}
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid #ccc',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '7px 10px 0px',
            cursor: 'pointer',
          }}
        >
          {/* Заголовок столбца с сортировкой */}
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span onClick={() => handleSort(column.dataKey)}>
              {column.label}
              {sortKey === column.dataKey ? (
                sortDirection === 'asc' ? (
                  <ArrowDropUpIcon />
                ) : (
                  <ArrowDropDownIcon />
                )
              ) : (
                <span style={{ visibility: 'hidden' }}>
                  <ArrowDropDownIcon />
                </span>
              )}
            </span>
            {/* Иконка для открытия меню */}
            <MoreVertIcon onClick={(e) => handleMenuOpen(e, column)} sx={{ cursor: 'pointer', marginLeft: '10px' }} />
          </span>

          {/* Меню для настройки видимости столбцов */}
          <Menu
            anchorEl={anchorEl?.anchor}
            open={Boolean(anchorEl?.anchor) && anchorEl?.column?.dataKey === column.dataKey}
            onClose={handleMenuClose}
            MenuListProps={{
              style: { maxHeight: 300, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' },
            }}
          >
            {allColumns.map((col) => (
              <MenuItem
                key={col.dataKey}
                onClick={() => {
                  toggleColumnVisibility(col.dataKey);
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Checkbox checked={visibleColumns.includes(col.dataKey)} />
                {col.label}{<span> {col.dataKey}</span>}
              </MenuItem> 
            ))}
          </Menu>
        </TableCell>
      ))}
    </TableRow>
  );
}

/**
 * Компонент для отображения строки таблицы
 */
function rowContent(columns, _index, row) {
  return (
    <>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric ? 'right' : 'left'}
          sx={{
            border: '1px solid #ccc',
            backgroundColor: _index % 2 === 0 ? '#f9f9f9' : 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '6px',
          }}
        >
          {row[column.dataKey]}
        </TableCell>
      ))}
    </>
  );
}

/**
 * Основной компонент таблицы с виртуализацией и настройкой видимости столбцов
 */
export default function DataTable({ columns, rows, headerFieldsDataKeys, loadMoreRows, hasMore }) {
  const [sortKey, setSortKey] = React.useState(null); // Текущий ключ сортировки
  const [sortDirection, setSortDirection] = React.useState('asc'); // Текущее направление сортировки
  const [visibleColumns, setVisibleColumns] = useLocalStorageDataKeys(
    'visibleColumns', // Ключ для сохранения состояния в localStorage
    headerFieldsDataKeys, // Начальные видимые столбцы
  );
  const [anchorEl, setAnchorEl] = React.useState(null); // Элемент для управления открытием меню

  // Функция для изменения сортировки
  const handleSort = (dataKey) => {
    if (sortKey === dataKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(dataKey);
      setSortDirection('asc');
    }
  };

  // Сортировка строк
  const sortedRows = React.useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDirection]);

  const processedColumns = columns.map((col) => ({
    ...col,
    width: col.width || 100, // Установка ширины по умолчанию
  }));

  const filteredColumns = processedColumns.filter((col) => visibleColumns.includes(col.dataKey));

  // Функция для переключения видимости столбцов
  const toggleColumnVisibility = (dataKey) => {
    setVisibleColumns((prev) => (prev.includes(dataKey) ? prev.filter((key) => key !== dataKey) : [...prev, dataKey]));
  };

  // Обработчик для подгрузки данных при скролле
  const handleRangeChanged = (range) => {
    const visiblePercentage = (range.endIndex / rows.length) * 100;
    if (visiblePercentage >= 80 && hasMore) {
      loadMoreRows();
    }
  };

  return (
    <Paper style={{ height: '88vh', width: '100%' }}>
      <TableVirtuoso
        data={sortedRows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={() => (
          <FixedHeaderContent
            columns={filteredColumns}
            allColumns={processedColumns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            handleSort={handleSort}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            visibleColumns={visibleColumns}
            toggleColumnVisibility={toggleColumnVisibility}
          />
        )}
        itemContent={(index, row) => rowContent(filteredColumns, index, row)}
        rangeChanged={handleRangeChanged}
      />
    </Paper>
  );
}
