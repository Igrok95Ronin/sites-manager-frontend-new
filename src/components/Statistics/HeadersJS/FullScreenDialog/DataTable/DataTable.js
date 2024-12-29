import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

import './DataTable.scss';

// Компоненты для использования в таблице виртуализации
const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => <TableContainer className="dataTable__scroll" component={Paper} {...props} ref={ref} />),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

function fixedHeaderContent(columns, sortKey, sortDirection, handleSort) {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width }}
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid #ccc',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '7px 10px 0px',
            cursor: 'pointer', // Указатель мыши для заголовков
          }}
          onClick={() => handleSort(column.dataKey)} // Обработчик клика
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {column.label}
            {sortKey === column.dataKey ? (
              sortDirection === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
            ) : (
              <span style={{ visibility: 'hidden' }}> {/* Для выравнивания */}
                <ArrowDropDownIcon />
              </span>
            )}
          </span>
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(columns, _index, row) {
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric || false ? 'right' : 'left'}
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
    </React.Fragment>
  );
}

export default function DataTable({ columns, rows, headerFieldsDataKeys }) {
  const [sortKey, setSortKey] = React.useState(null); // Ключ сортировки
  const [sortDirection, setSortDirection] = React.useState('asc'); // Направление сортировки

  const handleSort = (dataKey) => {
    if (sortKey === dataKey) {
      // Если уже сортируем по этому ключу, меняем направление
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Устанавливаем новый ключ сортировки
      setSortKey(dataKey);
      setSortDirection('asc');
    }
  };

  const sortedRows = React.useMemo(() => {
    if (!sortKey) return rows; // Если сортировка не выбрана, возвращаем исходные данные
    const sorted = [...rows].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, sortKey, sortDirection]);

  const processedColumns = columns.map((col) => ({
    ...col,
    width: col.width || 100,
  }));

  const filteredColumns = processedColumns.filter((col) => headerFieldsDataKeys.includes(col.dataKey));

  return (
    <Paper style={{ height: '88vh', width: '100%' }}>
      <TableVirtuoso
        data={sortedRows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={() => fixedHeaderContent(filteredColumns, sortKey, sortDirection, handleSort)}
        itemContent={(index, row) => rowContent(filteredColumns, index, row)}
      />
    </Paper>
  );
}
