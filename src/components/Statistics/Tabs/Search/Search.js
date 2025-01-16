import React from 'react';
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Tooltip, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';

import './Search.scss';
import useLocalStorage from '../UseLocalStorage/UseLocalStorage'; // Импортируем кастомный хук

const Search = ({
  onSearch,
  numberOfDomains,
  limit,
  setLimit,
  searchField,
  setSearchField,
  columns,
  loadMoreRows,
  loading,
  hasMore,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  // Используем кастомный хук для сохранения limit
  const [localLimit, setLocalLimit] = useLocalStorage('search_limit', limit);

  // Используем кастомный хук для сохранения searchField
  const [localSearchField, setLocalSearchField] = useLocalStorage('search_searchField', searchField);

  // Функция для обработки изменений в поле ввода
  const handleInputChange = (e) => {
    onSearch(e.target.value);
  };

  // Рассчитываем значение для sm динамически
  const smValue = Math.min(Math.max(Math.ceil(columns.length / 8), 10), 6.5);

  // Обработка изменения localLimit
  const handleLimitChange = (event) => {
    const value = event.target.value;
    setLocalLimit(value);
  };

  // Обработка потери фокуса на поле limit
  const handleLimitBlur = () => {
    const number = parseInt(localLimit, 10);
    if (!isNaN(number) && number > 0 && number <= 10000) {
      setLimit(number);
    }
  };

  // Обработка изменения поля поиска
  const handleSearchFieldChange = (event) => {
    const value = event.target.value;
    setLocalSearchField(value);
    setSearchField(value);
  };

  // Обработчик для кнопок быстрого фильтра по датам
  const handleQuickFilter = (days) => {
    if (days === 'm') {
      setStartDate(startOfMonth(new Date())); // Устанавливаем начало месяца
      setEndDate(endOfMonth(new Date())); // Устанавливаем конец месяца
    } else {
      setStartDate(subDays(new Date(), days)); // Устанавливаем начальную дату
      setEndDate(new Date()); // Устанавливаем сегодняшнюю дату
    }
  };

  return (
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

      {/* Вертикальный разделитель */}
      <div
        style={{
          width: '2px',
          height: '50px',
          backgroundColor: '#ccc',
          margin: '0 0px',
        }}
      ></div>

      {/* Поля для ввода количества строк и выбора поля поиска */}
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          minWidth: '205px',
        }}
      >
        {/* Поле для ввода количества строк */}
        <Tooltip title="Количество строк" arrow>
          <Grid item xs={2.8}>
            <TextField
              type="number"
              variant="standard"
              value={localLimit}
              onChange={handleLimitChange}
              onBlur={handleLimitBlur}
              fullWidth
              inputProps={{ min: 1 }}
              sx={{
                width: '60px',
                paddingBottom: '10px',
                '& .MuiInputBase-input': {
                  color: '#1976d2',
                  fontWeight: 'bold',
                },
              }}
            />
          </Grid>
        </Tooltip>

        {/* Select для выбора поля поиска */}
        <Grid item xs={0} sm={smValue}>
          <FormControl>
            <InputLabel id="search-field-label">Поле поиска</InputLabel>
            <Select
              labelId="search-field-label"
              value={localSearchField}
              label="Поле поиска"
              onChange={handleSearchFieldChange}
              sx={{
                '& .MuiSelect-select': {
                  padding: '4px 8px',
                },
              }}
            >
              {columns.map((column) => (
                <MenuItem key={column.dataKey} value={column.dataKey}>
                  <span className="columnSelector__fieldsSearch">
                    {column.label}
                    {column.dataKey}
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Box>

      {/* Вертикальный разделитель */}
      <div
        style={{
          width: '2px',
          height: '50px',
          backgroundColor: '#ccc',
          margin: '0 0px',
        }}
      ></div>
      {hasMore && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <Button
            sx={{ whiteSpace: 'nowrap' }}
            variant="outlined"
            size="small"
            onClick={loadMoreRows}
            disabled={loading}
          >
            Загрузить ещё
          </Button>
        </div>
      )}

      {/* Вертикальный разделитель */}
      <div
        style={{
          width: '2px',
          height: '50px',
          backgroundColor: '#ccc',
          margin: '0 0px',
        }}
      ></div>

      {/* Верхняя часть: Выбор даты */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
        <Grid
          sx={{
            '& .MuiGrid-item': {
              paddingBottom: '4px', // Изменяем верхний отступ
            },
          }}
          container
          spacing={1}
        >
          <Grid item xs={12} sm={3.0}>
            <DatePicker
              label="Начальная дата"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '10px',
                    },
                    '& .MuiInputLabel-root': {
                      lineHeight: '0.8375em',
                      fontSize: '0.8em',
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3.0}>
            <DatePicker
              label="Конечная дата"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '10px',
                    },
                    '& .MuiInputLabel-root': {
                      lineHeight: '0.8375em',
                      fontSize: '0.8em',
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Кнопки для быстрого выбора дат */}
          <Grid className="search__buttonsDate" item xs={12} sm={1}>
            <Tooltip title="Показать данные по дням" arrow>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px' }}>
                <Button
                  sx={{ minWidth: '25px', padding: '0px', backgroundColor: '#009688' }}
                  variant="contained"
                  size="small"
                  onClick={() => handleQuickFilter(1)}
                >
                  1
                </Button>
                <Button
                  sx={{ minWidth: '25px', padding: '0px', backgroundColor: '#009688' }}
                  variant="contained"
                  size="small"
                  onClick={() => handleQuickFilter(7)}
                >
                  7
                </Button>
                <Button
                  sx={{ minWidth: '25px', padding: '0px', backgroundColor: '#009688' }}
                  variant="contained"
                  size="small"
                  onClick={() => handleQuickFilter(10)}
                >
                  10
                </Button>
                <Button
                  sx={{ minWidth: '25px', padding: '0px', backgroundColor: '#009688' }}
                  variant="contained"
                  size="small"
                  onClick={() => handleQuickFilter('m')}
                >
                  M
                </Button>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </div>
  );
};

export default Search;
