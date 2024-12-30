import React from 'react';
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import useLocalStorageDataKeys from '../../../Tabs/UseLocalStorage/UseLocalStorage';
import ColumnMenu from '../ColumnMenu/ColumnMenu';
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
  resetVisibleColumns,
  label,
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
        </TableCell>
      ))}
      <ColumnMenu
        anchorEl={anchorEl}
        handleMenuClose={handleMenuClose}
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
        resetVisibleColumns={resetVisibleColumns}
        label={label}
      />
    </TableRow>
  );
}

function rowContent(columns, _index, row) {
  const rowBackgroundColor = row.ClickOnNumber ? 'rgb(211, 248, 212)' : _index % 2 === 0 ? '#f9f9f9' : 'white';

  return (
    <>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric ? 'right' : 'left'}
          sx={{
            border: '1px solid #ccc',
            backgroundColor: rowBackgroundColor, // Условный стиль для всей строки
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '6px',
          }}
        >
          {/* Условное отображение иконки для ClickOnNumber */}
          {column.dataKey === 'ClickOnNumber' ? (
            row.ClickOnNumber ? <CheckIcon color="success" /> : <CloseIcon color="error" />
          ) : (
            row[column.dataKey]
          )}
        </TableCell>
      ))}
    </>
  );
}


export default function DataTable({ columns, rows, headerFieldsDataKeys, loadMoreRows, hasMore, label }) {
  const storageKey = label === 'Headers' ? 'visibleColumnsHeaders' : 'visibleColumnsJS';
  const [sortKey, setSortKey] = React.useState(null);
  const [sortDirection, setSortDirection] = React.useState('asc');
  const [visibleColumns, setVisibleColumns] = useLocalStorageDataKeys(storageKey, headerFieldsDataKeys);
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
    window.localStorage.removeItem(storageKey);
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
            label={label}
          />
        )}
        itemContent={(index, row) => rowContent(filteredColumns, index, row)}
        rangeChanged={handleRangeChanged}
      />
    </Paper>
  );
}
