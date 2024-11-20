import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import EditGA from '../EditGA/EditGA';
import AddGoogleAccount from '../AddGoogleAccount/AddGoogleAccount';

import './Table.scss'; // Импорт стилей для таблицы

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    cursor: 'pointer', // Добавляем курсор указатель для заголовков
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // скрываем последнюю границу
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function Tables({ items, onUpdateGoogleAccounts, setLoading }) {
  const [order, setOrder] = React.useState('asc'); // Направление сортировки
  const [orderBy, setOrderBy] = React.useState('account_id'); // Столбец для сортировки
  const [callEditGoogleAccount, setCallEditGoogleAccount] =
    React.useState(false); // Оправить запрос на сервер для редактирования GA
  const [dataGA, setDataGa] = React.useState({}); // Данные которые нужно отпарвить на сервер для обновнения статуса

  const handleClickBtn = (account_id, status) => {
    setCallEditGoogleAccount(true);

    if (status === 'new') {
      status = 'blocked';
    } else {
      status = 'new';
    }

    const data = {
      account_id: account_id,
      status: status,
    };
    setDataGa(data);
  };

  // Обработчик сортировки при клике на заголовок столбца
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Сортируем данные на основе состояния сортировки
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [items, order, orderBy]);

  return (
    <section className="googleAccount">
      <div className="container">
        <div className="googleAccount__box">
          <TableContainer
            className="googleAccount__container"
            component={Paper}
          >
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead className="googleAccount__header">
                <TableRow className="googleAccount__row">
                  {/* Используем TableSortLabel для добавления сортировки */}
                  <StyledTableCell
                    className="googleAccount__headerCell"
                    onClick={() => handleSort('account_id')}
                  >
                    <TableSortLabel
                      active={orderBy === 'account_id'}
                      direction={orderBy === 'account_id' ? order : 'asc'}
                    >
                      account_id
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell
                    className="googleAccount__headerCell"
                    onClick={() => handleSort('email')}
                  >
                    <TableSortLabel
                      active={orderBy === 'email'}
                      direction={orderBy === 'email' ? order : 'asc'}
                    >
                      email
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell
                    className="googleAccount__headerCell"
                    onClick={() => handleSort('gtag_id')}
                  >
                    <TableSortLabel
                      active={orderBy === 'gtag_id'}
                      direction={orderBy === 'gtag_id' ? order : 'asc'}
                    >
                      gtag_id
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell
                    className="googleAccount__headerCell"
                    onClick={() => handleSort('gtag_key')}
                  >
                    <TableSortLabel
                      active={orderBy === 'gtag_key'}
                      direction={orderBy === 'gtag_key' ? order : 'asc'}
                    >
                      gtag_key
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell
                    className="googleAccount__headerCell"
                    onClick={() => handleSort('status')}
                  >
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                    >
                      status
                    </TableSortLabel>
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody className="googleAccount__body">
                {sortedItems.map((row, i) => (
                  <StyledTableRow key={i}>
                    <StyledTableCell>{row.account_id}</StyledTableCell>
                    <StyledTableCell>{row.email}</StyledTableCell>
                    <StyledTableCell>{row.gtag_id}</StyledTableCell>
                    <StyledTableCell>{row.gtag_key}</StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row">
                        <Button
                          onClick={() => {
                            handleClickBtn(row.account_id, row.status);
                          }}
                          variant="contained"
                          sx={{
                            backgroundColor:
                              row.status === 'new' ? '#198754' : '#d32f2f',
                            fontSize: '11px',
                            '&:hover': {
                              backgroundColor:
                                row.status === 'new' ? 'darkgreen' : '#b91f1f',
                            },
                          }}
                        >
                          {row.status}
                        </Button>
                      </Stack>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {callEditGoogleAccount && (
            <EditGA
              setCallEditGoogleAccount={setCallEditGoogleAccount}
              dataGA={dataGA}
              onUpdateGoogleAccounts={onUpdateGoogleAccounts}
              setLoading={setLoading}
            />
          )}

          {/* Компонент вызова формы добавления GA */}
          <AddGoogleAccount onUpdateGoogleAccounts={onUpdateGoogleAccounts} />
        </div>
      </div>
    </section>
  );
}
