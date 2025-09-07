import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
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
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import axios from 'axios';
import { startOfDay, endOfDay } from 'date-fns';
import axiosInstance from '../../../../axiosInstance';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Иконка для подсказки

const APIURL = process.env.REACT_APP_APIURL;

// Описание каждого чекбокса
const fieldDescriptions = {
  id: 'Уникальный идентификатор записи в базе данных. Используется для однозначной идентификации каждого визита',
  createdAt: 'Точная дата и время посещения сайта пользователем (формат: ГГГГ-ММ-ДД ЧЧ:ММ:СС)',
  gclid: 'Google Click Identifier — уникальный параметр Google Ads для отслеживания эффективности рекламных кампаний и конверсий',
  host: 'Полное доменное имя сайта, который посетил пользователь (например: example.com)',
  IP: 'IP-адрес пользователя — сетевой адрес устройства, с которого был совершен визит',
  headers: 'HTTP-заголовки браузера пользователя, включая User-Agent, язык, реферер и другую техническую информацию',
  jsData: 'Данные JavaScript о браузере: язык системы, разрешение экрана, установленные плагины, часовой пояс и другие параметры',
  timeSpent: 'Общее время в секундах, которое пользователь провел на сайте во время данного визита',
  clickCoordinates: 'Точные координаты (X, Y) всех кликов пользователя на странице для анализа поведения',
  scrollCoordinates: 'Данные о прокрутке страницы: глубина скролла, скорость, паттерны прокрутки',
  clickOnNumber: 'Индикатор того, кликнул ли пользователь на видимый номер телефона на странице (true/false)',
  clickOnInvisibleNumber: 'Индикатор клика на скрытый/невидимый номер телефона, используемый для отслеживания (true/false)',
  accountID: 'Идентификатор Google Ads аккаунта, с которого пришел пользователь (если применимо)',
  companyID: 'Идентификатор рекламной кампании в Google Ads, откуда пришел пользователь',
  keyword: 'Ключевое слово или поисковый запрос, по которому пользователь нашел и перешел на сайт',
  device: 'Тип устройства пользователя: Desktop (компьютер), Mobile (мобильный), Tablet (планшет)',
  storageQuota: 'Доступная квота локального хранилища браузера в байтах — может указывать на режим инкогнито',
  fingerprint: 'Уникальный цифровой отпечаток браузера на основе множества параметров для идентификации устройства',
  isFirstVisit: 'Первый визит пользователя на сайт с данного устройства/браузера (true/false)',
  clickCallType: 'Тип действия при клике на телефон: tel (звонок), copy (копирование), none (без действия)',
  hadTouchBeforeScroll: 'Было ли сенсорное касание экрана перед началом прокрутки — индикатор мобильного устройства',
  motionDataRaw: 'Необработанные данные гироскопа и акселерометра устройства для анализа подлинности визита',
  isReference: 'Реферальный визит — пользователь пришел по ссылке с другого сайта (true) или напрямую/через поиск (false)',
  isChecked: '⚠️ ВАЖНО: Отметка системы антифрода о подозрительной активности. TRUE = подозрительный/ботовый трафик, FALSE = легитимный пользователь',
};

