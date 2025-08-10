import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../../axiosInstance';
import { Virtuoso } from 'react-virtuoso';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import Spinner from '../Spinner/Spinner';

import './Logs.scss';

const APIURL = process.env.REACT_APP_APIURL;
const LIMIT = 100;

// Регулярное выражение для очистки ANSI кодов и лишних символов
// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1b\[[0-9;]*m|\[\d+m/g;

// Функция для определения типа лога
const getLogType = (logText) => {
  const upperText = logText.toUpperCase();
  if (upperText.includes('ERRO') || upperText.includes('ERROR') || upperText.includes('FATAL')) return 'error';
  if (upperText.includes('WARN')) return 'warning';
  if (upperText.includes('INFO')) return 'info';
  return 'info'; // По умолчанию info вместо default
};

// Функция для получения иконки по типу лога
const getLogIcon = (type) => {
  switch (type) {
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

// Функция для очистки и форматирования текста лога
const cleanLogText = (text) => {
  return text
    .replace(ANSI_REGEX, '') // Убираем ANSI коды
    .replace(/\[36m|\[0m|\[31m|\[33m/g, '') // Убираем старые ANSI коды
    .trim();
};

// Компонент для отображения отдельного лога
const LogItem = React.memo(({ log, index }) => {
  const cleanText = cleanLogText(log);
  const logType = getLogType(cleanText);
  const icon = getLogIcon(logType);
  
  return (
    <Box className={`logs__item logs__item--${logType}`}>
      <Box className="logs__item-header">
        {icon}
        <Typography variant="caption" className="logs__item-type">
          {logType.toUpperCase()}
        </Typography>
        <Typography variant="caption" className="logs__item-index">
          #{index + 1}
        </Typography>
      </Box>
      <Typography className="logs__item-text">
        {cleanText}
      </Typography>
    </Box>
  );
});

// Основной компонент логов
function LogsComponent() {
  const [logs, setLogs] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Мемоизированная функция для загрузки логов
  const loadLogs = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const response = await axiosInstance.get(`${APIURL}/logs`, {
        params: { offset, limit: LIMIT },
      });

      const newLogs = response.data.logs || [];
      
      if (newLogs.length === 0) {
        setHasMore(false);
        return;
      }

      setLogs((prevLogs) => [...prevLogs, ...newLogs]);
      setOffset((prevOffset) => prevOffset + LIMIT);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading, hasMore]);

  // Мемоизированная статистика логов
  const logStats = useMemo(() => {
    const stats = { total: logs.length, info: 0, warning: 0, error: 0 };
    logs.forEach(log => {
      const type = getLogType(log);
      if (stats[type] !== undefined) {
        stats[type]++;
      }
    });
    return stats;
  }, [logs]);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="logs">
      <div className="container">
        <Box className="logs__header">
          <Typography variant="h5" className="logs__title">
            Системные логи
          </Typography>
          <Box className="logs__stats">
            <Chip 
              label={`Всего: ${logStats.total}`} 
              className="logs__stat-chip logs__stat-chip--total"
              size="small"
            />
            <Chip 
              label={`INFO: ${logStats.info}`} 
              className="logs__stat-chip logs__stat-chip--info"
              size="small"
            />
            <Chip 
              label={`WARN: ${logStats.warning}`} 
              className="logs__stat-chip logs__stat-chip--warning"
              size="small"
            />
            <Chip 
              label={`ERROR: ${logStats.error}`} 
              className="logs__stat-chip logs__stat-chip--error"
              size="small"
            />
          </Box>
        </Box>
        
        <Paper className="logs__container">
          <Virtuoso
            data={logs}
            itemContent={(index, log) => (
              <LogItem log={log} index={index} />
            )}
            endReached={loadLogs}
            overscan={10}
            className="logs__virtuoso"
          />
          {isLoading && (
            <Box className="logs__loading">
              <Spinner loading={isLoading} />
            </Box>
          )}
        </Paper>
      </div>
    </section>
  );
}

export default LogsComponent;
