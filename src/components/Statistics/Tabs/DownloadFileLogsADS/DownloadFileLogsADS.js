import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
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
  Paper,
  Tooltip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
  Fade,
  LinearProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DomainIcon from '@mui/icons-material/Domain';
import NumbersIcon from '@mui/icons-material/Numbers';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import StorageIcon from '@mui/icons-material/Storage';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import axios from 'axios';
import { startOfDay, endOfDay } from 'date-fns';
import axiosInstance from '../../../../axiosInstance';

const APIURL = process.env.REACT_APP_APIURL;

// Описание каждого чекбокса
const fieldDescriptions = {
  id: 'Уникальный идентификатор записи в базе данных',
  createdAt: 'Дата и время посещения сайта',
  gclid: 'Google Click ID для отслеживания рекламы',
  host: 'Доменное имя посещенного сайта',
  IP: 'IP-адрес посетителя',
  headers: 'HTTP-заголовки браузера',
  jsData: 'JavaScript данные о браузере и устройстве',
  timeSpent: 'Время проведенное на сайте (сек)',
  clickCoordinates: 'Координаты кликов на странице',
  scrollCoordinates: 'Данные о прокрутке страницы',
  clickOnNumber: 'Клик на видимый номер телефона',
  clickOnInvisibleNumber: 'Клик на скрытый номер телефона',
  accountID: 'ID рекламного аккаунта Google Ads',
  companyID: 'ID рекламной кампании',
  keyword: 'Ключевое слово для перехода',
  device: 'Тип устройства (Desktop/Mobile/Tablet)',
  storageQuota: 'Квота локального хранилища',
  fingerprint: 'Цифровой отпечаток браузера',
  isFirstVisit: 'Первое посещение сайта',
  clickCallType: 'Тип действия при клике на телефон',
  hadTouchBeforeScroll: 'Касание экрана перед прокруткой',
  motionDataRaw: 'Данные гироскопа и акселерометра',
  isReference: 'Реферальный переход',
  isChecked: '⚠️ Подозрительная активность (антифрод)',
};

