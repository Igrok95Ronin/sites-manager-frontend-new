import React, { memo, useState, useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Мемоизированный компонент для индикатора
const BotIndicatorItem = memo(({ indicator, onOpenExplanation }) => {
  const handleClick = useCallback(() => {
    onOpenExplanation(indicator);
  }, [indicator, onOpenExplanation]);

  return (
    <Alert
      severity={
        indicator.category === 'CRITICAL' ? 'error' :
        indicator.category === 'HIGH' ? 'warning' :
        indicator.category === 'MEDIUM' ? 'info' : 'success'
      }
      sx={{ mb: 1 }}
      action={
        indicator.detailed_explanation && (
          <Tooltip title="Подробное объяснение">
            <IconButton
              size="small"
              onClick={handleClick}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      }
    >
      <Typography variant="body2" fontWeight="bold">
        {indicator.description} (+{indicator.score} баллов)
      </Typography>
      <Typography variant="caption">
        Обнаружено: {indicator.value} | Ожидалось: {indicator.expected}
      </Typography>
    </Alert>
  );
});

BotIndicatorItem.displayName = 'BotIndicatorItem';

// Мемоизированный компонент для одного элемента анализа
const BotAnalysisItem = memo(({ item, index, onOpenExplanation }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandChange = useCallback((event, isExpanded) => {
    setExpanded(isExpanded);
  }, []);

  // Извлечение информации об эталоне из analysis_report
  const extractReferenceInfo = useCallback((report) => {
    if (!report) return { id: null, name: null, matches: 0, differences: 0 };
    
    // Ищем паттерн "эталоном #ID (название)"
    const refMatch = report.match(/эталоном #(\d+)\s*\(([^)]+)\)/);
    
    // Ищем количество совпадений и расхождений
    const statsMatch = report.match(/Расхождений:\s*(\d+),\s*Совпадений:\s*(\d+)/);
    
    return {
      id: refMatch ? refMatch[1] : null,
      name: refMatch ? refMatch[2] : null,
      differences: statsMatch ? parseInt(statsMatch[1]) : 0,
      matches: statsMatch ? parseInt(statsMatch[2]) : 0
    };
  }, []);

  const referenceInfo = extractReferenceInfo(item.analysis_report);

  // Получение цвета статуса
  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'BOT': return 'error';
      case 'PROBABLE_BOT': return 'warning';
      case 'SUSPICIOUS': return 'info';
      case 'HUMAN': return 'success';
      case 'NO_REFERENCE': return 'default';
      default: return 'primary';
    }
  }, []);

  // Получение иконки статуса
  const getStatusIcon = useCallback((status) => {
    switch(status) {
      case 'BOT': return <SmartToyIcon />;
      case 'PROBABLE_BOT': return <WarningIcon />;
      case 'SUSPICIOUS': return <SecurityIcon />;
      case 'HUMAN': return <PersonIcon />;
      case 'NO_REFERENCE': return <HelpOutlineIcon />;
      default: return null;
    }
  }, []);

  // Форматирование процента
  const formatProbability = useCallback((probability) => {
    if (probability === undefined || probability === null) {
      return 'N/A';
    }
    return `${probability.toFixed(1)}%`;
  }, []);

  return (
    <Accordion 
      key={item.ID || index} 
      className="bot-analysis__item"
      expanded={expanded}
      onChange={handleExpandChange}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          {getStatusIcon(item.bot_status)}
          <Chip 
            label={item.bot_status} 
            color={getStatusColor(item.bot_status)}
            size="small"
          />
          <Typography variant="body2">
            {item.Domain || item.domain} | {item.IP || item.ip} | {new Date(item.CreatedAt || item.created_at).toLocaleString('ru-RU')}
          </Typography>
          
          {/* Информация об эталоне для эталонного анализа */}
          {(item.matched_reference || item.match_percentage !== undefined || referenceInfo.id) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Chip 
                label={`Эталон: ${
                  referenceInfo.name || 
                  item.matched_reference?.device_name || 
                  (referenceInfo.id ? `#${referenceInfo.id}` : 'N/A')
                }`}
                size="small"
                color="secondary"
                variant="outlined"
              />
              {item.match_percentage !== undefined && (
                <Chip 
                  label={`Совпадение: ${formatProbability(item.match_percentage)}`}
                  size="small"
                  color={
                    item.match_percentage >= 85 ? 'success' :
                    item.match_percentage >= 60 ? 'warning' : 'error'
                  }
                />
              )}
            </Box>
          )}
          
          {/* Для обычного анализа показываем вероятность бота */}
          {item.bot_probability !== undefined && !item.matched_reference && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Вероятность бота:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatProbability(item.bot_probability)}
              </Typography>
            </Box>
          )}
          
          {/* Для NO_REFERENCE показываем специальное сообщение */}
          {item.bot_status === 'NO_REFERENCE' && (
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                label="Нет подходящих эталонов"
                size="small"
                color="default"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      </AccordionSummary>
      
      {expanded && (
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Основная информация */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Основная информация:</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">Домен: {item.Domain || item.domain}</Typography>
                <Typography variant="body2">IP: {item.IP || item.ip}</Typography>
                <Typography variant="body2">Время на сайте: {item.TimeSpent || item.time_spent || '0'}</Typography>
                <Typography variant="body2">Устройство: {item.Device === 'c' ? 'Компьютер' : item.Device === 'm' ? 'Мобильный' : item.Device || item.device}</Typography>
                <Typography variant="body2">Keyword: {item.Keyword || item.keyword || '-'}</Typography>
                <Typography variant="body2">Account ID: {item.AccountID || item.account_id || '-'}</Typography>
                <Typography variant="body2">Company ID: {item.CompanyID || item.company_id || '-'}</Typography>
                <Typography variant="body2">Fingerprint: {(item.Fingerprint || item.fingerprint) ? (item.Fingerprint || item.fingerprint).substring(0, 10) + '...' : '-'}</Typography>
              </Box>
            </Grid>

            {/* Статистика проверок */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Результаты проверок:</Typography>
              <Box sx={{ pl: 2 }}>
                {/* Для эталонного анализа показываем информацию об эталоне */}
                {(item.matched_reference || item.reference_device || referenceInfo.id || item.match_percentage !== undefined) ? (
                  <>
                    <Typography variant="body2">Эталон ID: {referenceInfo.id || item.matched_reference?.id || 'N/A'}</Typography>
                    <Typography variant="body2">Эталонное устройство: {referenceInfo.name || item.matched_reference?.device_name || item.reference_device || 'N/A'}</Typography>
                    <Typography variant="body2">Процент совпадения: {formatProbability(item.match_percentage)}</Typography>
                    <Typography variant="body2">Совпадений: {item.matches?.length || referenceInfo.matches || item.matches_count || 0}</Typography>
                    <Typography variant="body2">Расхождений: {item.discrepancies?.length || referenceInfo.differences || item.differences_count || 0}</Typography>
                  </>
                ) : item.bot_status === 'NO_REFERENCE' ? (
                  <Typography variant="body2" color="text.secondary">
                    Нет подходящих эталонов для сравнения
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body2">Общий балл: {item.bot_score || 0}</Typography>
                    <Typography variant="body2">Всего проверок: {item.total_checks || 0}</Typography>
                    <Typography variant="body2">Провалено проверок: {item.triggered_checks || 0}</Typography>
                  </>
                )}
                {item.total_checks > 0 && item.bot_status !== 'NO_REFERENCE' && (
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.triggered_checks / item.total_checks) * 100}
                    color={getStatusColor(item.bot_status) === 'default' ? 'primary' : getStatusColor(item.bot_status)}
                    sx={{ mt: 1, mb: 1 }}
                  />
                )}
              </Box>
            </Grid>

            {/* Расхождения для эталонного анализа */}
            {item.discrepancies && item.discrepancies.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom color="error">
                  Расхождения с эталоном ({item.discrepancies.length}):
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {item.discrepancies.map((discrepancy, idx) => (
                    <Alert severity="error" sx={{ mb: 1 }} key={idx}>
                      <Typography variant="body2">{discrepancy}</Typography>
                    </Alert>
                  ))}
                </Box>
              </Grid>
            )}

            {/* Совпадения для эталонного анализа */}
            {item.matches && item.matches.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom color="success.main">
                  Совпадения с эталоном ({item.matches.length}):
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {item.matches.map((match, idx) => (
                    <Alert severity="success" sx={{ mb: 1 }} key={idx}>
                      <Typography variant="body2">{match}</Typography>
                    </Alert>
                  ))}
                </Box>
              </Grid>
            )}

            {/* Индикаторы бота */}
            {item.bot_indicators && item.bot_indicators.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Сработавшие индикаторы ({item.bot_indicators.length}):
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {item.bot_indicators.map((indicator, idx) => (
                    <BotIndicatorItem
                      key={idx}
                      indicator={indicator}
                      onOpenExplanation={onOpenExplanation}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Все проверенные параметры для эталонного анализа */}
            {item.all_checked_params && item.all_checked_params.length > 0 && (
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Все проверенные параметры ({item.all_checked_params.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {item.all_checked_params.map((param, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Alert 
                            severity={param.match ? 'success' : 'warning'}
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="caption" fontWeight="bold">
                              {param.name}:
                            </Typography>
                            <Typography variant="caption" display="block">
                              Значение: {param.value}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Эталон: {param.reference}
                            </Typography>
                            {param.weight && (
                              <Typography variant="caption" display="block">
                                Вес: {param.weight}%
                              </Typography>
                            )}
                          </Alert>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}

            {/* Детальный отчет */}
            {item.analysis_report && (
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Детальный отчет</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      fontSize: '0.85rem',
                      backgroundColor: '#f5f5f5',
                      padding: '10px',
                      borderRadius: '4px',
                      overflow: 'auto'
                    }}>
                      {item.analysis_report}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      )}
    </Accordion>
  );
});

BotAnalysisItem.displayName = 'BotAnalysisItem';

export default BotAnalysisItem;