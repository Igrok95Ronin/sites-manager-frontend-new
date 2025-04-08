import * as React from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import axiosInstance from '../../../axiosInstance';

export default function AddDomainDialog({ fetchData }) {
  const [open, setOpen] = React.useState(false);
  const [domainName, setDomainName] = React.useState('');
  const [source, setSource] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
    setDomainName('');
    setSource(false);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedDomain = domainName.trim();

    if (!trimmedDomain) {
      setError('Поле не может быть пустым');
      return;
    }

    if (trimmedDomain.length < 5) {
      setError('Некорректная длина домена (минимум 5 символов)');
      return;
    }

    const payload = {
      domainName: trimmedDomain,
      source: source,
    };

    try {
      await axiosInstance.post('/adddomainfortracking', payload);
      handleClose();
      fetchData();
    } catch (err) {
      setError('Ошибка при отправке данных');
      console.error(err);
    }
  };
//   color="primary" | "secondary" | "error" | "info" | "success" | "warning"

  return (
    <React.Fragment>
      <Button variant="contained" color="secondary" size="small" onClick={handleClickOpen}>
        Добавить
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>Добавить домен</DialogTitle>
          <DialogContent sx={{ minWidth: '400px' }}>
            <Typography variant="body2" mb={2}>
              Введите домен, который вы хотите отслеживать:
            </Typography>

            <TextField
              autoFocus
              required
              fullWidth
              margin="dense"
              label="Домен"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              variant="outlined"
            />

            <FormControlLabel
              control={<Checkbox checked={source} onChange={(e) => setSource(e.target.checked)} color="primary" />}
              label="Источник доменов"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button type="submit" variant="contained" fullWidth>
              Отправить
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}
