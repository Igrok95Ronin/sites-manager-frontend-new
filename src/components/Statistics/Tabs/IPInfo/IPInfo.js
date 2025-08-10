import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import SecurityIcon from '@mui/icons-material/Security';

import './IPInfo.scss';
import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

export default function IPInfo({ IP, setFilterIP }) {
  const request = async () => {
    try {
      const response = await axios.post(
        `${APIURL}/ipinfo`,
        {
          ip: IP,
        },
        {},
      );

      // Возвращаем результат
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState(null);

  // Получаем данные при монтировании компонента
  const fetchData = async () => {
    if (!data) {
      try {
        const result = await request();
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    fetchData();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        variant="text"
        size="small"
        sx={{
          textTransform: 'none', // Убираем автоматическое преобразование текста
          whiteSpace: 'nowrap', // Запрещаем перенос текста
        }}
        onClick={handleClickOpen}
      >
        {IP}
      </Button>
      <Tooltip title="Фильтровать по IP">
        <IconButton
           size="small"
           sx={{ ml: 0.5 }}
           onClick={() => {
             if (setFilterIP) {
               setFilterIP(IP);
             }
           }}
         >
          <FilterListIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="ip-dialog-title"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle 
          id="ip-dialog-title"
          sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.1rem',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <PublicIcon />
          IP Информация: {IP}
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {data ? (
            <Box sx={{ p: 3 }}>
              {/* Основная информация */}
              {(data.country || data.region || data.city) && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOnIcon color="primary" fontSize="small" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Геолокация
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {data.country && (
                      <Chip 
                        label={`Страна: ${data.country}`} 
                        variant="outlined" 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {data.region && (
                      <Chip 
                        label={`Регион: ${data.region}`} 
                        variant="outlined" 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {data.city && (
                      <Chip 
                        label={`Город: ${data.city}`} 
                        variant="outlined" 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              {/* Провайдер */}
              {(data.org || data.isp) && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon color="primary" fontSize="small" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Провайдер
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.org && (
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>Организация:</strong> {data.org}
                      </Typography>
                    )}
                    {data.isp && (
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        <strong>Интернет-провайдер:</strong> {data.isp}
                      </Typography>
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              {/* Безопасность */}
              {(data.proxy !== undefined || data.hosting !== undefined) && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SecurityIcon color="primary" fontSize="small" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Безопасность
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {data.proxy !== undefined && (
                      <Chip 
                        label={data.proxy ? 'Прокси: Да' : 'Прокси: Нет'}
                        color={data.proxy ? 'warning' : 'success'}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {data.hosting !== undefined && (
                      <Chip 
                        label={data.hosting ? 'Хостинг: Да' : 'Хостинг: Нет'}
                        color={data.hosting ? 'info' : 'default'}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              {/* Дополнительная информация */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 2 }}>
                  Дополнительно
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {Object.entries(data)
                    .filter(([key]) => !['country', 'region', 'city', 'org', 'isp', 'proxy', 'hosting'].includes(key))
                    .map(([key, value]) => {
                      if (typeof value === 'object' && value !== null) {
                        return (
                          <Box key={key} sx={{ gridColumn: '1 / -1' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
                              {key}:
                            </Typography>
                            <Box sx={{ pl: 2, borderLeft: '3px solid #e0e0e0' }}>
                              {Object.entries(value).map(([nestedKey, nestedValue]) => (
                                <Typography key={nestedKey} variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                                  <strong>{nestedKey}:</strong> {nestedValue !== null ? nestedValue.toString() : 'N/A'}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        );
                      }
                      return (
                        <Typography key={key} variant="body2" sx={{ color: '#666' }}>
                          <strong>{key}:</strong> {value !== null ? value.toString() : 'N/A'}
                        </Typography>
                      );
                    })}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Загрузка данных...
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleClose} 
            variant="contained"
            sx={{ 
              minWidth: 100,
              fontWeight: 600
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
