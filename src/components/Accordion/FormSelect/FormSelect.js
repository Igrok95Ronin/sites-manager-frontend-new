import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import TextField from '@mui/material/TextField';

import RequestFormSelect from '../RequestFormSelect/RequestFormSelect';
import Spinner from '../../Spinner/Spinner';
import SnackbarCustom from '../../SnackbarCustom/SnackbarCustom';

import './FormSelect.scss';

export default function FormSelect({
  showFormSelect,
  setShowFormSelect,
  nameTemplate,
  nameCategory,
  listDomainsAndSubDomains,
}) {
  const langs = ['de', 'nl', 'cz', 'fr', 'en', 'hu', 'no', 'pl', 'ru'];
  const [siteLanguage, setSiteLanguage] = React.useState(langs[0]);
  const [selectedDomain, setSelectedDomain] = React.useState('');
  const [isPhoneValid, setIsPhoneValid] = React.useState(false); // Валидация номера телефона
  const [phoneNumber, setPhoneNumber] = React.useState('111222333');
  const pathTemplate = `templates/${nameCategory}/${nameTemplate}`; // Путь до шаблона
  // Создаем состояние для хранения ошибок, которые могут возникнуть при запросе
  const [error, setError] = React.useState(null);
  // Создаем состояние для хранения данных, полученных в результате запроса
  const [data, setData] = React.useState(null);
  // Создаем состояние для отслеживания процесса загрузки данных
  const [loading, setLoading] = React.useState(false);

  // отправить Запрос Добавить домен
  const [sendRequestCreateConfig, setSendRequestCreateConfig] =
    React.useState(false);

  React.useEffect(() => {
    if (phoneNumber.trim().length >= 5) {
      setIsPhoneValid(true);
    } else {
      setIsPhoneValid(false);
    }
  }, [phoneNumber]);

  // Обновляем selectedDomain, когда данные о доменах появляют
  React.useEffect(() => {
    if (listDomainsAndSubDomains.length > 0) {
      setSelectedDomain(listDomainsAndSubDomains[0]);
    }
  }, [listDomainsAndSubDomains]);

  // Закрытие формы
  const handleClose = () => {
    setShowFormSelect(false);
  };

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
        className="formSelect__dialog"
        open={showFormSelect}
        onClose={handleClose}
      >
        <DialogTitle id="alert-dialog-title" className="formSelect__title">
          <span className="formSelect__namCategory">
            {nameCategory.toUpperCase()}
          </span>{' '}
          : <span className="formSelect__nameTemplate">{nameTemplate}</span>
        </DialogTitle>
        <DialogContent>
          {/* Все что нужно отоброзить поемешать внутри этих тегов */}

          <Box sx={{ width: 300 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel
                variant="standard"
                htmlFor="uncontrolled-native"
                shrink
              >
                Выберите домен
              </InputLabel>
              <NativeSelect
                className="formSelect__nativeSelect"
                inputProps={{
                  name: 'domain',
                  id: 'uncontrolled-native',
                }}
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {listDomainsAndSubDomains &&
                  listDomainsAndSubDomains.map((domain, i) => (
                    <option key={i} value={domain}>
                      {domain}
                    </option>
                  ))}
              </NativeSelect>
            </FormControl>

            <FormControl fullWidth>
              <TextField
                id="standard-basic"
                label="Номер телефона"
                variant="standard"
                name="phoneNumber"
                margin="dense"
                type="text"
                value={phoneNumber.trim()}
                onChange={(e) => setPhoneNumber(e.target.value)}
                helperText={
                  phoneNumber.trim().length < 5 &&
                  'Поле обязательно для заполнения'
                }
                required
                error={phoneNumber.trim().length < 5}
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel
                variant="standard"
                htmlFor="uncontrolled-native-lang"
                // shrink
              >
                Выберите язык
              </InputLabel>
              <NativeSelect
                className="formSelect__nativeSelect"
                inputProps={{
                  name: 'lang',
                  id: 'uncontrolled-native-lang',
                }}
                value={siteLanguage}
                onChange={(e) => setSiteLanguage(e.target.value)}
              >
                {langs &&
                  langs.map((lang, i) => (
                    <option key={i} value={lang}>
                      {lang}
                    </option>
                  ))}
              </NativeSelect>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClickBtnSendRequestCreateConfig}
            disabled={!isPhoneValid}
            variant="contained"
            color="success"
            autoFocus
          >
            Создать
          </Button>
          <Button
            className="formSelect__btnClose"
            onClick={handleClose}
            variant="contained"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      {error && <SnackbarCustom data={data} error={error} />}
      {loading && <Spinner loading={loading} />}
      {data && !error && <SnackbarCustom data={data} error={error} />}
      {/* Отправляем данные на сервер для создания конфига */}
      {sendRequestCreateConfig && phoneNumber.length >= 5 && (
        <RequestFormSelect
          setSendRequestCreateConfig={setSendRequestCreateConfig}
          sendRequestCreateConfig={sendRequestCreateConfig}
          selectedDomain={selectedDomain}
          phoneNumber={phoneNumber}
          siteLanguage={siteLanguage}
          pathTemplate={pathTemplate}
          setLoading={setLoading}
          loading={loading}
          setData={setData}
          setError={setError}
        />
      )}
    </React.Fragment>
  );
}
