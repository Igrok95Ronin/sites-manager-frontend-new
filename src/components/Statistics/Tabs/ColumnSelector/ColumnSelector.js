import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  FormControlLabel,
  Checkbox,
  Button,
  Menu,
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
// import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';

import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import Tooltip from '@mui/material/Tooltip';

// Импортируем компоненты для выбора даты
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import ResetCheckedForm from '../ResetCheckedForm/ResetCheckedForm';
import DownloadFileLogsADS from '../DownloadFileLogsADS/DownloadFileLogsADS';
import Spinner from '../../../Spinner/Spinner';
import SnackbarCustom from '../../../SnackbarCustom/SnackbarCustom';

import './ColumnSelector.scss';

// Компонент для выбора столбцов, фильтрации по дате, количеству строк и выбору поля для поиска
const ColumnSelector = ({
  // Полный список столбцов (массив объектов {label, dataKey})
  columns,

  // Массив "видимых" dataKey (строки), вместо объектов
  visibleDataKeys,
  setVisibleDataKeys,

  startDate,
  setStartDate,
  endDate,
  setEndDate,
  limit,
  setLimit,
  searchField,
  setSearchField,
  headerFieldsDataKeys,
  jsDataFieldsDataKeys,
  setCheckedRows,
  defaultVisibleColumns, // Важный проп: массив объектов {label, dataKey} по умолчанию
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Локальное состояние для поля limit
  const [localLimit, setLocalLimit] = useState(limit);

  // Флаг для формы «снять все отмеченные чекбоксы»
  const [resetCheckedForm, setResetCheckedForm] = useState(false);

  // Флаг для формы «скачать файл»
  const [showDownloadFileLogsADS, setShowDownloadFileLogsADS] = useState(false);

  // Состояния для управления загрузкой / ошибками
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);

  // Синхронизируем localLimit с limit при его изменении
  useEffect(() => {
    setLocalLimit(limit);
  }, [limit]);

  // Открытие меню
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Закрытие меню
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Обработка выбора/снятия конкретного столбца
  const handleToggleColumn = (column) => {
    const alreadyVisible = visibleDataKeys.includes(column.dataKey);
    let newDataKeys = [...visibleDataKeys];

    if (alreadyVisible) {
      // Убираем dataKey из массива
      newDataKeys = newDataKeys.filter((key) => key !== column.dataKey);
    } else {
      // Добавляем dataKey
      newDataKeys.push(column.dataKey);
    }

    // Сортируем dataKey в соответствии с исходным порядком в `columns`
    newDataKeys.sort(
      (a, b) => columns.findIndex((col) => col.dataKey === a) - columns.findIndex((col) => col.dataKey === b),
    );

    // Обновляем хранилище dataKey
    setVisibleDataKeys(newDataKeys);
  };

  // Функция для снятия всех полей, кроме одного
  const handleUncheckAllExceptOne = () => {
    // Оставляем видимым только первый столбец
    const firstColumn = columns[0];
    setVisibleDataKeys([firstColumn.dataKey]);
  };

  // Функция для выбора всех столбцов
  const handleCheckAllColumns = () => {
    // Берём все dataKey из columns
    const allKeys = columns.map((col) => col.dataKey);
    setVisibleDataKeys(allKeys);
  };

  // Отметить только поля Headers (по списку dataKey)
  const handleSelectHeaderFields = () => {
    const selectedDataKeys = columns
      .filter((column) => headerFieldsDataKeys.includes(column.dataKey))
      .map((col) => col.dataKey);
    setVisibleDataKeys(selectedDataKeys);
  };

  // Отметить только поля JSData (по списку dataKey)
  const handleSelectJSDataFields = () => {
    const selectedDataKeys = columns
      .filter((column) => jsDataFieldsDataKeys.includes(column.dataKey))
      .map((col) => col.dataKey);
    setVisibleDataKeys(selectedDataKeys);
  };

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
    <>
      {/* Кнопка скачать файл */}
      <Tooltip title="Скачать файл" arrow>
        <Button
          sx={{ padding: '6px 0 6px 8px', minWidth: '25px' }}
          startIcon={<SimCardDownloadIcon />}
          onClick={() => {
            setShowDownloadFileLogsADS(true);
          }}
        />
      </Tooltip>

      {/* Кнопка снять все отмеченные чекбоксы */}
      <Tooltip title="Снять все отмеченные чекбоксы" arrow>
        <Button
          sx={{ padding: '6px 0 6px 8px', minWidth: '25px' }}
          startIcon={<RotateLeftIcon />}
          onClick={() => {
            setResetCheckedForm(true);
          }}
        />
      </Tooltip>

      {/* Кнопка «Столбцы по умолчанию» */}
      <Tooltip title="Столбцы по умолчанию" arrow>
        <Button
          sx={{ padding: '6px 0 6px 8px', minWidth: '25px' }}
          startIcon={<ViewWeekIcon />}
          onClick={() => {
            // Показываем стандартное окно подтверждения
            const confirmed = window.confirm('Вы уверены, что хотите сбросить столбцы к значениям по умолчанию?');
            if (confirmed) {
              // Берём dataKey из массива defaultVisibleColumns:
              const defaultKeys = defaultVisibleColumns.map((col) => col.dataKey);
              setVisibleDataKeys(defaultKeys);
            }
          }}
        />
      </Tooltip>

      {/* Кнопка настроек */}
      <Tooltip title="Настроить столбцы" arrow>
        <Button
          sx={{
            padding: '6px 0 6px 0px',
            minWidth: '25px',
            marginRight: '20px',
          }}
          startIcon={<MoreVertIcon />}
          onClick={handleClick}
        />
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxWidth: 600,
            padding: '16px',
            marginLeft: '-100px', // Сдвигаем меню на 100 пикселей влево
          },
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Верхняя часть: Выбор даты */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Начальная дата"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Конечная дата"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>

          {/* Поля для ввода количества строк и выбора поля поиска */}
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Поле для ввода количества строк */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Количество строк"
                  type="number"
                  value={localLimit}
                  onChange={handleLimitChange}
                  onBlur={handleLimitBlur}
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Select для выбора поля поиска */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="search-field-label">Поле поиска</InputLabel>
                  <Select
                    labelId="search-field-label"
                    value={searchField}
                    label="Поле поиска"
                    onChange={handleSearchFieldChange}
                  >
                    {columns.map((column) => (
                      <MenuItem key={column.dataKey} value={column.dataKey}>
                               <span className='columnSelector__fieldsSearch'>{column.label}{column.dataKey}</span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Разделитель */}
          <Box sx={{ my: 2 }}>
            <hr />
          </Box>

          {/* Средняя часть: Выбор столбцов */}
          <Typography variant="subtitle1" gutterBottom>
            Выберите столбцы
          </Typography>
          <Grid container spacing={1}>
            {columns.map((column) => {
              const isChecked = visibleDataKeys.includes(column.dataKey);
              const isDisabled = visibleDataKeys.length === 1 && isChecked;

              return (
                <Grid item xs={12} sm={6} key={column.dataKey}>
                  <FormControlLabel
                    control={
                      <Checkbox checked={isChecked} onChange={() => handleToggleColumn(column)} disabled={isDisabled} />
                    }
                    label={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {column.label}
                        <span>{column.dataKey}</span>
                      </div>
                    }
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* Нижняя часть: Кнопки */}
          <Box sx={{ mt: 10 }}>
            <Grid className="columnSelector__btnPosition" container spacing={1}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleUncheckAllExceptOne}
                  disabled={visibleDataKeys.length === 1}
                  fullWidth
                >
                  Снять все кроме первого
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" color="warning" onClick={handleSelectHeaderFields} fullWidth>
                  Поля Headers
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckAllColumns}
                  disabled={visibleDataKeys.length === columns.length}
                  fullWidth
                >
                  Показать все столбцы
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" color="error" onClick={handleSelectJSDataFields} fullWidth>
                  Поля JSData
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Menu>

      {/* Отображение спиннера/ошибок */}
      {error && <SnackbarCustom data={data} error={error} />}
      {loading && <Spinner loading={loading} />}
      {data && !error && <SnackbarCustom data={data} error={error} />}

      {/* Модалка «Сбросить отмеченные чекбоксы» */}
      {resetCheckedForm && (
        <ResetCheckedForm
          resetCheckedForm={resetCheckedForm}
          setResetCheckedForm={setResetCheckedForm}
          setLoading={setLoading}
          setError={setError}
          setData={setData}
          setCheckedRows={setCheckedRows}
        />
      )}

      {/* Модалка «Скачать файл» */}
      {showDownloadFileLogsADS && (
        <DownloadFileLogsADS
          showDownloadFileLogsADS={showDownloadFileLogsADS}
          setShowDownloadFileLogsADS={setShowDownloadFileLogsADS}
          setLoading={setLoading}
          setError={setError}
          setData={setData}
        />
      )}
    </>
  );
};

export default ColumnSelector;
