import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  DialogContentText,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import axios from 'axios';
import { format } from 'date-fns';
import axiosInstance from '../../../../axiosInstance';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

const DownloadFileLogsADS = ({
  showDownloadFileLogsADS,
  setShowDownloadFileLogsADS,
}) => {
  // Состояния для формы
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [domain, setDomain] = useState('');
  const [limit, setLimit] = useState('');
  const [fields, setFields] = useState({
    createdAt: true,
    gclid: true,
    IP: true,
    headers: true,
    jsData: true,
    timeSpent: true,
    clickCoordinates: true,
    scrollCoordinates: true,
    clickOnNumber: true,
    accountID: true,
    companyID: true,
    keyword: true,
    device: true,
    isChecked: true,
  });
  const [domains, setDomains] = useState([]); // Данные доменов
  const [subDomains, setSubDomains] = useState([]); // Поддомены
  // Состояние для отслеживания, был ли выполнен запрос

  // Функция для получения доменов и поддоменов
  const fetchDomains = async () => {
    try {
      setLoading(true);
      const [domainsResponse, subDomainsResponse] = await Promise.all([
        axiosInstance.get('/viewdomains'),
        axiosInstance.get('/viewsubdomains'),
      ]);

      setDomains(domainsResponse.data);
      setSubDomains(subDomainsResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDownloadFileLogsADS) {
      fetchDomains();
    }
  }, [showDownloadFileLogsADS]);

  //  Все домены и поддомены
  const domainsSubDomains = [
    ...domains.map((domain) => domain.domain),
    ...subDomains.map((subDomain) => subDomain.subDomain),
  ];

  // Состояния для уведомлений и загрузки
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });
  const [loading, setLoading] = useState(false);

  // Обработчик закрытия модального окна
  const handleClose = () => {
    setShowDownloadFileLogsADS(false);
  };

  // Обработчик изменения чекбоксов
  const handleCheckboxChange = (event) => {
    setFields({
      ...fields,
      [event.target.name]: event.target.checked,
    });
  };

  // Обработчик закрытия Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Обработчик отправки формы и скачивания CSV
  const handleDownload = () => {
    // Проверка обязательных полей
    if (!startDate || !endDate || !domain) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, заполните все обязательные поля.',
        severity: 'warning',
      });
      return;
    }

    // Проверка логики дат
    if (startDate > endDate) {
      setSnackbar({
        open: true,
        message: 'Начальная дата не может быть позже конечной.',
        severity: 'warning',
      });
      return;
    }

    // Формирование данных для отправки
    const data = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      domain,
      limit,
      ...fields,
    };

    //  Название скачанного файла будет название домена с датой
    const nameDownloadFile = () => {
      const date = new Date();
      const UserLogsAds = `${domain}${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
      return UserLogsAds;
    };
    // ${APIURL}
    // Отправка POST-запроса с использованием Axios
    setLoading(true);
    axios
      .post(`${APIURL}/downloadfilelogsads`, data, {
        responseType: 'blob',
      })
      .then((response) => {
        // Создание URL для скачивания файла
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nameDownloadFile() + '.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        // Показ уведомления об успехе
        setSnackbar({
          open: true,
          message: 'Файл успешно скачан.',
          severity: 'success',
        });

        // Закрытие модального окна после успешной загрузки
        handleClose();
      })
      .catch((error) => {
        console.error('Ошибка при скачивании файла:', error);
        setSnackbar({
          open: true,
          message: 'Не удалось скачать файл. Проверьте консоль для деталей.',
          severity: 'error',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box>
      <Dialog
        open={showDownloadFileLogsADS}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Скачать CSV с логами ADS</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Поля с календарём */}
              <Grid item xs={12} sm={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ruLocale}
                >
                  <DatePicker
                    label="Начальная дата"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    inputFormat="dd-MM-yyyy"
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ruLocale}
                >
                  <DatePicker
                    label="Конечная дата"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    inputFormat="dd-MM-yyyy"
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Выпадающий список доменов */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="domain-select-label">Домен</InputLabel>
                  <Select
                    labelId="domain-select-label"
                    id="domain-select"
                    value={domain}
                    label="Домен"
                    onChange={(e) => setDomain(e.target.value)}
                  >
                    {domainsSubDomains.map((dom, i) => (
                      <MenuItem key={i} value={dom}>
                        {dom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Поле ввода лимита */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Количество  логов"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <DialogContentText>
                  Оставить пустыме если нужно сохранить все логи
                </DialogContentText>
              </Grid>

              {/* Чекбоксы для выбора полей */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Выберите поля для включения в CSV
                </Typography>
                <FormGroup row>
                  {Object.keys(fields).map((key) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={fields[key]}
                          onChange={handleCheckboxChange}
                          name={key}
                          color="primary"
                        />
                      }
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="warning"
            href="https://drive.google.com/drive/u/0/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Диск
          </Button>
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Скачивание...' : 'Скачать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DownloadFileLogsADS;
