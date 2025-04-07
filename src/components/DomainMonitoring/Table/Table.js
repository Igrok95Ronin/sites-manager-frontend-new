import * as React from 'react';
// Импортируем компоненты из MUI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableSortLabel } from '@mui/material';

import './Table.scss'; // Импорт стилей для таблицы

export default function Tables({ data }) {
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

  return (
    <section className="domainMonitoring">
      <div className="container">
        <div className="domainMonitoring__box">
          {/* // Контейнер таблицы с максимальной высотой и возможностью прокрутки */}
          <TableContainer component={Paper} sx={{ maxHeight: '89vh' }}>
            {/* Таблица с фиксированной шапкой */}
            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="domain monitoring table">
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
                  <TableCell
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
                  </TableCell>

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
                  <TableCell
                    className="domainMonitoring__headerCell"
                    sortDirection={orderBy === 'CreatedAt' ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === 'CreatedAt'}
                      direction={orderBy === 'CreatedAt' ? order : 'asc'}
                      onClick={() => handleSort('CreatedAt')}
                    >
                      Создан
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* Рендер отсортированных данных */}
                {sortedData.map((item) => (
                  <TableRow key={item.ID}>
                    <TableCell>
                      <a
                        className="domainMonitoring__link"
                        href={item.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.domain}
                      </a>
                    </TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.responseCode}</TableCell>
                    <TableCell>{item.track ? 'Да' : 'Нет'}</TableCell>
                    <TableCell>{new Date(item.CreatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </section>
  );
}
