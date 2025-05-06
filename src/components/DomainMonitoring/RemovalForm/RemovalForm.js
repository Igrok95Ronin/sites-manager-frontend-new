import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';

import DeleteIcon from '@mui/icons-material/Delete'; // Иконка удаления

const APIURL = process.env.REACT_APP_APIURL;

export default function RemovalForm({ fetchData }) {
  const [open, setOpen] = useState(false);
  const [securityPassword, setSecurityPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSecurityPassword('');
    setResponseMsg(null);
    setErrorMsg(null);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    setSecurityPassword(sanitizedValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResponseMsg(null);

    try {
      const response = await axios.delete(`${APIURL}/removealldomainsfromtrack`, {
        data: { securityPassword },
      });

      setResponseMsg(response.data);
      setTimeout(() => {
        fetchData();
      }, 3000); // Задержка в 3 секунды перед закрытием диалога
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMsg(error?.response?.data || 'Произошла ошибка при удалении доменов');
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Button sx={{ minWidth: '40px' }} color="error" size="small" onClick={handleOpen}>
        <DeleteIcon />
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="removalForm__title">Удаление всех доменов</DialogTitle>
        <DialogContent>
          <DialogContentText className="removalForm__subTitle">
            Чтобы удалить все домены из отслеживания, введите пароль безопасности.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="security_password"
            name="security_password"
            label="Пароль безопасности"
            type="password"
            fullWidth
            variant="standard"
            value={securityPassword}
            onChange={handleInputChange}
          />
          {loading && <p>Удаление...</p>}
          {responseMsg && <p style={{ color: 'green' }}>{responseMsg}</p>}
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button
            className="removalForm__btnRemove"
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            color="error"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