const DownloadFileLogsADS = ({ showDownloadFileLogsADS, setShowDownloadFileLogsADS }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [domain, setDomain] = useState('');
  const [limit, setLimit] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const streamingThreshold = 10000;
  const [fields, setFields] = useState(Object.fromEntries(Object.keys(fieldDescriptions).map((key) => [key, true])));
  const [domains, setDomains] = useState([]);
  const [subDomains, setSubDomains] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(0); // Для отслеживания выбранного периода

  // Функция для получения читаемой метки поля
  const getFieldLabel = (key) => {
    const labels = {
      id: 'ID',
      createdAt: 'Дата создания',
      gclid: 'GCLID',
      host: 'Хост',
      IP: 'IP адрес',
      headers: 'Заголовки',
      jsData: 'JS данные',
      timeSpent: 'Время на сайте',
      clickCoordinates: 'Клики',
      scrollCoordinates: 'Скролл',
      clickOnNumber: 'Клик по номеру',
      clickOnInvisibleNumber: 'Скрытый номер',
      accountID: 'ID аккаунта',
      companyID: 'ID кампании',
      keyword: 'Ключевое слово',
      device: 'Устройство',
      storageQuota: 'Хранилище',
      fingerprint: 'Отпечаток',
      isFirstVisit: 'Первый визит',
      clickCallType: 'Тип звонка',
      hadTouchBeforeScroll: 'Тач-скролл',
      motionDataRaw: 'Движение',
      isReference: 'Реферал',
      isChecked: 'Антифрод',
    };
    return labels[key] || key;
  };

  // Получение доменов
  const fetchDomains = async () => {
    try {
      setLoading(true);
      const [domainsRes, subDomainsRes] = await Promise.all([
        axiosInstance.get('/viewdomains'),
        axiosInstance.get('/viewsubdomains')
      ]);
      setDomains(domainsRes.data);
      setSubDomains(subDomainsRes.data);
    } catch (error) {
      console.error('Ошибка получения доменов:', error);
      // Если не удалось загрузить домены, всё равно разрешим ввод
      setSnackbar({ 
        open: true, 
        message: 'Не удалось загрузить список доменов, введите вручную', 
        severity: 'info' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDownloadFileLogsADS) {
      fetchDomains();
    }
  }, [showDownloadFileLogsADS]);

  const domainsSubDomains = [...domains.map((d) => d.domain), ...subDomains.map((s) => s.subDomain)];

  const handleClose = () => {
    setShowDownloadFileLogsADS(false);
  };

  const handleCheckboxChange = (event) => {
    setFields({ ...fields, [event.target.name]: event.target.checked });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownload = () => {
    // Предупреждение при скачивании без домена
    if (!domain && !limit) {
      const confirmed = window.confirm(
        '⚠️ ВНИМАНИЕ!\n\n' +
        'Вы собираетесь скачать ВСЕ данные за выбранный период без ограничений.\n\n' +
        'Это может привести к:\n' +
        '• Очень большому размеру файла (сотни MB или GB)\n' +
        '• Длительному времени загрузки (несколько минут)\n' +
        '• Высокой нагрузке на сервер\n\n' +
        'Рекомендуется установить лимит записей или выбрать конкретный домен.\n\n' +
        'Продолжить загрузку?'
      );
      
      if (!confirmed) {
        return;
      }
    }

    // Создаём объект с полями в правильном порядке
    const orderedFields = {};
    const fieldOrder = [
      'id', 'createdAt', 'gclid', 'host', 'IP', 'headers', 'jsData',
      'timeSpent', 'clickCoordinates', 'scrollCoordinates', 'clickOnNumber',
      'clickOnInvisibleNumber', 'accountID', 'companyID', 'keyword', 'device',
      'storageQuota', 'fingerprint', 'isFirstVisit', 'clickCallType',
      'hadTouchBeforeScroll', 'motionDataRaw', 'isReference', 'isChecked'
    ];
    
    fieldOrder.forEach(key => {
      if (fields[key] !== undefined) {
        orderedFields[key] = fields[key];
      }
    });

    const data = {
      startDate: startOfDay(startDate).toISOString(),
      endDate: endOfDay(endDate).toISOString(),
      domain: domain || '', // Если домен пустой, отправляем пустую строку
      limit,
      format: exportFormat,
      streamingThreshold,
      ...orderedFields
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
      const domainPart = domain || 'all-domains';
      return `${domainPart}-${now.toISOString().replace(/[:.]/g, '-')}.${getFileExtension()}`;
    };

    setLoading(true);
    setDownloadProgress(0);
    setDownloadStatus('Подготовка к загрузке...');
    
    // Определяем, используется ли потоковая загрузка
    const isStreaming = !limit || parseInt(limit) > streamingThreshold;
    
    axios
      .post(`${APIURL}/downloadfilelogsads`, data, { 
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownloadProgress(percentCompleted);
            
            // Обновляем статус в зависимости от прогресса
            if (percentCompleted < 30) {
              setDownloadStatus('Получение данных с сервера...');
            } else if (percentCompleted < 60) {
              setDownloadStatus('Обработка записей...');
            } else if (percentCompleted < 90) {
              setDownloadStatus('Формирование файла...');
            } else {
              setDownloadStatus('Завершение загрузки...');
            }
          } else if (isStreaming) {
            // Для потоковой загрузки без известного размера
            setDownloadStatus(`Загружено: ${(progressEvent.loaded / 1024 / 1024).toFixed(2)} MB`);
          }
        }
      })
      .then((response) => {
        // Проверяем заголовки ответа для получения информации о методе экспорта
        const totalRecords = response.headers['x-total-records'];
        const exportMethod = response.headers['x-export-method'];
        
        if (totalRecords) {
          console.log(`Экспортировано записей: ${totalRecords}`);
        }
        if (exportMethod === 'streaming') {
          console.log('Использован потоковый метод экспорта');
        }
        
        const blob = new Blob([response.data], { type: getMimeType() });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName();
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Очищаем память
        window.URL.revokeObjectURL(url);
        
        setLoading(false);
        setDownloadProgress(100);
        setDownloadStatus('');
        
        const successMessage = totalRecords 
          ? `✅ Файл успешно скачан! (${totalRecords} записей)`
          : '✅ Файл успешно скачан!';
        
        setSnackbar({ open: true, message: successMessage, severity: 'success' });
        
        // Закрываем диалог с небольшой задержкой
        setTimeout(() => {
          handleClose();
          setDownloadProgress(0);
        }, 1000);
      })
      .catch((error) => {
        setLoading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
        
        let errorMessage = '❌ Ошибка при скачивании файла';
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = '❌ Нет данных для экспорта за указанный период';
          } else if (error.response.status === 400) {
            errorMessage = '❌ Некорректные параметры запроса';
          } else if (error.response.status === 500) {
            errorMessage = '❌ Ошибка сервера. Попробуйте позже';
          }
        } else if (error.request) {
          errorMessage = '❌ Нет ответа от сервера. Проверьте соединение';
        }
        
        console.error('Ошибка при скачивании:', error);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      });
  };

  // Подсчет выбранных полей
  const selectedFieldsCount = Object.values(fields).filter(v => v).length;
  const totalFieldsCount = Object.keys(fields).length;

  return (
    <Box>
      <Dialog 
        open={showDownloadFileLogsADS} 
        onClose={handleClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        {/* Заголовок с градиентом */}
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2.5
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <CloudDownloadIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Экспорт данных ADS
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Настройте параметры экспорта логов
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleClose} 
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }}}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Прогресс бар при загрузке */}
        {loading && (
          <Box sx={{ position: 'relative' }}>
            <LinearProgress 
              variant={downloadProgress > 0 ? "determinate" : "indeterminate"} 
              value={downloadProgress}
              sx={{ height: 6 }}
            />
            {downloadStatus && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '2px 8px',
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'primary.main'
              }}>
                {downloadStatus}
              </Box>
            )}
          </Box>
        )}

        <DialogContent sx={{ backgroundColor: '#f8f9fa', p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Секция 1: Период времени */}
            <Fade in={true} timeout={500}>
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <DateRangeIcon color="primary" />
                    <Typography variant="h6" fontWeight={500}>
                      Период данных
                    </Typography>
                  </Box>
                  
                  {/* Быстрый выбор периода */}
                  <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f4ff', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                      Быстрый выбор периода:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {[
                        { label: 'Сегодня', icon: <TodayIcon fontSize="small" />, days: 0 },
                        { label: 'Неделя', days: 7 },
                        { label: 'Месяц', days: 30 },
                        { label: '3 месяца', days: 90 },
                        { label: 'Год', days: 365 },
                      ].map((period) => (
                        <Chip
                          key={period.label}
                          label={period.label}
                          icon={period.icon}
                          onClick={() => {
                            setSelectedPeriod(period.days);
                            if (period.days === 0) {
                              setStartDate(new Date());
                              setEndDate(new Date());
                            } else {
                              const date = new Date();
                              date.setDate(date.getDate() - period.days);
                              setStartDate(date);
                              setEndDate(new Date());
                            }
                          }}
                          variant={selectedPeriod === period.days ? "filled" : "outlined"}
                          color={selectedPeriod === period.days ? "primary" : "default"}
                          sx={{ 
                            backgroundColor: selectedPeriod === period.days ? 'primary.main' : 'transparent',
                            color: selectedPeriod === period.days ? 'white' : 'text.primary',
                            borderColor: selectedPeriod === period.days ? 'primary.main' : 'divider',
                            '&:hover': { 
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              backgroundColor: selectedPeriod === period.days ? 'primary.dark' : 'action.hover'
                            },
                            transition: 'all 0.2s'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
                        <DatePicker
                          label="Начальная дата"
                          value={startDate}
                          onChange={(newDate) => {
                            setStartDate(newDate);
                            setSelectedPeriod(-1); // Сбрасываем выбор периода при ручном изменении
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              fullWidth 
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
                        <DatePicker
                          label="Конечная дата"
                          value={endDate}
                          onChange={(newDate) => {
                            setEndDate(newDate);
                            setSelectedPeriod(-1); // Сбрасываем выбор периода при ручном изменении
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              fullWidth
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>

            {/* Секция 2: Основные параметры */}
            <Fade in={true} timeout={700}>
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SettingsIcon color="primary" />
                    <Typography variant="h6" fontWeight={500}>
                      Основные параметры
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        freeSolo
                        value={domain}
                        onChange={(event, newValue) => setDomain(newValue || '')}
                        onInputChange={(event, newInputValue) => {
                          setDomain(newInputValue);
                        }}
                        options={domainsSubDomains}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Домен (необязательно)"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <DomainIcon fontSize="small" sx={{ mr: 1, color: domain ? 'primary.main' : 'text.secondary' }} />
                                  {params.InputProps.startAdornment}
                                </>
                              )
                            }}
                            helperText={domain ? '✓ Домен выбран' : 'Оставьте пустым для экспорта всех доменов'}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: domain ? 'success.main' : 'primary.main',
                                    borderWidth: 2
                                  }
                                }
                              }
                            }}
                          />
                        )}
                        sx={{
                          '& .MuiAutocomplete-popupIndicator': {
                            color: domain ? 'success.main' : 'action.active'
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Лимит записей"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        fullWidth
                        InputProps={{
                          inputProps: { min: 1 },
                          startAdornment: <NumbersIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        helperText={
                          (!limit || parseInt(limit) > streamingThreshold) 
                            ? 'Оставьте пустым для всех записей. ℹ️ Будет использована потоковая загрузка'
                            : 'Оставьте пустым для всех записей'
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Формат экспорта</InputLabel>
                        <Select
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value)}
                          label="Формат экспорта"
                          startAdornment={<InsertDriveFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                        >
                          <MenuItem value="csv">
                            <Box display="flex" alignItems="center" gap={1}>
                              <TableChartIcon fontSize="small" color="primary" />
                              <Box>
                                <Typography variant="body2">CSV</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Универсальный формат
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="xlsx">
                            <Box display="flex" alignItems="center" gap={1}>
                              <InsertDriveFileIcon fontSize="small" color="success" />
                              <Box>
                                <Typography variant="body2">Excel</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Microsoft Excel
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="json">
                            <Box display="flex" alignItems="center" gap={1}>
                              <DataObjectIcon fontSize="small" color="warning" />
                              <Box>
                                <Typography variant="body2">JSON</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Для разработчиков
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  {/* Предупреждение о больших объёмах */}
                  {!domain && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#fff3cd', 
                      borderRadius: 1,
                      border: '2px solid',
                      borderColor: '#ffc107'
                    }}>
                      <Typography variant="body2" sx={{ color: '#856404', fontWeight: 600, mb: 0.5 }}>
                        ⚠️ Внимание: экспорт без указания домена
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#856404', display: 'block' }}>
                        Будут загружены данные по ВСЕМ доменам за период. 
                        Это может занять длительное время и создать большой файл.
                        {!limit && ' Рекомендуется установить лимит записей.'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>

            {/* Секция 3: Выбор полей */}
            <Fade in={true} timeout={900}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckBoxIcon color="primary" />
                      <Typography variant="h6" fontWeight={500}>
                        Поля для экспорта
                      </Typography>
                      <Chip 
                        label={`${selectedFieldsCount} / ${totalFieldsCount}`}
                        size="small"
                        color={selectedFieldsCount === totalFieldsCount ? "success" : "default"}
                      />
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        startIcon={<CheckBoxIcon />}
                        onClick={() => setFields(Object.fromEntries(Object.keys(fields).map(key => [key, true])))}
                      >
                        Выбрать все
                      </Button>
                      <Button
                        size="small"
                        startIcon={<CheckBoxOutlineBlankIcon />}
                        onClick={() => setFields(Object.fromEntries(Object.keys(fields).map(key => [key, false])))}
                      >
                        Снять все
                      </Button>
                    </Box>
                  </Box>

                  <Grid container spacing={1.5}>
                    {Object.entries(fields).map(([key, value]) => (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <Tooltip title={fieldDescriptions[key]} placement="top" arrow>
                          <Paper
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              backgroundColor: value ? '#e3f2fd' : 'transparent',
                              border: '1px solid',
                              borderColor: value ? '#1976d2' : '#e0e0e0',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                            onClick={() => handleCheckboxChange({ target: { name: key, checked: !value }})}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Checkbox
                                checked={value}
                                onChange={handleCheckboxChange}
                                name={key}
                                size="small"
                                sx={{ p: 0 }}
                              />
                              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                {getFieldLabel(key)}
                              </Typography>
                              {key === 'isChecked' && (
                                <Chip label="Важно" size="small" color="error" sx={{ height: 20 }} />
                              )}
                            </Box>
                          </Paper>
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </DialogContent>

        {/* Кнопки действий */}
        <DialogActions sx={{ 
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
          borderTop: '2px solid #e3e4e6',
          px: 4,
          py: 2.5,
          gap: 2
        }}>
          <Button
            variant="text"
            color="inherit"
            href="https://drive.google.com/drive/u/0/home"
            target="_blank"
            startIcon={<StorageIcon />}
            sx={{ 
              mr: 'auto',
              color: '#666',
              '&:hover': { 
                backgroundColor: 'rgba(0,0,0,0.04)',
                color: '#333'
              }
            }}
          >
            Google Drive
          </Button>
          
          <Button 
            onClick={handleClose} 
            variant="outlined"
            color="inherit"
            size="large"
            disabled={loading}
            sx={{ 
              borderColor: '#ddd',
              color: '#666',
              px: 3,
              '&:hover': { 
                borderColor: '#999',
                backgroundColor: 'rgba(0,0,0,0.02)'
              }
            }}
          >
            Отмена
          </Button>
          
          <Button
            variant="contained"
            onClick={handleDownload}
            disabled={loading}
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
            sx={{
              background: loading 
                ? 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              px: 4,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b4299 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)',
                color: 'rgba(255,255,255,0.7)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Загрузка...' : 'Скачать данные'}
          </Button>
        </DialogActions>
      </Dialog>

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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DownloadFileLogsADS;