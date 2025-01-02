import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { JSONTree } from 'react-json-tree';

import './AlertDialog.scss';

export default function AlertDialog({ AcceptLanguage, Headers, Label, Title, doubleOutput, doubleData }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Преобразуем Headers, чтобы массивы отображались как строки
  const formattedHeaders = React.useMemo(() => {
    try {
      const headers = typeof Headers === 'string' ? JSON.parse(Headers) : Headers;

      // Преобразуем массивы в строки
      const transformedHeaders = Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : value, // Если массив, преобразуем в строку
        ]),
      );

      return transformedHeaders;
    } catch (error) {
      return null;
    }
  }, [Headers]);

  // Преобразуем doubleData, чтобы массивы отображались как строки
  const formattedDoubleData = React.useMemo(() => {
    try {
      const data = typeof doubleData === 'string' ? JSON.parse(doubleData) : doubleData;

      // Преобразуем массивы в строки
      const transformedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : value, // Если массив, преобразуем в строку
        ]),
      );

      return transformedData;
    } catch (error) {
      return null;
    }
  }, [doubleData]);

  // Получаем количество заголовков
  const headersCount = React.useMemo(() => {
    if (formattedHeaders && typeof formattedHeaders === 'object') {
      return Object.keys(formattedHeaders).length;
    }
    return 0;
  }, [formattedHeaders]);

  return (
    <>
      <Button
        variant="text"
        size="small"
        color="primary"
        sx={{
          textTransform: 'none', // Убираем автоматическое преобразование текста
          whiteSpace: 'nowrap', // Запрещаем перенос текста
          justifyContent: 'start',
        }}
        onClick={handleClickOpen}
      >
        {AcceptLanguage || `View ${Label}`}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose} // Добавляем обработку закрытия при клике на фон
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="false"
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden', bgcolor: '#ffffff', maxWidth: '1500px' }, // Светлая тема
        }}
      >
        {doubleOutput ? (
          <>
            <DialogTitle
              id="alert-dialog-title"
              sx={{
                bgcolor: '#f5f5f5',
                color: '#333',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {Title} {headersCount > 0 && `(${headersCount})`}
            </DialogTitle>

            <div className="alertDialog__innerModal">
              <DialogContent
                sx={{
                  bgcolor: '#ffffff',
                  color: '#333',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  padding: '20px',
                }}
              >
                {formattedHeaders ? (
                  <JSONTree
                    data={formattedHeaders}
                    theme={{
                      base00: '#ffffff', // Фон
                      base01: '#f5f5f5',
                      base02: '#e0e0e0',
                      base03: '#bdbdbd',
                      base04: '#9e9e9e',
                      base05: '#333333', // Основной текст
                      base06: '#616161',
                      base07: '#424242',
                      base08: '#d32f2f', // Красный
                      base09: '#f57c00', // Оранжевый
                      base0A: '#fbc02d', // Жёлтый
                      base0B: '#388e3c', // Зелёный
                      base0C: '#0288d1', // Голубой
                      base0D: '#1976d2', // Синий
                      base0E: '#7b1fa2', // Фиолетовый
                      base0F: '#5d4037', // Коричневый
                    }}
                    invertTheme={false} // Светлая тема
                    hideRoot // Убираем root
                  />
                ) : (
                  <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    Не удалось отобразить {Title}. Проверьте данные, возможно, они пустые.
                  </p>
                )}
              </DialogContent>
              <DialogContent
                sx={{
                  bgcolor: '#ffffff',
                  color: '#333',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  padding: '20px',
                }}
              >
                {formattedDoubleData ? (
                  <JSONTree
                    data={formattedDoubleData}
                    theme={{
                      base00: '#ffffff', // Фон
                      base01: '#f5f5f5',
                      base02: '#e0e0e0',
                      base03: '#bdbdbd',
                      base04: '#9e9e9e',
                      base05: '#333333', // Основной текст
                      base06: '#616161',
                      base07: '#424242',
                      base08: '#d32f2f', // Красный
                      base09: '#f57c00', // Оранжевый
                      base0A: '#fbc02d', // Жёлтый
                      base0B: '#388e3c', // Зелёный
                      base0C: '#0288d1', // Голубой
                      base0D: '#1976d2', // Синий
                      base0E: '#7b1fa2', // Фиолетовый
                      base0F: '#5d4037', // Коричневый
                    }}
                    invertTheme={false} // Светлая тема
                    hideRoot // Убираем root
                  />
                ) : (
                  <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    Не удалось отобразить {Title}. Проверьте данные, возможно, они пустые.
                  </p>
                )}
              </DialogContent>
            </div>
          </>
        ) : (
          <>
            <DialogTitle
              id="alert-dialog-title"
              sx={{
                bgcolor: '#f5f5f5',
                color: '#333',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {Title} {headersCount > 0 && `(${headersCount})`}
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  color: '#333',
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                bgcolor: '#ffffff',
                color: '#333',
                fontFamily: 'monospace',
                overflowX: 'auto',
                padding: '20px',
              }}
            >
              {formattedHeaders ? (
                <JSONTree
                  data={formattedHeaders}
                  theme={{
                    base00: '#ffffff', // Фон
                    base01: '#f5f5f5',
                    base02: '#e0e0e0',
                    base03: '#bdbdbd',
                    base04: '#9e9e9e',
                    base05: '#333333', // Основной текст
                    base06: '#616161',
                    base07: '#424242',
                    base08: '#d32f2f', // Красный
                    base09: '#f57c00', // Оранжевый
                    base0A: '#fbc02d', // Жёлтый
                    base0B: '#388e3c', // Зелёный
                    base0C: '#0288d1', // Голубой
                    base0D: '#1976d2', // Синий
                    base0E: '#7b1fa2', // Фиолетовый
                    base0F: '#5d4037', // Коричневый
                  }}
                  invertTheme={false} // Светлая тема
                  hideRoot // Убираем root
                />
              ) : (
                <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  Не удалось отобразить {Title}. Проверьте данные, возможно, они пустые.
                </p>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
