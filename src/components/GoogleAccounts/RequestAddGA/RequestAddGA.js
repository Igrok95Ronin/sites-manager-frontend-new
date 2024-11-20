import { useEffect } from 'react';
import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

const RequestAddGA = ({
  dataToSend,
  setLoading,
  onUpdateGoogleAccounts,
  showRequestAddGA,
  setShowRequestAddGA,
  setData,
  setError,
}) => {
  // Используем хук useEffect для выполнения побочных эффектов, таких как запрос данных
  useEffect(() => {
    if (showRequestAddGA) {
      // Внутри useEffect определяем асинхронную функцию для получения данных
      const fetchData = async () => {
        // Устанавливаем состояние загрузки в true, чтобы отобразить индикатор загрузки
        setLoading(true);

        // Обнуляем состояние ошибки перед новым запросом
        // setError(null);

        try {
          // Выполняем POST-запрос с помощью axios
          // Первый аргумент - URL, на который отправляется запрос
          // Второй аргумент - данные, которые отправляются в теле запроса
          const response = await axios.post(
            // 'http://localhost:8082/addgoogleaccount',
            `${APIURL}/addgoogleaccount`,
            {
              account_id: dataToSend.account_id,
              email: dataToSend.email,
              gtag_id: dataToSend.gtag_id,
              gtag_key: dataToSend.gtag_key,
              status: 'new',
            },
            {
              headers: {
                'Content-Type': 'application/json', // Указываем заголовок, чтобы сервер знал, что данные передаются в формате JSON
              },
            },
          );

          // Если запрос успешен, сохраняем данные из ответа в состоянии 'data'
          console.log(response.data);
          setData(response.data);
          onUpdateGoogleAccounts(); // Обновляем компонент если все прошло успешно
        } catch (error) {
          // Если запрос завершился с ошибкой, сохраняем эту ошибку в состоянии 'error'
          setError(error);
          console.log(error.response.data);
        } finally {
          // Независимо от результата запроса, устанавливаем состояние загрузки в false
          // Это нужно, чтобы скрыть индикатор загрузки
          setLoading(false);
          setShowRequestAddGA(false);
        }
      };
      // Вызываем функцию fetchData для выполнения запроса
      fetchData();
    }
  }, [
    dataToSend,
    setLoading,
    onUpdateGoogleAccounts,
    showRequestAddGA,
    setShowRequestAddGA,
    setData,
    setError,
  ]);
  // Зависимости useEffect: запрос будет выполняться каждый раз, когда изменяются 'googleAccount', 'addNewDomain' или 'siteLanguage'

  // Если ничего из вышеуказанного не выполняется (например, данные еще не загружены), ничего не отображаем
  return null;
};

export default RequestAddGA;
