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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';

import useLocalStorageDataKeys from '../../../Tabs/UseLocalStorage/UseLocalStorage';
import './DataTable.scss';

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer className="dataTable__scroll" component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />,
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

function FixedHeaderContent({
  columns,
  allColumns,
  sortKey,
  sortDirection,
  handleSort,
  anchorEl,
  setAnchorEl,
  visibleColumns,
  toggleColumnVisibility,
  resetVisibleColumns, // Функция для сброса видимости колонок
}) {
  const handleMenuOpen = (event, column) => {
    setAnchorEl({ anchor: event.currentTarget, column });
  };

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
            <MoreVertIcon onClick={(e) => handleMenuOpen(e, column)} sx={{ cursor: 'pointer', marginLeft: '10px' }} />
          </span>

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
        </TableCell>
      ))}
    </TableRow>
  );
}

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

export default function DataTable({ columns, rows, headerFieldsDataKeys, loadMoreRows, hasMore }) {
  const [sortKey, setSortKey] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');
  const [visibleColumns, setVisibleColumns] = useLocalStorageDataKeys(
    'visibleColumns',
    headerFieldsDataKeys,
  );
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSort = (dataKey) => {
    if (sortKey === dataKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(dataKey);
      setSortDirection('asc');
    }
  };

  const resetVisibleColumns = () => {
    window.localStorage.removeItem('visibleColumns');
    setVisibleColumns(headerFieldsDataKeys);
  };

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
    width: col.width || 100,
  }));

  const filteredColumns = processedColumns.filter((col) => visibleColumns.includes(col.dataKey));

  const toggleColumnVisibility = (dataKey) => {
    setVisibleColumns((prev) => (prev.includes(dataKey) ? prev.filter((key) => key !== dataKey) : [...prev, dataKey]));
  };

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
            resetVisibleColumns={resetVisibleColumns}
          />
        )}
        itemContent={(index, row) => rowContent(filteredColumns, index, row)}
        rangeChanged={handleRangeChanged}
      />
    </Paper>
  );
}