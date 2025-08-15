import React, { memo, useState, useCallback, useMemo } from 'react';
import BotAnalysisItem from './BotAnalysisItem';
import { Box, Button, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Мемоизированный компонент для списка с пагинацией
const BotAnalysisList = memo(({ data, onOpenExplanation }) => {
  const [visibleItems, setVisibleItems] = useState(50); // Начальное количество видимых элементов
  const ITEMS_PER_LOAD = 50; // Количество элементов для подгрузки
  
  // Вычисляем, есть ли еще элементы для показа
  const hasMore = useMemo(() => visibleItems < data.length, [visibleItems, data.length]);
  
  // Получаем только видимые элементы
  const displayedData = useMemo(() => data.slice(0, visibleItems), [data, visibleItems]);
  
  // Функция для загрузки еще элементов
  const loadMore = useCallback(() => {
    setVisibleItems(prev => Math.min(prev + ITEMS_PER_LOAD, data.length));
  }, [data.length]);
  
  // Если данных нет
  if (data.length === 0) {
    return null;
  }
  
  return (
    <Box className="bot-analysis__results">
      {/* Рендерим видимые элементы */}
      {displayedData.map((item, index) => (
        <BotAnalysisItem
          key={item.ID || index}
          item={item}
          index={index}
          onOpenExplanation={onOpenExplanation}
        />
      ))}
      
      {/* Кнопка для загрузки еще элементов */}
      {hasMore && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 2, 
          mb: 2,
          p: 2 
        }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            startIcon={<ExpandMoreIcon />}
            sx={{ minWidth: 200 }}
          >
            Показать еще ({data.length - visibleItems} из {data.length})
          </Button>
        </Box>
      )}
      
      {/* Информация о количестве показанных элементов */}
      {!hasMore && data.length > ITEMS_PER_LOAD && (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 2, 
          mb: 2,
          p: 1 
        }}>
          <Typography variant="body2" color="text.secondary">
            Показаны все {data.length} записей
          </Typography>
        </Box>
      )}
    </Box>
  );
});

BotAnalysisList.displayName = 'BotAnalysisList';

export default BotAnalysisList;