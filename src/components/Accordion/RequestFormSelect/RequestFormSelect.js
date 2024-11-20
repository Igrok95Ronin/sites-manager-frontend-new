import { useEffect } from 'react';
import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига
const XAPIPASSWORD = process.env.REACT_APP_XAPIPASSWORD; // Получем пароль доступа к api

const RequestFormSelect = ({
  setSendRequestCreateConfig,
  sendRequestCreateConfig,
  selectedDomain,
  phoneNumber,
  siteLanguage,
  pathTemplate,
  loading,
  setLoading,
  setData,
  setError,
}) => {
  // Вызываем setSendRequestAddDomain только один раз при монтировании компонента
  useEffect(() => {
    if (sendRequestCreateConfig) {
      const fetchData = async () => {
        // Устанавливаем состояние загрузки в true, чтобы отобразить индикатор загрузки
        setLoading(true);
        try {
          // Выполняем POST-запрос с помощью axios
          // Первый аргумент - URL, на который отправляется запрос
          // Второй аргумент - данные, которые отправляются в теле запроса
          const response = await axios.post(
            // 'http://localhost:8082/createconfig',
            `${APIURL}/createconfig`,
            {
              domain: selectedDomain,
              templatePath: pathTemplate,
              phoneNumber: phoneNumber,
              lang: siteLanguage,
            },
            {
              headers: {
                'X-Api-Password': XAPIPASSWORD, // Устанавливаем заголовок X-Api-Password
                'Content-Type': 'application/json', // Указываем заголовок, чтобы сервер знал, что данные передаются в формате JSON
              },
            },
          );

          // Если запрос успешен, сохраняем данные из ответа в состоянии 'data'
          setData(response.data);
        } catch (error) {
          setError(error);
          console.log(error);
        } finally {
          // Независимо от результата запроса, устанавливаем состояние загрузки в false
          // Это нужно, чтобы скрыть индикатор загрузки
          setLoading(false);
        }
      };
      // Вызываем функцию fetchData для выполнения запроса
      fetchData();
    }
    setSendRequestCreateConfig(false);
  }, [
    sendRequestCreateConfig,
    setSendRequestCreateConfig,
    selectedDomain,
    pathTemplate,
    phoneNumber,
    siteLanguage,
    loading,
    setLoading,
    setData,
    setError,
  ]); // Зависимость позволяет избежать лишних вызовов
};

export default RequestFormSelect;
