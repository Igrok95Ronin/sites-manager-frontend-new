import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import './EditSubDomain.scss';
import axiosInstance from '../../../axiosInstance';
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
        const data = {
          domain: editSubDomain,
        };

const [responseGA, responseDataConfig] = await Promise.all([
  axiosInstance.get(`${APIURL}/viewgoogleaccount`),
  axiosInstance.post(`${APIURL}/datafromconfig`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  }),
]);


        return {
          responseGA: responseGA.data,
          responseDataConfig: responseDataConfig.data,
        };
      } catch (error) {
        console.log(error);
      }
    };

  //   Номер телефона
  const [isPhoneValid, setIsPhoneValid] = React.useState(false); // Валидация номера телефона
  const [visiblePhoneNumber, setVisiblePhoneNumber] = React.useState(''); // Отображаемый номер телефона
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

    // Новые состояния
  const [selectedGoogleAccount, setSelectedGoogleAccount] = React.useState('');
  const [googleAccount, setGoogleAccount] = React.useState([]);
  const [used, setUsed] = React.useState('no'); // Определяет, можно ли выбирать аккаунт


  const handleClose = () => {
    setShowEditSubDomain(false);
  };

  // Получаем данные при монтировании компонента
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await request();
      if (result) {
        setGoogleAccount(result.responseGA); // список аккаунтов
        setDataConfig(result.responseDataConfig); // данные из конфига
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
console.log(dataConfig)
  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Логируем данные конфига только после их получения
  React.useEffect(() => {
    if (dataConfig !== undefined) {
      setVisiblePhoneNumber(dataConfig.visiblePhoneNumber || '');
      setPhoneNumber(dataConfig.phoneNumber || '');

      // Если шаблон есть, считаем used = yes
      if (dataConfig.templatePath !== '') {
        setUsed('yes');
      }

      // Найти Google Account по gtagID
      const foundAcc = googleAccount.find(
        acc => acc.gtag_id === dataConfig.gtagID && acc.status !== 'blocked'
      );
      if (foundAcc) {
        setSelectedGoogleAccount(foundAcc.account_id);
      }
    }
  }, [dataConfig, googleAccount]);


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
            <FormControl variant="standard" fullWidth>
              <InputLabel id="select-ga">Google Account</InputLabel>
              <Select
                labelId="select-ga"
                id="select-ga"
                value={selectedGoogleAccount}
                onChange={(e) => setSelectedGoogleAccount(e.target.value)}
                label="Google Account"
                disabled={used !== 'yes'}
              >
                {googleAccount &&
                  googleAccount.map((acc, i) =>
                    acc.status !== 'blocked' ? (
                      <MenuItem key={i} value={acc.account_id}>
                        {`${acc.account_id} (${acc.email})`}
                      </MenuItem>
                    ) : null
                  )}
              </Select>
            </FormControl>


            {/* Отображаемый номер телефона */}
            <TextField
              id="standard-basic"
              label="Отображаемый номер телефона"
              variant="standard"
              name="visiblePhoneNumber"
              margin="dense"
              type="text"
              value={visiblePhoneNumber}
              onChange={(e) => setVisiblePhoneNumber(e.target.value)}
              helperText={
                visiblePhoneNumber.length < 5 &&
                'Поле обязательно для заполнения'
              }
              required
              error={visiblePhoneNumber.length < 5}
            />

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
          visiblePhoneNumber={visiblePhoneNumber}
          phoneNumber={phoneNumber}
          setLoading={setLoading}
          setData={setData}
          setError={setError}
          setShowEditSubDomain={setShowEditSubDomain}
          googleAccount={selectedGoogleAccount}
        />
      )}
    </React.Fragment>
  );
}
