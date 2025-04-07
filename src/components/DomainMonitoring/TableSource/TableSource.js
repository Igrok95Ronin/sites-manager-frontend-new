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

import './TableSource.scss'; // Импорт стилей для таблицы

export default function Tables({ data, fetchData, setError }) {
  // Стейт для хранения по какому полю сортируем
  const [orderBy, setOrderBy] = React.useState('domain');
  // Стейт для направления сортировки: 'asc' или 'desc'
  const [order, setOrder] = React.useState('asc');

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

  // Удалить домен из отслеживать
  const handleDeleteClick = async (id) => {
    try {
      await axiosInstance.delete(`/removedomainfromtrack/${id}`);
      console.log(`Домен с ID ${id} удалён из отслеживания`);
      fetchData(); // обновим таблицу после удаления
    } catch (error) {
      setError(error);
      console.error('Ошибка при удалении домена:', error);
    }
  };

  return (
    <section className="domainMonitoring">
      <div className="container">
        <div className="domainMonitoring__box">
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              borderBottom: '2px solid #1976d2',
              display: 'inline-block',
              paddingBottom: '4px',
              color: '#1976d2',
            }}
          >
            Источники доменов
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

                  {/* Заголовок: Дата создания */}
                  <TableCell className="domainMonitoring__headerCell"   align="right">
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
                {sortedData.map(
                  (item) =>
                    item.source && (
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

                        <TableCell>
                          <Stack sx={{ display: 'flex', gap: '10px' }} justifyContent="flex-end" direction="row">
                            <Button
                              onClick={() => handleDeleteClick(item.ID)}
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
        </div>
      </div>
    </section>
  );
}
