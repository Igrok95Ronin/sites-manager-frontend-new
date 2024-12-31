import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { JSONTree } from 'react-json-tree';

export default function AlertDialog({ AcceptLanguage, Headers, Label, Title }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Проверяем, если Headers это строка, парсим её в объект
  const parsedHeaders = React.useMemo(() => {
    try {
      return typeof Headers === 'string' ? JSON.parse(Headers) : Headers;
    } catch (error) {
    //   console.error('Ошибка при парсинге Headers:', error);
      return null;
    }
  }, [Headers]);

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
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden', bgcolor: '#ffffff' }, // Светлая тема
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            bgcolor: '#f5f5f5',
            color: '#333',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            borderBottom: '1px solid #ddd',
          }}
        >
          {Title}
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
          {parsedHeaders ? (
            <JSONTree
              data={parsedHeaders}
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
              shouldExpandNode={(keyPath, data, level) => level < 2} // Раскрывать только первые 2 уровня
            />
          ) : (
            <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
              Не удалось отобразить {Title}. Проверьте данные возможно они пустые.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
