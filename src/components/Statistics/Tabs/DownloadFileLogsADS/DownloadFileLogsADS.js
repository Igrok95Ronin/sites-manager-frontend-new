import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
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
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import axios from 'axios';
import { format } from 'date-fns';
import axiosInstance from '../../../../axiosInstance';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Иконка для подсказки

const APIURL = process.env.REACT_APP_APIURL;

// Описание каждого чекбокса
const fieldDescriptions = {
  createdAt: 'Дата и время посещения сайта',
  gclid: 'Google Click Identifier — используется для отслеживания рекламных кликов',
  IP: 'IP-адрес пользователя',
  headers: 'Заголовки HTTP-запроса пользователя',
  jsData: 'Данные, собранные с помощью JavaScript (например, язык, плагин и т.д.)',
  timeSpent: 'Время, проведённое на сайте пользователем',
  clickCoordinates: 'Координаты кликов на странице',
  scrollCoordinates: 'Данные о прокрутке страницы пользователем',
  clickOnNumber: 'Факт нажатия на номер телефона (если был)',
  accountID: 'ID аккаунта, связанного с пользователем (если применимо)',
  companyID: 'ID компании, которой принадлежит аккаунт',
  keyword: 'Ключевое слово, по которому пришёл пользователь',
  device: 'Устройство пользователя (мобильное, десктоп и т.д.)',
  fingerprint: 'Цифровой отпечаток браузера',
  isChecked: 'Флаг, был ли пользователь помечен как подозрительный/проверенный',
};

const DownloadFileLogsADS = ({ showDownloadFileLogsADS, setShowDownloadFileLogsADS }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [domain, setDomain] = useState('');
  const [limit, setLimit] = useState('');
  const [fields, setFields] = useState(Object.fromEntries(Object.keys(fieldDescriptions).map((key) => [key, true])));
  const [domains, setDomains] = useState([]);
  const [subDomains, setSubDomains] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Получение доменов и поддоменов
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
    if (showDownloadFileLogsADS) fetchDomains();
  }, [showDownloadFileLogsADS]);

  const domainsSubDomains = [...domains.map((d) => d.domain), ...subDomains.map((s) => s.subDomain)];

  const handleClose = () => setShowDownloadFileLogsADS(false);

  const handleCheckboxChange = (event) => {
    setFields({ ...fields, [event.target.name]: event.target.checked });
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownload = () => {
    if (!startDate || !endDate || !domain) {
      return setSnackbar({ open: true, message: 'Заполните все обязательные поля.', severity: 'warning' });
    }

    if (startDate > endDate) {
      return setSnackbar({ open: true, message: 'Начальная дата позже конечной.', severity: 'warning' });
    }

    const data = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      domain,
      limit,
      ...fields,
    };

    const fileName = () => {
      const now = new Date();
      return `${domain}-${now.toISOString().replace(/[:.]/g, '-')}`;
    };

    setLoading(true);
    axios
      .post(`${APIURL}/downloadfilelogsads`, data, { responseType: 'blob' })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setSnackbar({ open: true, message: 'Файл успешно скачан.', severity: 'success' });
        handleClose();
      })
      .catch((error) => {
        console.error(error);
        setSnackbar({ open: true, message: 'Ошибка при скачивании файла.', severity: 'error' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Dialog open={showDownloadFileLogsADS} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', fontWeight: 600 }}>📄 Скачать CSV с логами ADS</DialogTitle>

        <DialogContent sx={{ backgroundColor: '#fafafa' }}>
          <Paper elevation={1} sx={{ padding: 4, borderRadius: 3 }}>
            <Grid container spacing={4}>
              {/* Дата начала / конца */}
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
                  <DatePicker
                    label="📅 Начальная дата"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField variant="outlined" fullWidth {...params} />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
                  <DatePicker
                    label="📅 Конечная дата"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField variant="outlined" fullWidth {...params} />}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Домен и лимит */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>🌐 Домен</InputLabel>
                  <Select label="Домен" value={domain} onChange={(e) => setDomain(e.target.value)}>
                    {domainsSubDomains.map((dom, i) => (
                      <MenuItem key={i} value={dom}>
                        {dom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="🔢 Кол-во логов"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <DialogContentText sx={{ fontSize: '0.9rem', mt: 1 }}>
                  Оставьте пустым, чтобы скачать все логи
                </DialogContentText>
              </Grid>

              {/* Чекбоксы */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  🧩 Выберите поля для CSV
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(fields).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Tooltip title={fieldDescriptions[key]} placement="top" arrow>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={handleCheckboxChange}
                              name={key}
                              color="primary"
                              sx={{ '&.Mui-checked': { color: '#1976d2' } }}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {key}
                              <InfoOutlinedIcon fontSize="small" color="action" />
                            </Box>
                          }
                        />
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>

        {/* Кнопки */}
        <DialogActions sx={{ px: 4, pb: 3, backgroundColor: '#f5f5f5' }}>
          <Button
            variant="outlined"
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DownloadFileLogsADS;
