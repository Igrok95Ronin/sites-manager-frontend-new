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
  columns,
  visibleColumns,
  setVisibleColumns,
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
  defaultVisibleColumns,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  // Локальное состояние для поля limit
  const [localLimit, setLocalLimit] = useState(limit);
  const [resetCheckedForm, setResetCheckedForm] = useState(false);
  const [showDownloadFileLogsADS, setShowDownloadFileLogsADS] = useState(false); // Показать форму скачивания файла
  // Создаем состояние для отслеживания процесса загрузки данных
  const [loading, setLoading] = React.useState(false);
  // Создаем состояние для хранения ошибок, которые могут возникнуть при запросе
  const [error, setError] = React.useState(null);
  // Создаем состояние для хранения данных, полученных в результате запроса
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

  // Обработка выбора столбца
  const handleToggleColumn = (column) => {
    let newVisibleColumns;
    const isColumnVisible = visibleColumns.some(
      (col) => col.dataKey === column.dataKey,
    );

    if (isColumnVisible) {
      // Удаляем столбец из видимых
      newVisibleColumns = visibleColumns.filter(
        (col) => col.dataKey !== column.dataKey,
      );
    } else {
      // Добавляем столбец к видимым
      newVisibleColumns = [...visibleColumns, column];
    }

    // Сортируем столбцы в соответствии с исходным порядком
    newVisibleColumns.sort(
      (a, b) =>
        columns.findIndex((col) => col.dataKey === a.dataKey) -
        columns.findIndex((col) => col.dataKey === b.dataKey),
    );

    // Обновляем состояние
    setVisibleColumns(newVisibleColumns);
  };

  // Функция для снятия всех полей кроме одного
  const handleUncheckAllExceptOne = () => {
    // Оставляем видимым первый столбец из списка columns
    const firstColumn = columns[0];
    setVisibleColumns([firstColumn]);
  };

  // Функция для выбора всех столбцов
  const handleCheckAllColumns = () => {
    setVisibleColumns(columns);
  };

  // Добавляем функцию для отметки полей Headers
  const handleSelectHeaderFields = () => {
    const selectedColumns = columns.filter((column) =>
      headerFieldsDataKeys.includes(column.dataKey),
    );
    setVisibleColumns(selectedColumns);
  };

  // Добавляем функцию для отметки полей Headers
  const handleSelectJSDataFields = () => {
    const selectedColumns = columns.filter((column) =>
      jsDataFieldsDataKeys.includes(column.dataKey),
    );
    setVisibleColumns(selectedColumns);
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
        ></Button>
      </Tooltip>
      {/* Кнопка снять все отмеченные чекбоксы */}
      <Tooltip title="Снять все отмеченные чекбоксы" arrow>
        <Button
          sx={{ padding: '6px 0 6px 8px', minWidth: '25px' }}
          startIcon={<RotateLeftIcon />}
          onClick={() => {
            setResetCheckedForm(true);
          }}
        ></Button>
      </Tooltip>
      {/* Кнопка Столбцы по умолчанию */}
      <Tooltip title="Столбцы по умолчанию" arrow>
        <Button
          sx={{ padding: '6px 0 6px 8px', minWidth: '25px' }}
          startIcon={<ViewWeekIcon />}
          onClick={() => {
            // Показываем стандартное окно подтверждения
            const confirmed = window.confirm(
              'Вы уверены, что хотите сбросить столбцы к значениям по умолчанию?',
            );
            if (confirmed) {
              setVisibleColumns(defaultVisibleColumns); // Сбрасываем видимые столбцы
            }
          }}
        ></Button>
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
        ></Button>
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
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ruLocale}
          >
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
                        {column.label}
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
              const isChecked = visibleColumns.some(
                (col) => col.dataKey === column.dataKey,
              );
              const isDisabled = visibleColumns.length === 1 && isChecked;

              return (
                <Grid item xs={12} sm={6} key={column.dataKey}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleColumn(column)}
                        disabled={isDisabled}
                      />
                    }
                    label={column.label}
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
                  disabled={visibleColumns.length === 1}
                  fullWidth
                >
                  Снять все кроме первого
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleSelectHeaderFields}
                  fullWidth
                >
                  Поля Headers
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckAllColumns}
                  disabled={visibleColumns.length === columns.length}
                  fullWidth
                >
                  Показать все столбцы
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleSelectJSDataFields}
                  fullWidth
                >
                  Поля JSData
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Menu>
      {error && <SnackbarCustom data={data} error={error} />}
      {loading && <Spinner loading={loading} />}
      {data && !error && <SnackbarCustom data={data} error={error} />}
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
