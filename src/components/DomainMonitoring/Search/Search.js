import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import axiosInstance from '../../../axiosInstance';

import './Search.scss';

const Search = ({ onSearch, numberOfDomains, setError, isMonitoring, setIsMonitoring }) => {
  const [interval, setInterval] = React.useState(1);
  const [typeTime, setTypeTime] = React.useState('1h');

  const handleInputChange = (e) => {
    onSearch(e.target.value);
  };

  // Формируем массив от 1 до 99
  const intervalOptions = Array.from({ length: 99 }, (_, i) => i + 1);

  const timeTypes = ['1s', '1m', '1h'];

  // Запуск мониторинга
  const handleStart = async () => {
    try {
      await axiosInstance.post('/start-monitoring', {
        interval,
        typeTime,
      });
      setIsMonitoring(true); // ✅ Обновляем состояние сразу
      // fetchData(); // Перезагрузим данные
    } catch (err) {
      console.error('Ошибка при запуске мониторинга:', err);
      setError(err);
    }
  };

  // Остановка мониторинга
  const handleStop = async () => {
    try {
      await axiosInstance.post('/stop-monitoring');
      setIsMonitoring(false); // ✅ Обновляем состояние сразу
      // fetchData(); // Обновим таблицу после остановки
    } catch (err) {
      console.error('Ошибка при остановке мониторинга:', err);
      setError(err);
    }
  };

  return (
    <section className="search">
      <div className="search__container">
        <div className="search__box">
          <Box sx={{ maxWidth: '100%' }} className="search__box">
            <TextField
              className="search__textField"
              id="standard-basic"
              label="Search"
              variant="standard"
              onChange={handleInputChange}
            />
          </Box>
          <span className="search__number">{numberOfDomains}</span>

          {/* Выпадающий список интервала */}
          <TextField
            select
            label="Интервал"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            size="small"
            sx={{ minWidth: 100, mx: 1 }}
          >
            {intervalOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Выпадающий список типа времени */}
          <TextField
            select
            label="Тип времени"
            value={typeTime}
            onChange={(e) => setTypeTime(e.target.value)}
            size="small"
            sx={{ minWidth: 100, mx: 1 }}
          >
            {timeTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option.slice(-1)}
              </MenuItem>
            ))}
          </TextField>

          {/* Кнопки управления */}
          <Stack direction="row" spacing={1} sx={{ mx: 1 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrowIcon />}
              size="small"
              onClick={handleStart}
              disabled={isMonitoring} // <-- если мониторинг запущен, кнопка Старт неактивна
            >
              Старт
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              size="small"
              onClick={handleStop}
              disabled={!isMonitoring}
            >
              Стоп
            </Button>
          </Stack>
        </div>
      </div>
    </section>
  );
};

export default Search;
