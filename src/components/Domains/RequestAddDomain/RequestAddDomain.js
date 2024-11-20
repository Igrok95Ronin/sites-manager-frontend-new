import { useEffect } from 'react';
import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

const RequestAddDomain = ({
  googleAccount,
  addNewDomain,
  siteLanguage,
  onRequestComplete,
  sendRequestAddDomain,
  setError,
  setData,
  loading,
  setLoading,
  onUpdateDomains,
}) => {
  // Используем хук useEffect для выполнения побочных эффектов, таких как запрос данных
  useEffect(() => {
    // Отправляем запрос только если sendRequest установлен в true
    if (sendRequestAddDomain && !loading) {
      // Проверяем, чтобы запрос выполнялся только при активном флаге и если запрос не в процессе
      // Внутри useEffect определяем асинхронную функцию для получения данных
      const fetchData = async () => {
        // Устанавливаем состояние загрузки в true, чтобы отобразить индикатор загрузки
        setLoading(true);

        // Обнуляем состояние ошибки перед новым запросом
        setError(null);

        try {
          // Выполняем POST-запрос с помощью axios
          // Первый аргумент - URL, на который отправляется запрос
          // Второй аргумент - данные, которые отправляются в теле запроса
          const response = await axios.post(
            // 'http://localhost:8082/adddomain',
            `${APIURL}/adddomain`,
            {
              adsId: googleAccount, // Здесь ключ 'adsId' соответствует значению переменной 'googleAccount'
              domain: addNewDomain, // Ключ 'domain' содержит значение переменной 'addNewDomain'
              lang: siteLanguage, // Ключ 'lang' содержит значение переменной 'siteLanguage'
            },
            {
              headers: {
                'Content-Type': 'application/json', // Указываем заголовок, чтобы сервер знал, что данные передаются в формате JSON
              },
            },
          );

          // Если запрос успешен, сохраняем данные из ответа в состоянии 'data'
          setData(response.data);
          // onUpdateDomains();
        } catch (error) {
          // Если запрос завершился с ошибкой, сохраняем эту ошибку в состоянии 'error'
          setError(error);
        } finally {
          // Независимо от результата запроса, устанавливаем состояние загрузки в false
          // Это нужно, чтобы скрыть индикатор загрузки
          setLoading(false);
          // FIXME:
          onRequestComplete(); // Вызывается при очистке эффекта
        }
      };
      // Вызываем функцию fetchData для выполнения запроса
      fetchData();
    }
  }, [
    googleAccount,
    addNewDomain,
    siteLanguage,
    onRequestComplete,
    sendRequestAddDomain,
    setError,
    setData,
    loading,
    setLoading,
    onUpdateDomains,
  ]);
  // Зависимости useEffect: запрос будет выполняться каждый раз, когда изменяются 'googleAccount', 'addNewDomain' или 'siteLanguage'

  // Если ничего из вышеуказанного не выполняется (например, данные еще не загружены), ничего не отображаем
  return null;
};

export default RequestAddDomain;
