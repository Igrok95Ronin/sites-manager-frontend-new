import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

export default function ResetCheckedForm({
  resetCheckedForm,
  setResetCheckedForm,
  setError,
  setLoading,
  setCheckedRows,
}) {
  const [securityPassword, setSecurityPassword] = useState(''); // Локальное состояние для пароля

  const handleClose = () => {
    setResetCheckedForm(false);
  };

  // Функция для отправки запроса на сервер
  const request = async (securityPassword) => {
    try {
      setLoading(true);
      // const response = await axios.post('http://localhost:8082/deletedomain', {
      //   domain: domainToDelete, // Название домена который удаляем
      //   securityPassword: securityPassword, // Отправляем пароль безопасности
      // });
      await axios.patch(`${APIURL}/uncheckallmarkedfields`, {
        p_word: securityPassword, // Название домена который удаляем
      });

      //   console.log('Response:', response.data);
      // Закрываем диалог после отправки формы
      handleClose();
      setCheckedRows({});
    } catch (error) {
      setError(error);
      setTimeout(() => {
        setError(null);
      }, 5000);
      //   setOpen(true); // Выводит ошибку в сообщении

      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция обработки отправки формы
  const handleSubmit = (event) => {
    event.preventDefault(); // Останавливаем стандартное поведение формы

    // Вызываем запрос на сервер с паролем безопасности
    request(securityPassword);
    console.log(securityPassword);
  };

  // Функция для обработки ввода (удаляет пробелы и спец. символы)
  const handleInputChange = (event) => {
    const value = event.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, ''); // Убираем все символы, кроме букв и цифр
    setSecurityPassword(sanitizedValue); // Устанавливаем очищенное значение в состояние
  };

  return (
    <React.Fragment>
      <Dialog
        open={resetCheckedForm}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit, // Вызываем функцию handleSubmit при отправке формы
        }}
      >
        <DialogTitle className="removalForm__title">
          Снять все отмеченные чекбоксы
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="removalForm__subTitle">
            Введите проверочное слово "Reset"
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="security_password"
            name="security_password"
            label="Проверочное слово"
            type="text" // Меняем тип на password для скрытия ввода
            fullWidth
            variant="standard"
            value={securityPassword} // Привязываем состояние к полю
            onChange={handleInputChange} // Обрабатываем ввод, фильтруя недопустимые символы
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button className="removalForm__btnRemove" type="submit">
            Выполнить
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
