import * as React from 'react';
import axiosInstance from '../../../axiosInstance';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Tooltip from '@mui/material/Tooltip';

import RequestEditDomain from '../RequestEditDomain/RequestEditDomain';
import Spinner from '../../Spinner/Spinner';
import SnackbarCustom from '../../SnackbarCustom/SnackbarCustom';

import './EditDomain.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

export default function EditDomain({
  editDomain,
  showEditDomain,
  setShowEditDomain,
  onUpdateDomains,
}) {
  // Запрос для получения GA и конфига
  const request = async () => {
    try {
      // JSON данные для отправки
      const data = {
        domain: editDomain,
      };

      const [responseGA, responseDataConfig] = await Promise.all([
        axiosInstance.get(`${APIURL}/viewgoogleaccount`),
        axiosInstance.post(`${APIURL}/datafromconfig`, data, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ]);

      // Возвращаем результат
      return {
        responseGA: responseGA.data,
        responseDataConfig: responseDataConfig.data,
      };
    } catch (error) {
      console.log(error);
    }
  };

  // Язык сайта
  const langs = ['de', 'nl', 'cz', 'fr', 'en', 'hu', 'no', 'pl', 'ru'];
  const [siteLanguage, setSiteLanguage] = React.useState('');
  //   Google Accounts
  const [selectedGoogleAccount, setSelectedGoogleAccount] = React.useState(''); // Состояние для выбранного аккаунта
  const [googleAccount, setGoogleAccount] = React.useState([]);
  // Данные Конфиг файла
  const [dataConfig, setDataConfig] = React.useState();
  //   Номер телефона
  const [isPhoneValid, setIsPhoneValid] = React.useState(false); // Валидация номера телефона
  const [visiblePhoneNumber, setVisiblePhoneNumber] = React.useState(''); // Отображаемый номер телефона
  const [phoneNumber, setPhoneNumber] = React.useState('');
  // Used
  const useds = ['yes', 'no'];
  const [used, setUsed] = React.useState('no');
  // отправить Запрос Редактирования домена
  const [sendRequestCreateConfig, setSendRequestCreateConfig] =
    React.useState(false);
  // Создаем состояние для отслеживания процесса загрузки данных
  const [loading, setLoading] = React.useState(false);
  // Создаем состояние для хранения ошибок, которые могут возникнуть при запросе
  const [error, setError] = React.useState(null);
  // Создаем состояние для хранения данных, полученных в результате запроса
  const [data, setData] = React.useState(null);

  // Функция закрытия формы
  const handleClose = () => {
    setShowEditDomain(false);
  };

  // Получаем данные при монтировании компонента
  const fetchData = async () => {
    try {
      setLoading(true); // Включаем спиннер
      const result = await request();
      if (result) {
        setGoogleAccount(result.responseGA); // Сохраняем данные аккаунта
        setDataConfig(result.responseDataConfig); // Сохраняем данные конфига
      }
    } catch (error) {
      setError(error); // Сохраняем ошибку в состоянии
    } finally {
      setLoading(false); // Выключаем спиннер
    }
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Логируем данные конфига только после их получения
  React.useEffect(() => {
    if (dataConfig !== undefined) {
      // Обновляем номер телефона, язык и used из данных конфига
      if (dataConfig.phoneNumber) {
        setVisiblePhoneNumber(dataConfig.visiblePhoneNumber);
        setPhoneNumber(dataConfig.phoneNumber);
        setSiteLanguage(dataConfig.lang);
        // Если конфиг есть то ставим yes
        if (dataConfig.templatePath !== '') {
          setUsed('yes');
        }
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
  const handleClickBtnSendRequestCreateConfig = () => {
    if (isPhoneValid) {
      setSendRequestCreateConfig(true); // Устанавливаем флаг отправки, если телефон валиден
      setData(null);
      setError(null);
    } else {
      setSendRequestCreateConfig(false); // Отключаем отправку, если номер не валиден
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={showEditDomain}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle className="editDomain__title" id="responsive-dialog-title">
          Редактировать:{' '}
          <span className="editDomain__domainName">{editDomain}</span>
        </DialogTitle>
        <DialogContent>
          <Box
            className="editDomain__box"
            component="form"
            sx={{ width: 550 }}
            noValidate
            autoComplete="off"
          >
            {/* Поле Google Acc */}
            <Tooltip
              title={
                used === 'no' &&
                'Что привязать Google Account, необходимо домен привязать к любому шаблону'
              }
              placement="top-end"
              arrow
            >
              <FormControl variant="standard" fullWidth>
                <InputLabel id="demo-simple-select-standard-label">
                  Google Account
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={selectedGoogleAccount} // Убедитесь, что значение — строка
                  onChange={(e) => setSelectedGoogleAccount(e.target.value)}
                  label="Google Account"
                  disabled={used === 'yes' ? false : true}
                >
                  {googleAccount &&
                    googleAccount.map(
                      (acc, i) =>
                        acc.status !== 'blocked' && (
                          <MenuItem key={i} value={acc.account_id}>
                            {`${acc.account_id}(${acc.email})`}
                          </MenuItem>
                        ),
                    )}
                </Select>
              </FormControl>
            </Tooltip>

            {/* Поле Язык сайт */}
            <FormControl variant="standard" fullWidth>
              <InputLabel id="demo-simple-select-standard-label">
                Язык сайт
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={siteLanguage}
                onChange={(e) => setSiteLanguage(e.target.value)}
                label="Язык сайт"
              >
                {langs &&
                  langs.map((lang, i) => (
                    <MenuItem key={i} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Поле Used */}
            <FormControl variant="standard" fullWidth>
              <InputLabel id="demo-simple-select-standard-label">
                Used
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={used}
                onChange={(e) => setUsed(e.target.value)}
                label="Used"
              >
                {useds &&
                  useds.map((use, i) => (
                    <MenuItem key={i} value={use}>
                      {use}
                    </MenuItem>
                  ))}
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

            {/* Поле номер телефона */}
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
          <Button autoFocus onClick={handleClose}>
            Отмена
          </Button>
          <Button
            className="editDomain__btnEdit"
            onClick={handleClickBtnSendRequestCreateConfig}
            autoFocus
          >
            Изменить
          </Button>
        </DialogActions>
      </Dialog>
      {error && <SnackbarCustom data={data} error={error} />}
      {loading && <Spinner loading={loading} />}
      {data && !error && <SnackbarCustom data={data} error={error} />}

      {sendRequestCreateConfig && phoneNumber.length >= 5 && (
        <RequestEditDomain
          sendRequestCreateConfig={sendRequestCreateConfig}
          setSendRequestCreateConfig={setSendRequestCreateConfig}
          domain={editDomain}
          googleAccount={selectedGoogleAccount}
          used={used}
          visiblePhoneNumber={visiblePhoneNumber}
          phoneNumber={phoneNumber}
          siteLanguage={siteLanguage}
          setLoading={setLoading}
          loading={loading}
          setData={setData}
          setError={setError}
          onUpdateDomains={onUpdateDomains}
        />
      )}
    </React.Fragment>
  );
}
