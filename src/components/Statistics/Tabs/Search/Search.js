import React from 'react';
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

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
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <Button variant="outlined" size="small" onClick={loadMoreRows} disabled={loading}>
            Загрузить ещё
          </Button>
        </div>
      )}
    </div>
  );
};

export default Search;
