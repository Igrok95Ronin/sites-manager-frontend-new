import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { 
  Button, 
  TextField, 
  Box, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { startOfDay, endOfDay } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import axiosInstance from '../../../../axiosInstance';
import './BotAnalysis.scss';

// Ленивая загрузка компонентов для оптимизации
const BotAnalysisList = lazy(() => import('./BotAnalysisList'));

const BotAnalysis = () => {
  const [domain, setDomain] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const [analysisType, setAnalysisType] = useState('heuristic'); // 'heuristic' или 'reference'
  
  // Состояния для доменов
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [availableDomains, setAvailableDomains] = useState([]);
  
  // Состояние для модального окна с детальными объяснениями
  const [explanationDialog, setExplanationDialog] = useState({
    open: false,
    indicator: null
  });
  
  // Состояние для диалога экспорта
  const [exportDialog, setExportDialog] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    includeBots: true,
    includeProbableBots: true,
    includeSuspicious: true,
    includeHumans: false,
    includeOriginalFields: true,
    includeBotAnalysis: true,
    includeIndicators: true,
    onlyTriggeredIndicators: true
  });
  const [exportLoading, setExportLoading] = useState(false);

  // Статистика
  const [stats, setStats] = useState({
    total: 0,
    bots: 0,
    probable: 0,
    suspicious: 0,
    humans: 0,
    noReference: 0
  });

  // Загрузка доменов при монтировании компонента
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoadingDomains(true);
        const [domainsResponse, subDomainsResponse] = await Promise.all([
          axiosInstance.get('/viewdomains'),
          axiosInstance.get('/viewsubdomains'),
        ]);
        
        // Объединяем домены и поддомены
        const allDomains = [
          ...(domainsResponse.data || []).map(d => d.domain),
          ...(subDomainsResponse.data || []).map(s => s.subDomain)
        ].filter(Boolean);
        
        setAvailableDomains(allDomains);
      } catch (error) {
        console.error('Ошибка загрузки доменов:', error);
        // Не показываем ошибку пользователю, так как это не критично
      } finally {
        setLoadingDomains(false);
      }
    };

    fetchDomains();
  }, []);

  // Функция для анализа
  const handleAnalysis = useCallback(async (isLoadMore = false, isReference = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = {
        startDate: startOfDay(startDate).toISOString(),
        endDate: endOfDay(endDate).toISOString(),
        limit,
        offset: isLoadMore ? offset : 0
      };
      
      // Добавляем домен только если он указан
      if (domain && domain.trim()) {
        params.domain = domain.trim();
      }

      // Выбираем endpoint в зависимости от типа анализа
      const endpoint = isReference ? '/bot-analysis-reference' : '/botanalysis';
      const response = await axiosInstance.post(endpoint, params);
      const { data } = response.data;

      if (!isLoadMore) {
        setAnalysisData(data);
        setOffset(data.length);
      } else {
        setAnalysisData(prev => [...prev, ...data]);
        setOffset(prev => prev + data.length);
      }

      setHasMore(data.length === limit);

      // Подсчет статистики
      const newStats = {
        total: isLoadMore ? stats.total + data.length : data.length,
        bots: 0,
        probable: 0,
        suspicious: 0,
        humans: 0,
        noReference: 0
      };

      const dataToProcess = isLoadMore ? [...analysisData, ...data] : data;
      dataToProcess.forEach(item => {
        switch(item.bot_status) {
          case 'BOT':
            newStats.bots++;
            break;
          case 'PROBABLE_BOT':
            newStats.probable++;
            break;
          case 'SUSPICIOUS':
            newStats.suspicious++;
            break;
          case 'HUMAN':
            newStats.humans++;
            break;
          case 'NO_REFERENCE':
            newStats.noReference++;
            break;
          default:
            // Неизвестный статус, считаем как человека
            newStats.humans++;
            break;
        }
      });

      setStats(newStats);
      
      // Сохраняем тип анализа
      if (!isLoadMore) {
        setAnalysisType(isReference ? 'reference' : 'heuristic');
      }

    } catch (err) {
      console.error('Ошибка анализа:', err);
      setError(err.response?.data?.message || 'Ошибка при выполнении анализа');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [domain, startDate, endDate, limit, offset, analysisData, stats]);

  // Функция для загрузки еще
  const loadMore = () => {
    handleAnalysis(true, analysisType === 'reference');
  };
  
  // Функции для управления модальным окном объяснений
  const handleOpenExplanation = (indicator) => {
    setExplanationDialog({
      open: true,
      indicator: indicator
    });
  };
  
  const handleCloseExplanation = () => {
    setExplanationDialog({
      open: false,
      indicator: null
    });
  };
  
  // Функции для экспорта
  const handleExportDialogOpen = () => {
    setExportDialog(true);
  };
  
  const handleExportDialogClose = () => {
    setExportDialog(false);
  };
  
  const handleExportSettingChange = (setting) => (event) => {
    setExportSettings({
      ...exportSettings,
      [setting]: event.target.checked
    });
  };
  
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Создаем params отдельно, чтобы правильно передать все параметры
      const params = {
        startDate: startOfDay(startDate).toISOString(),
        endDate: endOfDay(endDate).toISOString(),
        limit: analysisData.length || limit, // Используем количество загруженных данных или установленный лимит
        offset: 0, // Начинаем с 0, так как экспортируем все загруженные данные
        // Передаем параметры фильтрации по статусу
        includeBots: exportSettings.includeBots,
        includeProbableBots: exportSettings.includeProbableBots,
        includeSuspicious: exportSettings.includeSuspicious,
        includeHumans: exportSettings.includeHumans,
        // Передаем параметры выбора полей
        includeOriginalFields: exportSettings.includeOriginalFields,
        includeBotAnalysis: exportSettings.includeBotAnalysis,
        includeIndicators: exportSettings.includeIndicators,
        onlyTriggeredIndicators: exportSettings.onlyTriggeredIndicators
      };
      
      // Добавляем домен только если он указан
      if (domain && domain.trim()) {
        params.domain = domain.trim();
      }
      
      // Логируем параметры для отладки
      console.log('Export params:', params);
      
      // Выбираем endpoint для экспорта в зависимости от типа анализа
      const exportEndpoint = analysisType === 'reference' ? '/bot-analysis-reference/export' : '/bot-analysis/export';
      const response = await axiosInstance.post(exportEndpoint, params, {
        responseType: 'blob'
      });
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Получаем имя файла из заголовков ответа или используем дефолтное
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'bot_analysis_export.csv';
      if (contentDisposition) {
        // Улучшенная регулярка для извлечения имени файла
        // Поддерживает форматы: filename="file.csv", filename=file.csv, filename*=UTF-8''file.csv
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          // Декодируем UTF-8 если нужно
          if (filename.includes("UTF-8''")) {
            filename = decodeURIComponent(filename.split("UTF-8''")[1]);
          }
        }
      }
      
      // Если имя файла не получено, создаем свое с датой и количеством записей
      if (filename === 'bot_analysis_export.csv') {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const recordCount = analysisData.length || 0;
        filename = `bot_analysis_${dateStr}_${timeStr}_${recordCount}_records.csv`;
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Очищаем URL объект
      window.URL.revokeObjectURL(url);
      
      handleExportDialogClose();
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      // Проверяем, если это 404 - значит нет данных после фильтрации
      if (error.response && error.response.status === 404) {
        // Проверяем текст ошибки от сервера
        const errorText = await new Response(error.response.data).text();
        if (errorText.includes('Нет данных после фильтрации')) {
          setError('Нет данных для экспорта с выбранными фильтрами. Попробуйте изменить параметры фильтрации.');
        } else {
          setError('Endpoint для экспорта не найден');
        }
      } else {
        setError('Ошибка при экспорте данных');
      }
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Box className="bot-analysis">
      {/* Панель управления */}
      <Paper className="bot-analysis__controls" elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          Анализ ботов
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Домен</InputLabel>
              <Select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                label="Домен"
                disabled={loadingDomains}
                endAdornment={loadingDomains ? <CircularProgress size={20} /> : null}
              >
                <MenuItem value="">
                  <em>Все домены</em>
                </MenuItem>
                {loadingDomains ? (
                  <MenuItem disabled>
                    <em>Загрузка доменов...</em>
                  </MenuItem>
                ) : availableDomains.length > 0 ? (
                  availableDomains.map((dom, index) => (
                    <MenuItem key={index} value={dom}>
                      {dom}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <em>Нет доступных доменов</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Начальная дата"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Конечная дата"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Лимит записей"
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              inputProps={{ min: 1, max: 1000 }}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => handleAnalysis(false, false)}
                disabled={loading}
                sx={{ height: '56px', flex: 1 }}
                startIcon={loading && analysisType === 'heuristic' ? <CircularProgress size={20} /> : <RefreshIcon />}
              >
                {loading && analysisType === 'heuristic' ? 'Анализ...' : 'Анализ'}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => handleAnalysis(false, true)}
                disabled={loading}
                sx={{ height: '56px', flex: 1 }}
                startIcon={loading && analysisType === 'reference' ? <CircularProgress size={20} /> : <SmartToyIcon />}
              >
                {loading && analysisType === 'reference' ? 'Анализ...' : 'Анализ Эталон'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Кнопка экспорта */}
        {analysisData.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleExportDialogOpen}
              startIcon={<DownloadIcon />}
            >
              Экспорт в CSV
            </Button>
          </Box>
        )}
      </Paper>

      {/* Статистика */}
      {stats.total > 0 && (
        <Paper className="bot-analysis__stats" elevation={2} sx={{ p: 2, mb: 3 }}>
          {/* Индикатор типа анализа */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              Результаты анализа:
            </Typography>
            <Chip 
              label={analysisType === 'reference' ? 'Эталонный анализ' : 'Эвристический анализ'}
              color={analysisType === 'reference' ? 'secondary' : 'primary'}
              icon={analysisType === 'reference' ? <SmartToyIcon /> : <RefreshIcon />}
            />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Всего записей</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Card sx={{ backgroundColor: '#ffebee' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error">{stats.bots}</Typography>
                  <Typography variant="body2" color="error">Боты</Typography>
                  <Typography variant="caption">
                    {stats.total > 0 ? `${((stats.bots / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Card sx={{ backgroundColor: '#fff3e0' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">{stats.probable}</Typography>
                  <Typography variant="body2" color="warning.main">Вероятные боты</Typography>
                  <Typography variant="caption">
                    {stats.total > 0 ? `${((stats.probable / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Card sx={{ backgroundColor: '#e3f2fd' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">{stats.suspicious}</Typography>
                  <Typography variant="body2" color="info.main">Подозрительные</Typography>
                  <Typography variant="caption">
                    {stats.total > 0 ? `${((stats.suspicious / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Card sx={{ backgroundColor: '#e8f5e9' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">{stats.humans}</Typography>
                  <Typography variant="body2" color="success.main">Люди</Typography>
                  <Typography variant="caption">
                    {stats.total > 0 ? `${((stats.humans / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Показываем NO_REFERENCE только для эталонного анализа */}
            {analysisType === 'reference' && stats.noReference > 0 && (
              <Grid item xs={6} md={2.4}>
                <Card sx={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="text.secondary">{stats.noReference}</Typography>
                    <Typography variant="body2" color="text.secondary">Без эталона</Typography>
                    <Typography variant="caption">
                      {stats.total > 0 ? `${((stats.noReference / stats.total) * 100).toFixed(1)}%` : '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Результаты анализа */}
      {analysisData.length > 0 && (
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        }>
          <BotAnalysisList
            data={analysisData}
            onOpenExplanation={handleOpenExplanation}
          />
        </Suspense>
      )}

      {/* Кнопка загрузить еще */}
      {hasMore && analysisData.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Загрузка...' : 'Загрузить еще'}
          </Button>
        </Box>
      )}

      {/* Пустое состояние */}
      {!loading && analysisData.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SmartToyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Нет данных для отображения
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Выберите параметры и нажмите "Анализ" для начала проверки
          </Typography>
        </Paper>
      )}
      
      {/* Модальное окно для детальных объяснений */}
      <Dialog
        open={explanationDialog.open}
        onClose={handleCloseExplanation}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh'
          }
        }}
      >
        {explanationDialog.indicator && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: 
                explanationDialog.indicator.category === 'CRITICAL' ? '#ffebee' :
                explanationDialog.indicator.category === 'HIGH' ? '#fff3e0' :
                explanationDialog.indicator.category === 'MEDIUM' ? '#e3f2fd' : '#e8f5e9'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlinedIcon color={
                  explanationDialog.indicator.category === 'CRITICAL' ? 'error' :
                  explanationDialog.indicator.category === 'HIGH' ? 'warning' :
                  explanationDialog.indicator.category === 'MEDIUM' ? 'info' : 'success'
                } />
                <Typography variant="h6">
                  {explanationDialog.indicator.name}
                </Typography>
                <Chip 
                  label={explanationDialog.indicator.category}
                  size="small"
                  color={
                    explanationDialog.indicator.category === 'CRITICAL' ? 'error' :
                    explanationDialog.indicator.category === 'HIGH' ? 'warning' :
                    explanationDialog.indicator.category === 'MEDIUM' ? 'info' : 'success'
                  }
                />
              </Box>
              <IconButton onClick={handleCloseExplanation}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Alert 
                  severity={
                    explanationDialog.indicator.category === 'CRITICAL' ? 'error' :
                    explanationDialog.indicator.category === 'HIGH' ? 'warning' :
                    explanationDialog.indicator.category === 'MEDIUM' ? 'info' : 'success'
                  }
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    <strong>Результат проверки:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {explanationDialog.indicator.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Баллы:</strong> +{explanationDialog.indicator.score}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Обнаружено:</strong> {explanationDialog.indicator.value}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ожидалось:</strong> {explanationDialog.indicator.expected}
                  </Typography>
                </Alert>
                
                {explanationDialog.indicator.detailed_explanation && (
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    backgroundColor: '#f5f5f5',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto',
                    maxHeight: '60vh'
                  }}>
                    {explanationDialog.indicator.detailed_explanation}
                  </Paper>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseExplanation} variant="contained">
                Закрыть
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Диалог настроек экспорта */}
      <Dialog
        open={exportDialog}
        onClose={handleExportDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon color="primary" />
            <Typography variant="h6">Настройки экспорта в CSV</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Фильтр по статусу бота:
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportSettings.includeBots}
                    onChange={handleExportSettingChange('includeBots')}
                    color="error"
                  />
                }
                label="Включить ботов (BOT)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportSettings.includeProbableBots}
                    onChange={handleExportSettingChange('includeProbableBots')}
                    color="warning"
                  />
                }
                label="Включить вероятных ботов (PROBABLE_BOT)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportSettings.includeSuspicious}
                    onChange={handleExportSettingChange('includeSuspicious')}
                    color="info"
                  />
                }
                label="Включить подозрительных (SUSPICIOUS)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportSettings.includeHumans}
                    onChange={handleExportSettingChange('includeHumans')}
                    color="success"
                  />
                }
                label="Включить людей (HUMAN)"
              />
            </FormGroup>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Поля для экспорта:
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportSettings.includeOriginalFields}
                    onChange={handleExportSettingChange('includeOriginalFields')}
                  />
                }
                label="Оригинальные поля (IP, Домен, Время и т.д.)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportSettings.includeBotAnalysis}
                    onChange={handleExportSettingChange('includeBotAnalysis')}
                  />
                }
                label="Результаты анализа ботов"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportSettings.includeIndicators}
                    onChange={handleExportSettingChange('includeIndicators')}
                  />
                }
                label="Индикаторы ботов"
              />
              {exportSettings.includeIndicators && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportSettings.onlyTriggeredIndicators}
                      onChange={handleExportSettingChange('onlyTriggeredIndicators')}
                    />
                  }
                  label="Только сработавшие индикаторы"
                  sx={{ ml: 3 }}
                />
              )}
            </FormGroup>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Будет экспортировано записей: {analysisData.length || 'не загружено'}
            </Typography>
            <Typography variant="body2">
              Период: {startDate.toLocaleDateString('ru-RU')} - {endDate.toLocaleDateString('ru-RU')}
              {domain && (
                <>
                  <br />
                  Домен: {domain}
                </>
              )}
            </Typography>
            {/* Показываем предупреждение о возможной фильтрации */}
            {analysisData.length > 0 && (
              <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                Примечание: Будут экспортированы только записи, соответствующие выбранным фильтрам статуса.
                Если после фильтрации не останется записей, экспорт не будет выполнен.
              </Typography>
            )}
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleExportDialogClose} disabled={exportLoading}>
            Отмена
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            color="primary"
            disabled={exportLoading || (!exportSettings.includeBots && !exportSettings.includeProbableBots && 
                      !exportSettings.includeSuspicious && !exportSettings.includeHumans)}
            startIcon={exportLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {exportLoading ? 'Экспорт...' : 'Экспортировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BotAnalysis;