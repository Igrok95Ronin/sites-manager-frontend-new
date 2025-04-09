import * as React from 'react';
import axiosInstance from '../../../axiosInstance'; // Используем централизованный экземпляр Axios
// Импортируем компоненты из MUI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableSortLabel } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography'; // Добавь в импорт

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';



import './Table.scss'; // Импорт стилей для таблицы

export default function Tables({ data, fetchData, formattedDuration, setError }) {
  // Стейт для хранения по какому полю сортируем
  const [orderBy, setOrderBy] = React.useState('domain');
  // Стейт для направления сортировки: 'asc' или 'desc'
  const [order, setOrder] = React.useState('asc');
  const [statusOK, setStatusOK] = React.useState(0);
  const [statusNotOK, setStatusNotOK] = React.useState(0);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState(null);

  const handleOpenDialog = (id) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedId(null);
  };

  // console.log(data);

  // Функция, вызываемая при нажатии на заголовок таблицы
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'; // если клик по текущему полю и сортировка уже по возрастанию
    setOrder(isAsc ? 'desc' : 'asc'); // меняем направление сортировки
    setOrderBy(property); // обновляем поле сортировки
  };

  // Сортируем данные каждый раз, когда изменяется data, orderBy или order
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      // Приводим строки к нижнему регистру, чтобы сравнение было корректным
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      // Если сортируем по дате (например, CreatedAt)
      if (orderBy.toLowerCase().includes('createdat')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Возвращаем отсортированные значения
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, orderBy, order]);

  // Следить за доменом или остановить
  const handleStopClick = async (id) => {
    try {
      await axiosInstance.patch(`/donottrack/${id}`);
      fetchData(); // обновим таблицу после запроса
    } catch (error) {
      setError(error);
      console.error('Ошибка при отключении отслеживания:', error);
    }
  };

  // Удалить домен из отслеживать
  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/removedomainfromtrack/${selectedId}`);
      console.log(`Домен с ID ${selectedId} удалён из отслеживания`);
      fetchData();
    } catch (error) {
      setError(error);
      console.error('Ошибка при удалении домена:', error);
    } finally {
      handleCloseDialog();
    }
  };

  React.useEffect(() => {
    const count = data.filter((item) => item.responseCode === 200).length;
    setStatusOK(count);
    const countNot = data.filter((item) => item.responseCode !== 200 && item.source !== true).length;
    setStatusNotOK(countNot);
  }, [data]);

  return (
    <section className="domainMonitoring">
      <div className="container">
        <div className="domainMonitoring__box">
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 'bold',
              fontSize: '',
              mb: 2,
              borderBottom: '2px solid #1976d2',
              display: 'inline-block',
              paddingBottom: '4px',
              color: '#1976d2',
            }}
          >
            Мониторинг доменов каждый : {formattedDuration}
          </Typography>
          {/* '#4caf50' : '#FF5722' */}
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 'bold',
              fontSize: '',
              ml: 2,
              borderBottom: '2px solid #4caf50',
              display: 'inline-block',
              paddingBottom: '4px',
              color: '#4caf50',
            }}
          >
            200 / {statusOK}
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 'bold',
              fontSize: '',
              ml: 2,
              borderBottom: '2px solid #FF5722',
              display: 'inline-block',
              paddingBottom: '4px',
              color: '#FF5722',
            }}
          >
            0 / {statusNotOK}
          </Typography>
          {/* // Контейнер таблицы с максимальной высотой и возможностью прокрутки */}
          <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
            {/* Таблица с фиксированной шапкой */}
            <Table stickyHeader size="small" sx={{ minWidth: 650 }} aria-label="domain monitoring table">
              <TableHead>
                <TableRow>
                  {/* Заголовок: Домен */}
                  <TableCell
                    className="domainMonitoring__headerCell"
                    sortDirection={orderBy === 'domain' ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === 'domain'}
                      direction={orderBy === 'domain' ? order : 'asc'}
                      onClick={() => handleSort('domain')}
                    >
                      Домен
                    </TableSortLabel>
                  </TableCell>

                  {/* Заголовок: Статус */}
                  {/* <TableCell
                    className="domainMonitoring__headerCell"
                    sortDirection={orderBy === 'status' ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Статус
                    </TableSortLabel>
                  </TableCell> */}

                  {/* Заголовок: Код ответа */}
                  <TableCell
                    className="domainMonitoring__headerCell"
                    sortDirection={orderBy === 'responseCode' ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === 'responseCode'}
                      direction={orderBy === 'responseCode' ? order : 'asc'}
                      onClick={() => handleSort('responseCode')}
                    >
                      Код ответа
                    </TableSortLabel>
                  </TableCell>

                  {/* Заголовок: В отслеживании */}
                  <TableCell
                    className="domainMonitoring__headerCell"
                    sortDirection={orderBy === 'track' ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === 'track'}
                      direction={orderBy === 'track' ? order : 'asc'}
                      onClick={() => handleSort('track')}
                    >
                      В отслеживании
                    </TableSortLabel>
                  </TableCell>

                  {/* Заголовок: Дата создания */}
                  <TableCell className="domainMonitoring__headerCell">
                    <TableSortLabel
                      active={orderBy === 'CreatedAt'}
                      direction={orderBy === 'CreatedAt' ? order : 'asc'}
                      onClick={() => handleSort('CreatedAt')}
                    >
                      Меню
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* Рендер отсортированных данных */}
                {sortedData.map((item) =>
                  item.source ? (
                    ''
                  ) : (
                    <TableRow key={item.ID}>
                      <TableCell>
                        <a
                          className="domainMonitoring__link"
                          href={item.domain}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {/* Убираем приставку */}
                          {item.domain.replace(/^https?:\/\//, '')}
                        </a>
                      </TableCell>
                      {/* <TableCell>{item.status}</TableCell> */}
                      <TableCell
                        sx={{
                          backgroundColor: item.responseCode === 200 ? '#4caf50' : '#FF5722',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {item.responseCode}
                      </TableCell>
                      <TableCell>{item.track ? 'Да' : 'Нет'}</TableCell>
                      <TableCell>
                        <Stack sx={{ display: 'flex', gap: '10px' }} direction="row">
                          <Button
                            onClick={() => handleStopClick(item.ID)}
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: item.track === true ? '#198754' : '#FF5722',
                              fontSize: '10px',
                              '&:hover': {
                                backgroundColor: '#198754',
                              },
                            }}
                          >
                            {item.track !== true ? 'Мониторить' : 'Остановить'}
                          </Button>
                          <Button
                            onClick={() => handleOpenDialog(item.ID)}
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: '#d32f2f',
                              fontSize: '10px',
                              '&:hover': {
                                backgroundColor: '#b91f1f',
                              },
                            }}
                          >
                            Удалить
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Вы уверены, что хотите удалить этот домен из отслеживания? Это действие необратимо.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Отмена
              </Button>
              <Button onClick={handleConfirmDelete} color="error">
                Удалить
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
