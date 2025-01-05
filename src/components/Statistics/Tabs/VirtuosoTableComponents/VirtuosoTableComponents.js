// VirtuosoTableComponents.js

import React from 'react';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';

// =========================================
// 4) Определяем VirtuosoTableComponents
// =========================================
export const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'auto' }} />,
  TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};
