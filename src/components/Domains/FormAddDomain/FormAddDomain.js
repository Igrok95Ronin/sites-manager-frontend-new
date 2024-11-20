import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../../../axiosInstance'; // Используем централизованный экземпляр Axios

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import RequestAddDomain from '../RequestAddDomain/RequestAddDomain';

import './FormAddDomain.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига


// Запрос для получения GA
const request = async () => {
  try {
    const response = await axiosInstance.get(
      // 'http://localhost:8082/viewgoogleaccount',
      `${APIURL}/viewgoogleaccount`,
      {},
      {},
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const FormAddDomain = ({
  onClose,
  // googleAccount,
  // handleChangeGoogleAccount,
  addNewDomain,
  handleChangeAddNewDomain,
  siteLanguage,
  handleChangeSelectSiteLanguage,
  langs,
  onUpdateDomains,
}) => {
  // Создаем состояние для хранения ошибок, которые могут возникнуть при запросе
  const [error, setError] = useState(null);
  // Создаем состояние для хранения данных, полученных в результате запроса
  const [data, setData] = useState(null);
  // Создаем состояние для отслеживания процесса загрузки данных
  const [loading, setLoading] = useState(false);
  //   Google Accounts
  const [selectedGoogleAccount, setSelectedGoogleAccount] = React.useState(''); // Состояние для выбранного аккаунта
  const [googleAccount, setGoogleAccount] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const result = await request(); // Вызываем функцию для получения данных
      setGoogleAccount(result); // Сохраняем данные в состоянии
    };

    fetchData(); // Вызываем асинхронную функцию
  }, []);

  // Показ сообщения при клике на кнопку добавить
  const [state, setState] = React.useState({
    open: false,
    vertical: 'bottom',
    horizontal: 'center',
  });
  const { vertical, horizontal, open } = state;

  const handleClick = () => {
    setState({ ...state, open: true });
  };

  const handleClose = () => {
    setState({ ...state, open: false });
    setError(null); // Очистка ошибки при закрытии Snackbar
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  // отправить Запрос Добавить домен
  const [sendRequestAddDomain, setSendRequestAddDomain] = useState(false);

  // Показать скрыть форму
  const handleClickBtnSendRequestAddDomain = () => {
    setSendRequestAddDomain(true);
    handleClick();
    setData(null);
  };

  const handleRequestComplete = () => {
    setSendRequestAddDomain(false);
  };

  // Создаем ref для модального окна и его заголовка
  const modalRef = useRef(null);
  const headerRef = useRef(null);

  // Состояние для отслеживания, перетаскивается ли сейчас модальное окно
  const [isDragging, setIsDragging] = useState(false);

  // Состояние для хранения смещения курсора при начале перетаскивания
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Состояние для хранения текущей позиции модального окна
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // useEffect выполняется при монтировании компонента, чтобы установить модальное окно по центру
  useEffect(() => {
    // Получаем текущий элемент модального окна
    const modal = modalRef.current;

    // Рассчитываем начальную позицию для центрирования окна по горизонтали
    const initialX = window.innerWidth / 2 - modal.offsetWidth / 2;

    // Рассчитываем начальную позицию для центрирования окна по вертикали
    const initialY = window.innerHeight / 2 - modal.offsetHeight / 2;

    // Устанавливаем начальную позицию модального окна
    setPosition({ x: initialX, y: initialY });
  }, []);

  // Обработчик начала перетаскивания
  const handleMouseDown = (e) => {
    // Получаем ссылки на модальное окно и его заголовок
    const modal = modalRef.current;
    const header = headerRef.current;

    // Проверяем, что клик был именно по заголовку, а не по другим элементам
    if (header.contains(e.target)) {
      // Устанавливаем флаг перетаскивания в true
      setIsDragging(true);

      // Рассчитываем смещение курсора относительно верхнего левого угла модального окна
      setOffset({
        x: e.clientX - modal.getBoundingClientRect().left,
        y: e.clientY - modal.getBoundingClientRect().top,
      });
    }
  };

  // Обработчик перемещения мыши (перетаскивания)
  const handleMouseMove = (e) => {
    // Если идет перетаскивание, обновляем позицию модального окна
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  // Обработчик окончания перетаскивания
  const handleMouseUp = () => {
    // Устанавливаем флаг перетаскивания в false
    setIsDragging(false);
  };

  // Копируем dns записи при клике
  // Создаем массив рефов для двух элементов <p>
  const ns = useRef([React.createRef(), React.createRef()]);

  // Состояние для отображения Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Функция для копирования текста по индексу
  const handleCopy = (index) => {
    if (ns.current[index] && ns.current[index].current) {
      navigator.clipboard
        .writeText(ns.current[index].current.innerText)
        .then(() => {
          // Показать уведомление о копировании
          setOpenSnackbar(true);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  // Функция для закрытия Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div
      className="modal-overlay"
      // Обработка перемещения мыши на всем оверлее (для перетаскивания)
      onMouseMove={handleMouseMove}
      // Обработка отпускания кнопки мыши (завершение перетаскивания)
      onMouseUp={handleMouseUp}
    >
      <div
        ref={modalRef}
        className="modal"
        // Установка текущей позиции модального окна
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        // Обработка начала перетаскивания по нажатию мыши
        onMouseDown={handleMouseDown}
      >
        <div ref={headerRef} className="modal-header">
          <span>Добавление домена</span>
          {/* Кнопка для закрытия модального окна */}
          <button onClick={onClose}>✖</button>
        </div>
        <div className="modal-content">
          {/* Поле ввода, и контент, переданный в children */}
          <Box
            component="form"
            sx={{ '& > :not(style)': { width: '100%' } }}
            noValidate
            autoComplete="off"
          >
            <FormControl fullWidth variant="standard">
              <InputLabel id="demo-simple-select-label">
                Google Account
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedGoogleAccount}
                label="Google Account"
                onChange={(e) => setSelectedGoogleAccount(e.target.value)}
                disabled
              >
                {googleAccount &&
                  googleAccount.map((acc, i) => (
                    <MenuItem key={i} value={acc.account_id}>
                      {`${acc.account_id}(${acc.email})`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              id="standard-basic"
              label="Домен без http и слешей"
              variant="standard"
              value={addNewDomain.trim()}
              onChange={handleChangeAddNewDomain}
              helperText={
                addNewDomain.trim().length < 5 &&
                'Поле обязательно для заполнения'
              }
              required
              error={addNewDomain.trim().length < 5}
            />
            <FormControl fullWidth variant="standard">
              <InputLabel id="demo-simple-select-label">Язык сайта</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={siteLanguage}
                label="Язык сайта"
                onChange={handleChangeSelectSiteLanguage}
              >
                {langs.map((lang, idx) => (
                  <MenuItem key={idx} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack
              className="formAddDomain__btnWrp"
              direction="row"
              spacing={2}
            >
              <Button
                className="formAddDomain__btn"
                variant="contained"
                color="success"
                onClick={handleClickBtnSendRequestAddDomain}
              >
                Добавить
              </Button>
            </Stack>
            {/* Если возникла ошибка выводим его */}
            {error && (
              <Snackbar
                className="formAddDomain__myError"
                anchorOrigin={{ vertical, horizontal }}
                open={open}
                // onClose={handleClose}
                message={error.response.data}
                key={vertical + horizontal}
                action={action}
              />
            )}
            {data && !error && (
              <Tooltip
                title="Кликните на текст чтобы скопировать"
                placement="top-start"
                arrow
              >
                <Stack
                  sx={{ width: '100%' }}
                  spacing={2}
                  className="formAddDomain__mySuccess"
                >
                  <Alert variant="filled" severity="success">
                    <p ref={ns.current[0]} onClick={() => handleCopy(0)}>
                      {data.NS}
                    </p>

                    <p ref={ns.current[1]} onClick={() => handleCopy(1)}>
                      {data.NS2}
                    </p>
                  </Alert>
                  {/* Snackbar для показа сообщения о копировании */}
                  <Snackbar
                    open={openSnackbar}
                    autoHideDuration={2000} // Уведомление закроется через 3 секунды
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Позиционирование по центру
                    message="Текст скопирован в буфер обмена!"
                  />
                </Stack>
              </Tooltip>
            )}
            {loading && <CircularProgress />}
          </Box>
          {/* Отправить данные на сервеер для добавления домена */}
          {sendRequestAddDomain && addNewDomain.length >= 5 && (
            <RequestAddDomain
              googleAccount={selectedGoogleAccount}
              addNewDomain={addNewDomain}
              siteLanguage={siteLanguage}
              sendRequestAddDomain={sendRequestAddDomain}
              onRequestComplete={handleRequestComplete}
              setError={setError}
              setData={setData}
              setLoading={setLoading}
              loading={loading}
              onUpdateDomains={onUpdateDomains}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FormAddDomain;
