import React, { useState, useEffect } from 'react'; // Добавлен импорт useState
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import './Search.scss';

const Search = ({ onSearch, numberOfDomains, limit, setLimit, searchField, setSearchField, columns }) => {
  // Функция для обработки изменений в поле ввода
  const handleInputChange = (e) => {
    onSearch(e.target.value); // Вызываем функцию из родительского компонента для обновления поискового запроса
  };

  // Рассчитываем значение для sm динамически
  const smValue = Math.min(Math.max(Math.ceil(columns.length / 8), 10), 6.5); // Динамическое значение от 4 до 12

  // Локальное состояние для поля limit
  const [localLimit, setLocalLimit] = useState(limit);

  // Синхронизируем localLimit с limit при его изменении
  useEffect(() => {
    setLocalLimit(limit);
  }, [limit]);

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
    setSearchField(event.target.value);
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
          width: '2px', // Ширина линии
          height: '50px', // Высота линии
          backgroundColor: '#ccc', // Цвет линии
          margin: '0 0px', // Отступы слева и справа
        }}
      ></div>

      {/* Поля для ввода количества строк и выбора поля поиска */}
      <Box
        sx={{
          display: 'flex', // Flexbox для размещения дочерних элементов
          gap: '16px', // Отступы между элементами
          flexWrap: 'wrap', // Позволяет перенос строк
        }}
      >
        {/* Поле для ввода количества строк */}
        <Tooltip title="Количества строк" arrow>
          <Grid item xs={2.8}>
            <TextField
              // label="Количество строк"
              type="number"
              variant="standard"
              value={localLimit}
              onChange={handleLimitChange}
              onBlur={handleLimitBlur}
              fullWidth
              inputProps={{ min: 1 }}
              sx={{
                width: '60px', // Фиксированная ширина
                paddingBottom: '10px',
                '& .MuiInputBase-input': {
                  color: '#1976d2', // Цвет текста
                  fontWeight: 'bold', // Жирность текста
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
              value={searchField}
              label="Поле поиска"
              onChange={handleSearchFieldChange}
              sx={{
                '& .MuiSelect-select': {
                  padding: '4px 8px', // Уменьшение внутреннего паддинга
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
          width: '2px', // Ширина линии
          height: '50px', // Высота линии
          backgroundColor: '#ccc', // Цвет линии
          margin: '0 0px', // Отступы слева и справа
        }}
      ></div>
    </div>
  );
};

export default Search;
