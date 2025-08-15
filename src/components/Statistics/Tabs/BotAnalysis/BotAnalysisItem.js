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

  // Получение цвета статуса
  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'BOT': return 'error';
      case 'PROBABLE_BOT': return 'warning';
      case 'SUSPICIOUS': return 'info';
      case 'HUMAN': return 'success';
      default: return 'default';
    }
  }, []);

  // Получение иконки статуса
  const getStatusIcon = useCallback((status) => {
    switch(status) {
      case 'BOT': return <SmartToyIcon />;
      case 'PROBABLE_BOT': return <WarningIcon />;
      case 'SUSPICIOUS': return <SecurityIcon />;
      case 'HUMAN': return <PersonIcon />;
      default: return null;
    }
  }, []);

  // Форматирование процента
  const formatProbability = useCallback((probability) => {
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
            {item.Domain} | {item.IP} | {new Date(item.CreatedAt).toLocaleString('ru-RU')}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Вероятность бота:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatProbability(item.bot_probability)}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      
      {expanded && (
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Основная информация */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Основная информация:</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">Домен: {item.Domain}</Typography>
                <Typography variant="body2">IP: {item.IP}</Typography>
                <Typography variant="body2">Время на сайте: {item.TimeSpent || '0'}</Typography>
                <Typography variant="body2">Устройство: {item.Device === 'c' ? 'Компьютер' : item.Device === 'm' ? 'Мобильный' : item.Device}</Typography>
                <Typography variant="body2">Keyword: {item.Keyword || '-'}</Typography>
                <Typography variant="body2">Account ID: {item.AccountID || '-'}</Typography>
                <Typography variant="body2">Company ID: {item.CompanyID || '-'}</Typography>
                <Typography variant="body2">Fingerprint: {item.Fingerprint ? item.Fingerprint.substring(0, 10) + '...' : '-'}</Typography>
              </Box>
            </Grid>

            {/* Статистика проверок */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Результаты проверок:</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">Общий балл: {item.bot_score}</Typography>
                <Typography variant="body2">Всего проверок: {item.total_checks}</Typography>
                <Typography variant="body2">Провалено проверок: {item.triggered_checks}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(item.triggered_checks / item.total_checks) * 100}
                  color={getStatusColor(item.bot_status)}
                  sx={{ mt: 1, mb: 1 }}
                />
              </Box>
            </Grid>

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