import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance'; // Используем централизованный экземпляр Axios
import { Virtuoso } from 'react-virtuoso';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Spinner from '../Spinner/Spinner';

import './Logs.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

// Количество строк для загрузки за раз
const limit = 100;

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
    <TableHead {...props} ref={ref}>
      {fixedHeaderContent()}
    </TableHead>
  )),
  TableBody: React.forwardRef((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
  TableRow,
};

// Компонент для рендеринга заголовка таблицы
function fixedHeaderContent() {
  return (
    <TableRow>
      <TableCell
        variant="head"
        align="left"
        sx={{ backgroundColor: 'background.paper' }}
      >
        Log Entry
      </TableCell>
    </TableRow>
  );
}

// Основной компонент виртуализированной таблицы
function ReactVirtualizedTable() {
  const [logs, setLogs] = useState([]); // Состояние для хранения логов
  const [offset, setOffset] = useState(0); // Состояние для отслеживания смещения
  const [isLoading, setIsLoading] = useState(false); // Флаг загрузки

  // Функция для загрузки логов с сервера
  const loadLogs = async () => {
    if (isLoading) return; // Если идет загрузка, ничего не делаем
    setIsLoading(true); // Устанавливаем флаг загрузки

    try {
      const response = await axiosInstance.get(`${APIURL}/logs`, {
        params: { offset, limit },
      });

      // Убираем мусор
      const formattedLogs = response.data.logs.map((logs) =>
        logs.replace('[36m', '').replace('[0m', ' ').replace('[31m', ' ').replace('[33m', ' '),
      );

      setLogs((prevLogs) => [...prevLogs, ...formattedLogs]);
      setOffset(offset + limit);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="logs">
      <div className="container">
        <div className="logs__number">{logs.length}</div>
        <div className="logs__box">
          <Paper className="logs__paper">
            <Virtuoso
              data={logs}
              components={VirtuosoTableComponents}
              itemContent={(_index, log) => (
                <Table>
                  <TableBody>
                    <TableRow
                      className={
                        log.includes('INFO') ? 'logs__info' : 'logs__error'
                      }
                    >
                      <TableCell align="left">
                        <span className="logs__font">{log}</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
              endReached={loadLogs}
            />
          </Paper>
          {isLoading && <Spinner loading={isLoading} />}
        </div>
      </div>
    </section>
  );
}

export default ReactVirtualizedTable;
