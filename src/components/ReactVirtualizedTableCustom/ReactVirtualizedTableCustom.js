import * as React from 'react';
import { useState } from 'react'; // Импортируем useState
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel'; // Импортируем TableSortLabel
import Button from '@mui/material/Button';
import { TableVirtuoso } from 'react-virtuoso';

// Определяем столбцы таблицы
const columns = [
  { label: 'ID', dataKey: 'ID' },
  { label: 'Domain', dataKey: 'Domain' },
  { label: 'IP', dataKey: 'IP' },
  { label: 'ClickCoordinates', dataKey: 'ClickCoordinates' },
  { label: 'ScrollCoordinates', dataKey: 'ScrollCoordinates' },
  { label: 'TimeSpent', dataKey: 'TimeSpent' },
  { label: 'Device', dataKey: 'Device' },
  { label: 'Company ID', dataKey: 'CompanyID' },
  { label: 'Account ID', dataKey: 'AccountID' },
  { label: 'Keyword', dataKey: 'Keyword' },
];

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
    />
  ),
  TableHead: React.forwardRef((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

export default function ReactVirtualizedTableCustom({
  dataLogs,
  fetchData,
  hasMore,
}) {
  const [order, setOrder] = useState('desc'); // Состояние направления сортировки
  const [orderBy, setOrderBy] = useState('ID'); // Состояние поля сортировки

  function handleSort(property) {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }

  const sortedDataLogs = React.useMemo(() => {
    return [...dataLogs].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [dataLogs, order, orderBy]);

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.numeric || false ? 'right' : 'left'}
            style={{ width: column.width }}
            sx={{ backgroundColor: 'background.paper', cursor: 'pointer' }}
            onClick={() => handleSort(column.dataKey)} // Обработчик клика
          >
            <TableSortLabel
              active={orderBy === column.dataKey}
              direction={orderBy === column.dataKey ? order : 'asc'}
            >
              {column.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function rowContent(_index, row) {
    return (
      <React.Fragment>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.numeric || false ? 'right' : 'left'}
            sx={{
              backgroundColor: '#f4fdfe', // Цвета для строк
            }}
          >
            {column.dataKey === 'Domain' ? (
              <Button
                href={`https://${row[column.dataKey]}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1976d2',
                  fontWeight: '500',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                }}
              >
                {row[column.dataKey]}
              </Button>
            ) : (
              row[column.dataKey]
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  }

  return (
    <Paper style={{ height: '70vh', width: '100%' }}>
      <TableVirtuoso
        data={sortedDataLogs} // Передаем отсортированные данные
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
        endReached={hasMore ? fetchData : null} // Если нужно, оставляем без изменений
      />
    </Paper>
  );
}