const DownloadFileLogsADS = ({ showDownloadFileLogsADS, setShowDownloadFileLogsADS }) => {
  // Устанавливаем сегодняшнюю дату по умолчанию
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [domain, setDomain] = useState('');
  const [limit, setLimit] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [streamingThreshold, setStreamingThreshold] = useState(10000);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fields, setFields] = useState(Object.fromEntries(Object.keys(fieldDescriptions).map((key) => [key, true])));
  const [domains, setDomains] = useState([]);
  const [subDomains, setSubDomains] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Функция для получения читаемой метки поля
  const getFieldLabel = (key) => {
    const labels = {
      id: 'ID',
      createdAt: 'Дата создания',
      gclid: 'GCLID',
      host: 'Хост',
      IP: 'IP',
      headers: 'Заголовки',
      jsData: 'JS данные',
      timeSpent: 'Время на сайте',
      clickCoordinates: 'Координаты кликов',
      scrollCoordinates: 'Координаты скролла',
      clickOnNumber: 'Клик по номеру',
      clickOnInvisibleNumber: 'Клик по скрытому номеру',
      accountID: 'ID аккаунта',
      companyID: 'ID компании',
      keyword: 'Ключевое слово',
      device: 'Устройство',
      isChecked: 'Подозрительный трафик',
      storageQuota: 'Квота хранилища',
      fingerprint: 'Отпечаток браузера',
      isFirstVisit: 'Первый визит',
      clickCallType: 'Тип звонка',
      hadTouchBeforeScroll: 'Касание до скролла',
      motionDataRaw: 'Данные движения',
      isReference: 'Реферальный визит',
    };
    return labels[key] || key;
  };

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

  const handleClose = () => {
    setShowDownloadFileLogsADS(false);
  };

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
      startDate: startOfDay(startDate).toISOString(),
      endDate: endOfDay(endDate).toISOString(),
      domain,
      limit,
      format: exportFormat,
      streamingThreshold,
      id: fields.id,
      createdAt: fields.createdAt,
      gclid: fields.gclid,
      host: fields.host,
      IP: fields.IP,
      headers: fields.headers,
      jsData: fields.jsData,
      timeSpent: fields.timeSpent,
      clickCoordinates: fields.clickCoordinates,
      scrollCoordinates: fields.scrollCoordinates,
      clickOnNumber: fields.clickOnNumber,
      clickOnInvisibleNumber: fields.clickOnInvisibleNumber,
      accountID: fields.accountID,
      companyID: fields.companyID,
      keyword: fields.keyword,
      device: fields.device,
      isChecked: fields.isChecked,
      storageQuota: fields.storageQuota,
      fingerprint: fields.fingerprint,
      isFirstVisit: fields.isFirstVisit,
      clickCallType: fields.clickCallType,
      hadTouchBeforeScroll: fields.hadTouchBeforeScroll,
      motionDataRaw: fields.motionDataRaw,
      isReference: fields.isReference,
    };

    const getFileExtension = () => {
      switch (exportFormat) {
        case 'xlsx': return 'xlsx';
        case 'json': return 'json';
        default: return 'csv';
      }
    };

    const getMimeType = () => {
      switch (exportFormat) {
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'json': return 'application/json';
        default: return 'text/csv';
      }
    };

    const fileName = () => {
      const now = new Date();
      return `${domain}-${now.toISOString().replace(/[:.]/g, '-')}.${getFileExtension()}`;
    };

    setLoading(true);
    
    axios
      .post(`${APIURL}/downloadfilelogsads`, data, { responseType: 'blob' })
      .then((response) => {
        const blob = new Blob([response.data], { type: getMimeType() });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName();
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setSnackbar({ open: true, message: `Файл успешно скачан в формате ${exportFormat.toUpperCase()}.`, severity: 'success' });
        handleClose();
      })
      .catch((error) => {
        console.error('Полная ошибка:', error);
        
        // Детальная информация об ошибке
        if (error.response) {
          console.error('Ответ сервера:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });
          
          // Попытка прочитать текст ошибки из blob
          if (error.response.data instanceof Blob) {
            error.response.data.text().then(text => {
              console.error('Текст ошибки от сервера:', text);
              setSnackbar({ 
                open: true, 
                message: `Ошибка от сервера: ${text || 'Неизвестная ошибка'}`, 
                severity: 'error' 
              });
            });
          } else {
            setSnackbar({ 
              open: true, 
              message: `Ошибка ${error.response.status}: ${error.response.statusText}`, 
              severity: 'error' 
            });
          }
        } else {
          setSnackbar({ open: true, message: 'Ошибка при скачивании файла.', severity: 'error' });
        }
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
              {/* Быстрый выбор периода */}
              <Grid item xs={12}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    Быстрый выбор:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setStartDate(new Date());
                      setEndDate(new Date());
                    }}
                  >
                    Сегодня
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() - 7);
                      setStartDate(date);
                      setEndDate(new Date());
                    }}
                  >
                    7 дней
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() - 30);
                      setStartDate(date);
                      setEndDate(new Date());
                    }}
                  >
                    30 дней
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - 3);
                      setStartDate(date);
                      setEndDate(new Date());
                    }}
                  >
                    3 месяца
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      const date = new Date();
                      date.setFullYear(date.getFullYear() - 1);
                      setStartDate(date);
                      setEndDate(new Date());
                    }}
                  >
                    Весь год
                  </Button>
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Grid>

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
                <Autocomplete
                  freeSolo
                  value={domain}
                  onChange={(event, newValue) => {
                    setDomain(newValue || '');
                  }}
                  onInputChange={(event, newInputValue) => {
                    setDomain(newInputValue);
                  }}
                  options={domainsSubDomains}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="🌐 Домен"
                      variant="outlined"
                      fullWidth
                      placeholder="Введите или выберите домен"
                    />
                  )}
                />
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

              {/* Формат экспорта */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>📁 Формат экспорта</InputLabel>
                  <Select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    label="📁 Формат экспорта"
                  >
                    <MenuItem value="csv">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label="CSV" size="small" color="primary" />
                        <Typography variant="body2">Таблица (рекомендуется)</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="xlsx">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label="Excel" size="small" color="success" />
                        <Typography variant="body2">Microsoft Excel</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="json">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label="JSON" size="small" color="warning" />
                        <Typography variant="body2">Для разработчиков</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Расширенные настройки */}
              <Grid item xs={12} sm={6}>
                <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SettingsIcon fontSize="small" />
                      <Typography>Расширенные настройки</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      label="⚡ Порог стриминга"
                      type="number"
                      value={streamingThreshold}
                      onChange={(e) => setStreamingThreshold(Number(e.target.value))}
                      fullWidth
                      InputProps={{ inputProps: { min: 1000, step: 1000 } }}
                      helperText="Количество записей для включения потоковой передачи (по умолчанию: 10000)"
                    />
                  </AccordionDetails>
                </Accordion>
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
                              {getFieldLabel(key)}
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
