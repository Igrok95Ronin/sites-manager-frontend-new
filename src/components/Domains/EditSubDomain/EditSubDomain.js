import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import './EditSubDomain.scss';
import axios from 'axios';
import Spinner from '../../Spinner/Spinner';
import SnackbarCustom from '../../SnackbarCustom/SnackbarCustom';
import RequestEditSubDomain from '../RequestEditSubDomain/RequestEditSubDomain';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

export default function EditSubDomain({
  editSubDomain,
  showEditSubDomain,
  setShowEditSubDomain,
}) {
  // Запрос для получения данных из конфига
  const request = async () => {
    try {
      // JSON данные для отправки
      const data = {
        domain: editSubDomain,
      };

      const responseDataConfig = await axios.post(
        `${APIURL}/datafromconfig`,
        data,
        {},
      );

      // Возвращаем результат
      return {
        responseDataConfig: responseDataConfig.data,
      };
    } catch (error) {
      console.log(error);
    }
  };

  //   Номер телефона
  const [isPhoneValid, setIsPhoneValid] = React.useState(false); // Валидация номера телефона
  const [phoneNumber, setPhoneNumber] = React.useState('');
  // Данные Конфиг файла
  const [dataConfig, setDataConfig] = React.useState();
  // отправить Запрос Редактирования поддомена
  const [submitSubdomainEditRequest, setSubmitSubdomainEditRequest] =
    React.useState(false);
  // Создаем состояние для отслеживания процесса загрузки данных
  const [loading, setLoading] = React.useState(false);
  // Создаем состояние для хранения ошибок, которые могут возникнуть при запросе
  const [error, setError] = React.useState(null);
  // Создаем состояние для хранения данных, полученных в результате запроса
  const [data, setData] = React.useState(null);

  const handleClose = () => {
    setShowEditSubDomain(false);
  };

  // Получаем данные при монтировании компонента
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await request();
      if (result) {
        setDataConfig(result.responseDataConfig);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Логируем данные конфига только после их получения
  React.useEffect(() => {
    if (dataConfig !== undefined) {
      // Обновляем номер телефона
      if (dataConfig.phoneNumber) {
        setPhoneNumber(dataConfig.phoneNumber);
      }
    }
  }, [dataConfig]);

  React.useEffect(() => {
    if (phoneNumber.trim().length >= 5) {
      setIsPhoneValid(true);
    } else {
      setIsPhoneValid(false);
    }
  }, [phoneNumber]);

  // Функция вызывается при клике на кнопку отправить
  const handleSend = () => {
    if (isPhoneValid) {
      setSubmitSubdomainEditRequest(true);
      setData(null);
      setError(null);
    } else {
      setSubmitSubdomainEditRequest(false);
    }
  };

  return (
    <React.Fragment>
      <Dialog open={showEditSubDomain} onClose={handleClose}>
        <DialogTitle className="editDomain__title" id="alert-dialog-title">
          Редактировать:{' '}
          <span className="editDomain__domainName">{editSubDomain}</span>
        </DialogTitle>
        <DialogContent>
          <Box
            className="editDomain__box"
            component="form"
            sx={{ width: 350 }}
            noValidate
            autoComplete="off"
          >
            <TextField
              className="editDomain__phoneNumber"
              id="standard-basic"
              label="Номер телефона"
              variant="standard"
              required
              value={phoneNumber.trim()}
              onChange={(e) => setPhoneNumber(e.target.value)}
              helperText={
                phoneNumber.trim().length < 5 &&
                'Поле обязательно для заполнения'
              }
              error={phoneNumber.trim().length < 5}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button
            className="editDomain__btnEdit"
            onClick={handleSend}
            autoFocus
          >
            Изменить
          </Button>
        </DialogActions>
      </Dialog>
      {error && <SnackbarCustom data={data} error={error} />}
      {loading && <Spinner loading={loading} />}
      {data && !error && <SnackbarCustom data={data} error={error} />}
      {submitSubdomainEditRequest && phoneNumber.length >= 5 && (
        <RequestEditSubDomain
          submitSubdomainEditRequest={submitSubdomainEditRequest}
          setSubmitSubdomainEditRequest={setSubmitSubdomainEditRequest}
          editSubDomain={editSubDomain}
          phoneNumber={phoneNumber}
          setLoading={setLoading}
          setData={setData}
          setError={setError}
          setShowEditSubDomain={setShowEditSubDomain}
        />
      )}
    </React.Fragment>
  );
}
