import { useEffect } from 'react';
import axios from 'axios';

import './RequestEditDomain.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

const RequestEditDomain = ({
  sendRequestCreateConfig,
  setSendRequestCreateConfig,
  domain,
  googleAccount,
  used,
  visiblePhoneNumber,
  phoneNumber,
  siteLanguage,
  setLoading,
  loading,
  setData,
  setError,
  onUpdateDomains,
}) => {
  useEffect(() => {
    if (sendRequestCreateConfig) {
      const fetchData = async () => {
        // Устанавливаем состояние загрузки в true, чтобы отобразить индикатор загрузки
        setLoading(true);

        try {
          // Первый аргумент - URL, на который отправляется запрос
          // Второй аргумент - данные, которые отправляются в теле запроса
          const response = await axios.patch(
            // 'http://localhost:8082/editdomain',
            `${APIURL}/editdomain`,
            {
              domain: domain,
              googleAccount: googleAccount,
              used: used,
              visiblePhoneNumber: visiblePhoneNumber,
              phoneNumber: phoneNumber,
              lang: siteLanguage,
            },
            {
              headers: {
                'Content-Type': 'application/json', // Указываем заголовок, чтобы сервер знал, что данные передаются в формате JSON
              },
            },
          );
          // Если запрос успешен, сохраняем данные из ответа в состоянии 'data'
          setData(response.data);
          onUpdateDomains(); // Обновляем компонент если все прошло успешно
        } catch (error) {
          setError(error);
          console.log(error);
        } finally {
          // Независимо от результата запроса, устанавливаем состояние загрузки в false
          // Это нужно, чтобы скрыть индикатор загрузки
          setLoading(false);
        }
      };
      fetchData();
    }
    setSendRequestCreateConfig(false);
  }, [
    sendRequestCreateConfig,
    setSendRequestCreateConfig,
    domain,
    googleAccount,
    used,
    visiblePhoneNumber,
    phoneNumber,
    siteLanguage,
    setLoading,
    loading,
    setData,
    setError,
    onUpdateDomains,
  ]); // Зависимость позволяет избежать лишних вызовов

  return;
};

export default RequestEditDomain;
