import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';

import RequestAddGA from '../RequestAddGA/RequestAddGA';
import Spinner from '../../Spinner/Spinner';
import SnackbarCustom from '../../SnackbarCustom/SnackbarCustom';

import './FormAddGA.scss';

export default function FormAddGA({
  openForm,
  setOpenForm,
  onUpdateGoogleAccounts,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  // Поле ID аккаунта рекламы
  const [addAccountID, setAddAccountID] = React.useState('');
  // Email аккаунта рекламы
  const [addEmailGA, setAddEmailGA] = React.useState('');
  //   GTAG_ID
  const [addGTAGID, setAddGTAGID] = React.useState('');
  //   GTAG_KEY
  const [addGTAGKEY, setAddGTAGKEY] = React.useState('');

  // Состояние для управления рендерингом `RequestAddGA`
  const [showRequestAddGA, setShowRequestAddGA] = React.useState(false);
  const [dataToSend, setDataToSend] = React.useState(null);

  const [loading, setLoading] = React.useState(false); // Состояние для отслеживания загрузки
  const [error, setError] = React.useState(null); // Создаем состояние для хранения ошибок, которые могут возникнуть при запросе
  const [data, setData] = React.useState(null); // Создаем состояние для хранения данных, полученных в результате запроса

  // Обработчик нажатия кнопки "Добавить"
  const handleClickBtnSendRequestAddGA = () => {
    // Проверяем валидность всех полей
    const isAddAccountIDValid = addAccountID.trim().length >= 12;
    const isAddEmailGAValid = addEmailGA.trim().length >= 12;
    const isAddGTAGIDValid = addGTAGID.trim().length >= 14;
    const isAddGTAGKEYValid = addGTAGKEY.trim().length >= 14;

    if (
      isAddAccountIDValid &&
      isAddEmailGAValid &&
      isAddGTAGIDValid &&
      isAddGTAGKEYValid
    ) {
      setData(null);
      setError(null);
      // Все поля валидны, формируем данные
      const newDataToSend = {
        account_id: addAccountID.trim(),
        email: addEmailGA.trim(),
        gtag_id: addGTAGID.trim(),
        gtag_key: addGTAGKEY.trim(),
      };

      // Устанавливаем данные и отображаем компонент `RequestAddGA`
      setDataToSend(newDataToSend);
      setShowRequestAddGA(true);

      // Закрываем диалоговое окно после успешной отправки
      //   handleClose();
    } else {
      // Если поля не валидны, вы можете показать сообщение об ошибке или оставить функцию пустой
      console.log('Пожалуйста, заполните все поля корректно.');
    }
  };

  // Закрытие формы
  const handleClose = () => {
    setOpenForm(false);
  };

  return (
    <>
      <Box
        component="form"
        sx={{ '& > :not(style)': { width: '100%' } }}
        noValidate
        autoComplete="off"
      >
        <Dialog
          fullScreen={fullScreen}
          open={openForm}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle className="modal-header" id="responsive-dialog-title">
            Добавление аккаунта
          </DialogTitle>
          <DialogContent className="formAddGA__dialogContent">
            {/* Поле ID аккаунта рекламы */}
            <FormControl fullWidth variant="standard">
              <TextField
                autoFocus
                id="standard-basic"
                label="ID аккаунта рекламы"
                variant="standard"
                value={addAccountID.trim()}
                onChange={(e) => setAddAccountID(e.target.value)}
                helperText={
                  addAccountID.trim().length < 12 && 'Пример: 123-456-7890'
                }
                required
                error={addAccountID.trim().length < 12}
              />
            </FormControl>
            {/* Email аккаунта рекламы */}
            <FormControl fullWidth variant="standard">
              <TextField
                autoFocus
                id="standard-basic"
                label="Email аккаунта рекламы"
                variant="standard"
                value={addEmailGA.trim()}
                onChange={(e) => setAddEmailGA(e.target.value)}
                helperText={
                  addEmailGA.trim().length < 12 && 'Пример: yourmail@mail.com'
                }
                required
                error={addEmailGA.trim().length < 12}
              />
            </FormControl>
            {/* GTAG_ID аккаунта рекламы */}
            <FormControl fullWidth variant="standard">
              <TextField
                autoFocus
                id="standard-basic"
                label="GTAG_ID"
                variant="standard"
                value={addGTAGID.trim()}
                onChange={(e) => setAddGTAGID(e.target.value)}
                helperText={
                  addGTAGID.trim().length < 14 && 'Пример: AW-1234567890'
                }
                required
                error={addGTAGID.trim().length < 14}
              />
            </FormControl>
            {/* GTAG_KEY аккаунта рекламы */}
            <FormControl fullWidth variant="standard">
              <TextField
                autoFocus
                id="standard-basic"
                label="GTAG_KEY"
                variant="standard"
                value={addGTAGKEY.trim()}
                onChange={(e) => setAddGTAGKEY(e.target.value)}
                helperText={
                  addGTAGKEY.trim().length < 14 &&
                  'Пример: ABCDIF_61oUDEIqGh9wC'
                }
                required
                error={addGTAGKEY.trim().length < 14}
              />
            </FormControl>
          </DialogContent>

          {/* Кнопка */}
          <DialogActions>
            <Button
              className="formAddGA__btn"
              color="success"
              variant="contained"
              autoFocus
              onClick={handleClickBtnSendRequestAddGA}
            >
              Добавить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Отображаем компонент `RequestAddGA` только после нажатия на кнопку */}
      {showRequestAddGA && (
        <RequestAddGA
          dataToSend={dataToSend}
          setLoading={setLoading}
          onUpdateGoogleAccounts={onUpdateGoogleAccounts}
          showRequestAddGA={showRequestAddGA}
          setShowRequestAddGA={setShowRequestAddGA}
          setData={setData}
          setError={setError}
        />
      )}
      {error && <SnackbarCustom data={data} error={error} />}
      {loading && <Spinner loading={loading} />}
      {data && !error && <SnackbarCustom data={data} error={error} />}
    </>
  );
}
