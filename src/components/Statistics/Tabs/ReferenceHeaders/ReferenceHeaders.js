import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormControlLabel,
  Checkbox,
  FormHelperText
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  BookmarkBorder as BookmarkIcon,
  Language as LanguageIcon,
  DevicesOther as DeviceIcon,
  LocationOn as LocationIcon,
  Timer as TimerIcon,
  TouchApp as TouchIcon,
  Code as CodeIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  Tablet as TabletIcon,
  Warning as WarningIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import axiosInstance from '../../../../axiosInstance';
import { JSONTree } from 'react-json-tree';
import './ReferenceHeaders.scss';

const ReferenceHeaders = () => {
  const [referenceData, setReferenceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all'); // Поле для поиска
  const [expandedItems, setExpandedItems] = useState({});
  const [editingItem, setEditingItem] = useState(null); // ID редактируемой записи
  const [editedValues, setEditedValues] = useState({}); // Редактируемые значения
  const [successMessage, setSuccessMessage] = useState(null); // Сообщение об успехе
  
  // Состояние для модального окна Headers/JS
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    item: null
  });

  // Загрузка данных
  const fetchReferenceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/reference/list');
      setReferenceData(response.data.data || []);
    } catch (err) {
      console.error('Ошибка загрузки эталонных записей:', err);
      setError('Не удалось загрузить эталонные записи');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Удаление записи из эталонных (функция закомментирована, так как удаление происходит в основной таблице)
  // const handleRemoveReference = async (id) => {
  //   try {
  //     await axiosInstance.post('/reference/update', {
  //       id: parseInt(id, 10),
  //       isReference: false
  //     });
  //     // Удаляем из локального состояния
  //     setReferenceData(prev => prev.filter(item => item.OriginalClickID !== id));
  //   } catch (err) {
  //     console.error('Ошибка удаления из эталонных:', err);
  //     setError('Не удалось удалить запись');
  //   }
  // };

  // Обработчик разворачивания/сворачивания
  const handleExpandChange = (id) => (event, isExpanded) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: isExpanded
    }));
  };

  // Парсинг JSON строк
  const parseJSON = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
  };

  // Обработчики для модального окна
  const handleOpenDetails = (item) => {
    setDetailsDialog({
      open: true,
      item: item
    });
  };

  const handleCloseDetails = () => {
    setDetailsDialog({
      open: false,
      item: null
    });
  };

  // Обработчики редактирования
  const handleStartEdit = (itemId) => {
    const item = referenceData.find(ref => ref.OriginalClickID === itemId);
    if (item) {
      setEditingItem(itemId);
      setEditedValues({
        DeviceName: item.DeviceName || '',
        DeviceModel: item.DeviceModel || '',
        OS: item.OS || '',
        OSVersion: item.OSVersion || '',
        Browser: item.Browser || '',
        BrowserVersion: item.BrowserVersion || '',
        DeviceCategory: item.DeviceCategory || '',
        ScreenResolution: item.ScreenResolution || '',
        IsEmulator: item.IsEmulator || false,
        Notes: item.Notes || '',
        IsReference: true // По умолчанию true, так как запись уже в эталонах
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditedValues({});
  };

  const handleSaveEdit = async () => {
    try {
      // Проверяем, снята ли галочка "Эталонная запись"
      if (!editedValues.IsReference) {
        // Если галочка снята, удаляем из эталонных
        await axiosInstance.post('/reference/update', {
          id: parseInt(editingItem, 10),
          isReference: false
        });
        
        // Удаляем из локального состояния
        setReferenceData(prev => prev.filter(item => item.OriginalClickID !== editingItem));
        
        // Закрываем режим редактирования
        setEditingItem(null);
        setEditedValues({});
        
        // Показываем сообщение об успехе
        setSuccessMessage('Запись удалена из эталонных');
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }
      
      // Если галочка осталась, сохраняем изменения полей
      const updateData = {
        originalClickId: parseInt(editingItem, 10),
        deviceName: editedValues.DeviceName || undefined,
        deviceModel: editedValues.DeviceModel || undefined,
        os: editedValues.OS || undefined,
        osVersion: editedValues.OSVersion || undefined,
        browser: editedValues.Browser || undefined,
        browserVersion: editedValues.BrowserVersion || undefined,
        deviceCategory: editedValues.DeviceCategory || undefined,
        screenResolution: editedValues.ScreenResolution || undefined,
        isEmulator: editedValues.IsEmulator,
        notes: editedValues.Notes || undefined
      };
      
      // Удаляем undefined значения
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      const response = await axiosInstance.patch('/reference/details', updateData);
      
      if (response.data.success) {
        // Обновляем локальное состояние
        setReferenceData(prev => prev.map(item => {
          if (item.OriginalClickID === editingItem) {
            return {
              ...item,
              DeviceName: editedValues.DeviceName || item.DeviceName,
              DeviceModel: editedValues.DeviceModel || item.DeviceModel,
              OS: editedValues.OS || item.OS,
              OSVersion: editedValues.OSVersion || item.OSVersion,
              Browser: editedValues.Browser || item.Browser,
              BrowserVersion: editedValues.BrowserVersion || item.BrowserVersion,
              DeviceCategory: editedValues.DeviceCategory || item.DeviceCategory,
              ScreenResolution: editedValues.ScreenResolution || item.ScreenResolution,
              IsEmulator: editedValues.IsEmulator !== undefined ? editedValues.IsEmulator : item.IsEmulator,
              Notes: editedValues.Notes || item.Notes
            };
          }
          return item;
        }));
        
        // Закрываем режим редактирования
        setEditingItem(null);
        setEditedValues({});
        
        // Показываем сообщение об успехе
        setSuccessMessage('Изменения успешно сохранены');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Ошибка сохранения изменений:', err);
      setError('Не удалось сохранить изменения: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditValueChange = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Улучшенная фильтрация данных
  const filteredData = referenceData.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Поиск по конкретному полю
    if (searchField === 'domain') {
      return item.Domain?.toLowerCase().includes(searchLower);
    } else if (searchField === 'ip') {
      return item.IP?.toLowerCase().includes(searchLower);
    } else if (searchField === 'keyword') {
      return item.Keyword?.toLowerCase().includes(searchLower);
    } else if (searchField === 'device') {
      return (
        item.DeviceName?.toLowerCase().includes(searchLower) ||
        item.DeviceModel?.toLowerCase().includes(searchLower) ||
        item.DeviceCategory?.toLowerCase().includes(searchLower)
      );
    } else {
      // Поиск по всем полям
      return (
        item.Domain?.toLowerCase().includes(searchLower) ||
        item.IP?.toLowerCase().includes(searchLower) ||
        item.Gclid?.toLowerCase().includes(searchLower) ||
        item.Keyword?.toLowerCase().includes(searchLower) ||
        item.DeviceName?.toLowerCase().includes(searchLower) ||
        item.DeviceModel?.toLowerCase().includes(searchLower) ||
        item.Browser?.toLowerCase().includes(searchLower) ||
        item.OS?.toLowerCase().includes(searchLower) ||
        item.Notes?.toLowerCase().includes(searchLower)
      );
    }
  });

  // Форматирование устройства
  const getDeviceInfo = (item) => {
    if (item.DeviceName) {
      return item.DeviceName;
    }
    const device = item.Device === 'm' ? 'Mobile' : item.Device === 'c' ? 'Desktop' : 'Unknown';
    const jsData = parseJSON(item.JsData);
    const platform = jsData?.platform || 'Unknown';
    return `${device} (${platform})`;
  };

  // Получение иконки устройства
  const getDeviceIcon = (item) => {
    const category = item.DeviceCategory || item.Device;
    if (category === 'mobile' || category === 'm') {
      return <SmartphoneIcon />;
    } else if (category === 'tablet') {
      return <TabletIcon />;
    } else if (category === 'desktop' || category === 'c') {
      return <ComputerIcon />;
    }
    return <DeviceIcon />;
  };

  // Получение основных headers
  const getMainHeaders = (headers) => {
    const parsed = parseJSON(headers);
    if (typeof parsed === 'object') {
      return {
        'User-Agent': parsed['User-Agent'] || 'N/A',
        'Accept-Language': parsed['Accept-Language'] || 'N/A',
        'Referer': parsed['Referer'] || 'N/A'
      };
    }
    return {};
  };

  // Тема для JSONTree
  const jsonTheme = {
    scheme: 'monokai',
    author: 'custom',
    base00: '#f5f5f5',
    base01: '#383830',
    base02: '#49483e',
    base03: '#75715e',
    base04: '#a59f85',
    base05: '#333333',
    base06: '#f8f8f2',
    base07: '#f9f8f5',
    base08: '#f92672',
    base09: '#fd971f',
    base0A: '#f4bf75',
    base0B: '#a6e22e',
    base0C: '#a1efe4',
    base0D: '#66d9ef',
    base0E: '#ae81ff',
    base0F: '#cc6633'
  };

  return (
    <Box className="reference-headers">
      {/* Заголовок и управление */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookmarkIcon color="primary" />
            Эталонные записи
            <Chip label={filteredData.length} size="small" color="primary" />
          </Typography>
          <Box>
            <Tooltip title="Обновить">
              <IconButton onClick={fetchReferenceData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Улучшенный поиск */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Поиск по</InputLabel>
              <Select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                label="Поиск по"
              >
                <MenuItem value="all">Все поля</MenuItem>
                <MenuItem value="domain">Домен</MenuItem>
                <MenuItem value="ip">IP адрес</MenuItem>
                <MenuItem value="keyword">Ключевое слово</MenuItem>
                <MenuItem value="device">Устройство</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={
                searchField === 'domain' ? 'Поиск по домену...' :
                searchField === 'ip' ? 'Поиск по IP адресу...' :
                searchField === 'keyword' ? 'Поиск по ключевому слову...' :
                searchField === 'device' ? 'Поиск по устройству...' :
                'Поиск по всем полям...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Состояния загрузки и ошибок */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Список эталонных записей */}
      {!loading && filteredData.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BookmarkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            {searchTerm ? 'Не найдено эталонных записей' : 'Нет эталонных записей'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Отметьте записи как эталонные в основной таблице
          </Typography>
        </Paper>
      )}

      {/* Карточки записей */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredData.map((item) => {
          const headers = parseJSON(item.Headers);
          const jsData = parseJSON(item.JsData);
          const mainHeaders = getMainHeaders(item.Headers);

          return (
            <Accordion
              key={item.OriginalClickID}
              expanded={expandedItems[item.OriginalClickID] || false}
              onChange={handleExpandChange(item.OriginalClickID)}
              elevation={2}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {/* ID и домен */}
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="caption" color="text.secondary">
                      ID: {item.OriginalClickID}
                    </Typography>
                  </Box>
                  
                  {/* Домен */}
                  <Chip
                    icon={<LanguageIcon />}
                    label={item.Domain}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />

                  {/* IP */}
                  <Chip
                    icon={<LocationIcon />}
                    label={item.IP}
                    size="small"
                    variant="outlined"
                  />

                  {/* Устройство */}
                  <Chip
                    icon={getDeviceIcon(item)}
                    label={getDeviceInfo(item)}
                    size="small"
                    color={item.Device === 'm' ? 'warning' : 'info'}
                    variant="outlined"
                  />

                  {/* Браузер */}
                  {item.Browser && (
                    <Chip
                      label={`${item.Browser} ${item.BrowserVersion || ''}`}
                      size="small"
                      variant="outlined"
                    />
                  )}

                  {/* ОС */}
                  {item.OS && (
                    <Chip
                      label={`${item.OS} ${item.OSVersion || ''}`}
                      size="small"
                      variant="outlined"
                    />
                  )}

                  {/* Время */}
                  <Chip
                    icon={<TimerIcon />}
                    label={item.TimeSpent}
                    size="small"
                    variant="outlined"
                  />

                  {/* Эмулятор */}
                  {item.IsEmulator && (
                    <Chip
                      icon={<WarningIcon />}
                      label="Эмулятор"
                      size="small"
                      color="error"
                    />
                  )}

                  {/* Клик */}
                  {item.ClickOnNumber && (
                    <Chip
                      icon={<TouchIcon />}
                      label="Клик"
                      size="small"
                      color="success"
                    />
                  )}

                  {/* Действия */}
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    {/* Кнопка просмотра Headers/JS */}
                    <Tooltip title="Просмотр Headers и JS Data">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(item);
                        }}
                        color="primary"
                      >
                        <CodeIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {/* Кнопка редактирования */}
                    <Tooltip title="Редактировать информацию об устройстве">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(item.OriginalClickID);
                        }}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {editingItem === item.OriginalClickID ? (
                  /* Режим редактирования */
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                        <EditIcon color="primary" />
                        Редактирование информации об устройстве
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Название устройства"
                            value={editedValues.DeviceName}
                            onChange={(e) => handleEditValueChange('DeviceName', e.target.value)}
                            placeholder="iPhone 15 Pro"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Модель устройства"
                            value={editedValues.DeviceModel}
                            onChange={(e) => handleEditValueChange('DeviceModel', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Операционная система"
                            value={editedValues.OS}
                            onChange={(e) => handleEditValueChange('OS', e.target.value)}
                            placeholder="iOS"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Версия ОС"
                            value={editedValues.OSVersion}
                            onChange={(e) => handleEditValueChange('OSVersion', e.target.value)}
                            placeholder="17.0"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Браузер"
                            value={editedValues.Browser}
                            onChange={(e) => handleEditValueChange('Browser', e.target.value)}
                            placeholder="Safari"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Версия браузера"
                            value={editedValues.BrowserVersion}
                            onChange={(e) => handleEditValueChange('BrowserVersion', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Категория устройства</InputLabel>
                            <Select
                              value={editedValues.DeviceCategory}
                              onChange={(e) => handleEditValueChange('DeviceCategory', e.target.value)}
                              label="Категория устройства"
                            >
                              <MenuItem value="">Не указано</MenuItem>
                              <MenuItem value="mobile">Mobile</MenuItem>
                              <MenuItem value="tablet">Tablet</MenuItem>
                              <MenuItem value="desktop">Desktop</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Разрешение экрана"
                            value={editedValues.ScreenResolution}
                            onChange={(e) => handleEditValueChange('ScreenResolution', e.target.value)}
                            placeholder="1920x1080"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Примечания"
                            value={editedValues.Notes}
                            onChange={(e) => handleEditValueChange('Notes', e.target.value)}
                            multiline
                            rows={2}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={editedValues.IsEmulator}
                                onChange={(e) => handleEditValueChange('IsEmulator', e.target.checked)}
                              />
                            }
                            label="Это эмулятор"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={editedValues.IsReference}
                                  onChange={(e) => handleEditValueChange('IsReference', e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <BookmarkIcon sx={{ fontSize: 20 }} />
                                  Эталонная запись
                                </Box>
                              }
                            />
                            {!editedValues.IsReference && (
                              <FormHelperText sx={{ color: 'warning.main', ml: 4 }}>
                                ⚠️ При снятии галочки запись будет удалена из эталонных
                              </FormHelperText>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              onClick={handleCancelEdit}
                              startIcon={<CancelIcon />}
                            >
                              Отмена
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleSaveEdit}
                              startIcon={editedValues.IsReference ? <SaveIcon /> : <BookmarkIcon />}
                              color={editedValues.IsReference ? "primary" : "warning"}
                            >
                              {editedValues.IsReference ? 'Сохранить' : 'Удалить из эталонных'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ) : (
                  /* Режим просмотра */
                  <Grid container spacing={3}>
                    {/* Информация об устройстве */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                            {getDeviceIcon(item)}
                            Информация об устройстве
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Stack spacing={1}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Устройство:
                              </Typography>
                              <Typography variant="body2">
                                {item.DeviceName || getDeviceInfo(item)}
                              </Typography>
                            </Box>
                            
                            {item.DeviceModel && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Модель:
                                </Typography>
                                <Typography variant="body2">
                                  {item.DeviceModel}
                                </Typography>
                              </Box>
                            )}
                            
                            {(item.OS || item.OSVersion) && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  ОС:
                                </Typography>
                                <Typography variant="body2">
                                  {item.OS} {item.OSVersion}
                                </Typography>
                              </Box>
                            )}
                            
                            {(item.Browser || item.BrowserVersion) && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Браузер:
                                </Typography>
                                <Typography variant="body2">
                                  {item.Browser} {item.BrowserVersion}
                                </Typography>
                              </Box>
                            )}
                            
                            {item.ScreenResolution && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Разрешение:
                                </Typography>
                                <Typography variant="body2">
                                  {item.ScreenResolution}
                                </Typography>
                              </Box>
                            )}
                            
                            {item.DeviceCategory && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Категория:
                                </Typography>
                                <Typography variant="body2">
                                  {item.DeviceCategory}
                                </Typography>
                              </Box>
                            )}
                            
                            {item.IsEmulator && (
                              <Alert severity="warning" sx={{ mt: 1 }}>
                                Обнаружен эмулятор
                              </Alert>
                            )}
                            
                            {item.Notes && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  <NotesIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} /> Примечания:
                                </Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                  {item.Notes}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Основная информация */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Основная информация
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Gclid:
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              {item.Gclid || 'N/A'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Keyword:
                            </Typography>
                            <Typography variant="body2">
                              {item.Keyword || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Account ID:
                            </Typography>
                            <Typography variant="body2">
                              {item.AccountID || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Company ID:
                            </Typography>
                            <Typography variant="body2">
                              {item.CompanyID || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Fingerprint:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {item.Fingerprint || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Created:
                            </Typography>
                            <Typography variant="body2">
                              {new Date(item.CreatedAt).toLocaleString('ru-RU')}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Click Coordinates:
                            </Typography>
                            <Typography variant="body2">
                              {item.ClickCoordinates || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Scroll:
                            </Typography>
                            <Typography variant="body2">
                              {item.ScrollCoordinates || 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Основные Headers */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Основные Headers
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {Object.entries(mainHeaders).map(([key, value]) => (
                          <Box key={key} sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {key}:
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Полные Headers */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                          <CodeIcon />
                          Headers (полные)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                          <JSONTree
                            data={headers}
                            theme={jsonTheme}
                            invertTheme={false}
                            hideRoot
                            shouldExpandNode={() => true}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* JS Data */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                          <CodeIcon />
                          JavaScript Data
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                          <JSONTree
                            data={jsData}
                            theme={jsonTheme}
                            invertTheme={false}
                            hideRoot
                            shouldExpandNode={() => true}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Motion Data */}
                  {item.MotionDataRaw && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Motion Data
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <JSONTree
                            data={parseJSON(item.MotionDataRaw)}
                            theme={jsonTheme}
                            invertTheme={false}
                            hideRoot
                            shouldExpandNode={() => true}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
      
      {/* Модальное окно для просмотра Headers и JS Data */}
      <Dialog
        open={detailsDialog.open}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon color="primary" />
            Headers и JavaScript Data
          </Box>
          <IconButton onClick={handleCloseDetails}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {detailsDialog.item && (
            <Grid container spacing={3}>
              {/* Headers */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      HTTP Headers
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                      <JSONTree
                        data={parseJSON(detailsDialog.item.Headers)}
                        theme={jsonTheme}
                        invertTheme={false}
                        hideRoot
                        shouldExpandNode={() => true}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* JS Data */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      JavaScript Data
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                      <JSONTree
                        data={parseJSON(detailsDialog.item.JsData)}
                        theme={jsonTheme}
                        invertTheme={false}
                        hideRoot
                        shouldExpandNode={() => true}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Motion Data если есть */}
              {detailsDialog.item.MotionDataRaw && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Motion Data
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <JSONTree
                        data={parseJSON(detailsDialog.item.MotionDataRaw)}
                        theme={jsonTheme}
                        invertTheme={false}
                        hideRoot
                        shouldExpandNode={() => true}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetails} variant="contained">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReferenceHeaders;