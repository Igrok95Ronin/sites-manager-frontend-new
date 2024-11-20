import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';

import './CreateSubdomain.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

export default function CreateSubdomain({
  showCreateSubdomain,
  setShowCreateSubdomain,
  domainCreateSubDomain,
  setLoading,
  onUpdateDomains,
  setError,
  setOpen,
}) {
  const [subDomain, setSubDomain] = useState(''); // Локальное состояние для пароля

  const handleClose = () => {
    setShowCreateSubdomain(false);
  };
  // Функция для отправки запроса на сервер
  const request = async (subDomain) => {
    try {
      setLoading(true);
      // const response = await axios.post('http://localhost:8082/addsubdomain', {
      //   domain: domainCreateSubDomain, // Название домена который удаляем
      //   subDomain: subDomain, // Отправляем пароль безопасности
      // });
      const response = await axios.post(`${APIURL}/addsubdomain`, {
        domain: domainCreateSubDomain, // Название домена который удаляем
        subDomain: subDomain, // Отправляем пароль безопасности
      });

      console.log(response.data);
      onUpdateDomains(); // Если удаление прошло успешно то обновляем домены
    } catch (error) {
      setError(error);
      setOpen(true); // Выводит ошибку в сообщении
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Функция обработки отправки формы
  const handleSubmit = (event) => {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    // Вызываем запрос на сервер с паролем безопасности
    request(subDomain);

    // Закрываем диалог после отправки формы
    handleClose();
  };

  // Функция для обработки ввода (удаляет пробелы и спец. символы)
  const handleInputChange = (event) => {
    // Удаляем пробелы и экранируем потенциально опасные символы
    const filteredValue = event.target.value
      .replace(/[^a-zA-Zа-яА-Я0-9.-]/g, '')
      .toLowerCase();
    setSubDomain(filteredValue); // Устанавливаем очищенное значение в состояние
  };

  return (
    <React.Fragment>
      <Dialog
        open={showCreateSubdomain}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle className="createSubDomain__title">
          A запись: .{domainCreateSubDomain}
        </DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here.
            We will send updates occasionally.
          </DialogContentText> */}
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Поддомен"
            type="text"
            fullWidth
            variant="standard"
            value={subDomain}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button className="createSubDomain__btnSend" type="submit">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
