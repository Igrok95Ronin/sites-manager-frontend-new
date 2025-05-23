import * as React from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Box, IconButton, Tooltip } from '@mui/material';
import DataObjectIcon from '@mui/icons-material/DataObject';

export default function JSONTemplate() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const jsonData = [
    'deutschservice24.at',
    'drpetproject.ru',
    'i-am-ali.store',
    'lock-man.at',
    'lock-man.ch',
    'rohr-man.ch',
    'serrurier-roi.fr',
  ];

  return (
    <>
      <Tooltip title="Показать формат ответа сервера (JSON)">
        <IconButton size="media" color="secondary" onClick={handleClickOpen}>
          <DataObjectIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Формат ответа сервера</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={1}>
            Пример структуры данных, которую должен возвращать сервер:
          </Typography>
          <Box
            sx={{
              backgroundColor: '#f0f0f0',
              p: 2,
              borderRadius: 2,
              fontFamily: 'Roboto Mono, monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 400,
              overflowY: 'auto',
            }}
          >
            {JSON.stringify(jsonData, null, 2)}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
